
import { globalState } from './state';
import OpenAI from 'openai';

// Interfaces
interface AgentSpec {
  role: string;
  objective: string;
  tone: string;
  avoid: string;
}

export const AGENTS: Record<string, AgentSpec> = {
  "empathetic": {
    role: "kind listener",
    objective: "reply with gentle understanding and short, natural sentences",
    tone: "soft and conversational",
    avoid: "therapy clichés or exaggerated sympathy"
  },
  "counselor": {
    role: "empathetic listener",
    objective: " without judging or fixing",
    tone: "warm, calm, and genuine",
    avoid: "giving advice or framing emotions as problems to solve"
  },
  "funny": {
    role: "friendly mood-lifter",
    objective: "add brief, harmless humor that fits the moment",
    tone: "light and spontaneous",
    avoid: "personal teasing or heavy sarcasm"
  }
};

// Utils for Math
function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}

function weightedRandomChoice(items: string[], probs: number[]): string {
  if (items.length !== probs.length) throw new Error("Items and probabilities must have same length");
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += probs[i];
    if (rand < cumulative) return items[i];
  }
  return items[items.length - 1];
}

// 1. Build Global Persona
export function buildGlobalPersona(): string {
  const { tone, reply_length, positivity, empathy_level } = globalState.userPrefs;

  return `
[Global User Persona Settings]
The user prefers replies that are:
- Tone: ${tone}
- Length: ${reply_length}
- Positivity: ${positivity}
- Empathy level: ${empathy_level}

Always adapt your replies to maintain this personality baseline,
even when switching between different agents.

When generating responses:
- Use 1 to 3 short sentences only.
- Speak as a human would in casual conversation, not as an assistant or narrator.

When the user confesses a secret, guilt, or deception,
do NOT praise them or offer advice.
Acknowledge the weight of what they said,
and reflect the underlying emotion with empathy and realism.
Avoid repeating empathy formulas like "I understand," "you're not alone," or "it's okay to…".
When expressing support, vary structure and tone.
Permit pauses, uncertainty, or silence instead of reassurance.
Do not include parenthetical comments, meta notes, or self-references (e.g., 'Note: …', 'I followed...').
CRITICAL: Output ONLY the spoken response. Do NOT explain your response.
`.trim();
}

// 2. Build Prompt
export function buildPrompt(
  agentName: string, 
  context: string, 
  globalToneHint: string = "neutral"
): string {
  const spec = AGENTS[agentName];
  const prefs = globalState.userPrefs;

  // Pref override hint
  const toneAdjust = prefs.tone;
  const lengthPref = prefs.reply_length;
  const posOverride = prefs.positivity;

  let prefHint = "";
  if ([toneAdjust, lengthPref, posOverride].some(v => v !== "unchanged" && v !== "neutral and gentle" && v !== "medium" && v !== "balanced")) { 
     // Simplistic check, logic slightly different from Python but intent is "if changed"
     // Python: any(v != "unchanged") -> but user_prefs doesn't default to "unchanged" for all.
     // I'll stick to Python's strict check if I followed it exactly, but user_prefs defaults are real values.
     // Python Code: if any(v != "unchanged" for v in [tone_adjust, length_pref, positivity]):
     // But defaults are "neutral and gentle", "medium", "balanced". So "unchanged" likely comes from 'meta update' or explicitly set to valid values.
     // In Python code, defaults are real strings. So this block in Python possibly never ran unless interpreter set them to "unchanged"? 
     // Wait, interpret_feedback sets specific values. If it sets "unchanged"? No, it sets "short", "formal".
     // Actually the Python code default user_prefs had "neutral and gentle".
     // Only if they CHANGED them? No, the Python code checked if they are NOT "unchanged". "neutral and gentle" IS NOT "unchanged". 
     // So this block ALWAYS runs in Python if variable is not "unchanged".
     // Wait, let's look at Python logic:
     // tone_adjust = prefs.get("tone", "unchanged") -> returns value in dict OR "unchanged" if missing.
     // Dict HAS "tone". So it returns "neutral and gentle".
     // "neutral and gentle" != "unchanged" -> True.
     // So the hint is added.
     prefHint = `
[User Preference Override]
The user prefers the following adjustments:
- Tone → ${toneAdjust}
- Reply length → ${lengthPref}
- Positivity → ${posOverride}
Please adapt your language style accordingly, while keeping consistency with your current role and goal.
`;
  }

  let guardrails = `
[Behavioral Guardrails]
- Mirror the user's vibe. If cheerful/playful, NEVER apologize or show pity.
- If neutral, stay warm and concise.
- If mildly negative but not asking for help, be supportive without being clinical.
`;
  if (agentName === "counselor") {
    guardrails += `
- Validate pain ONLY if distress/help is explicit.
- Do NOT invent or assume specific details about the user's situation.
- Offer up to 3 concrete, small next steps max.
`;
  }
  if (agentName === "funny") {
    guardrails += `
- Keep jokes short and gentle; never target the user; avoid sensitive topics.
`;
  }

  // Reflection
  let reflection = "";
  const feedbackList = globalState.agentFeedbackMemory[agentName] || [];
  if (feedbackList.length > 0) {
    const recent = feedbackList.slice(-3);
    reflection = `\nRecent feedback about your replies:\n` + recent.map(m => `- ${m}`).join("\n");
  }

  return `
You are a ${spec.role}.
Your goal is to ${spec.objective}.
Maintain a ${spec.tone} tone (global tone hint: ${globalToneHint}).
Avoid ${spec.avoid}.

${reflection}

${prefHint}

${guardrails}

[Retrieved Context]
${context}

Always comply with [User Preference Override], [Behavioral Guardrails], and your recent feedback.
IMPORTANT: Do NOT output any "Note:", "Explanation:", or parenthesis explaining your tone. Just speak.
`.trim();
}

// 3. Choice Logic
export function chooseAgentGen3(
  emo: string, 
  intent: string, 
  val: number, 
  score: number, 
  prevVal?: number
): string {
  const negative = new Set(["sadness","fear","anger","disgust","grief","remorse","disappointment","nervousness"]);
  
  if (intent === "help" || (negative.has(emo) && val < -0.6 && score > 0.7)) {
    return "counselor";
  }
  if (intent === "fun") {
    return "funny";
  }

  const names = Object.keys(globalState.agentScores);
  const logits = names.map(n => globalState.agentScores[n]);

  // Adjust logits
  const tilt = names.map(n => {
    if (n === "empathetic" && val >= 0) return 0.10;
    if (n === "counselor" && val < 0) return 0.10;
    if (n === "funny" && val >= 0.2) return 0.05;
    return 0.0;
  });

  const adjustedLogits = logits.map((l, i) => l + tilt[i]);
  const probs = softmax(adjustedLogits);
  
  return weightedRandomChoice(names, probs);
}

// 4. Update Logic
export async function updateAgentReward(
  agent: string, 
  prevVal: number, 
  newVal: number, 
  userInput: string, 
  lastReply: string,
  client: OpenAI
) {
  const delta = newVal - (prevVal || 0);
  if (Math.abs(delta) < 0.05) return;

  let feedbackPrompt = "";
  if (delta > 0) {
    feedbackPrompt = `
The user's emotional state improved after your last message.
User said: "${userInput}"
Your reply was: "${lastReply}"
Describe in one concise sentence what you did well, so you can repeat it next time.
`;
  } else {
     feedbackPrompt = `
The user's emotional state got worse or stayed negative after your last message.
User said: "${userInput}"
Your reply was: "${lastReply}"
Describe in one concise sentence what to avoid next time to prevent emotional decline.
`;
  }

  try {
    const res = await client.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-nano-8b-v1",
      messages: [{ role: "user", content: feedbackPrompt.trim() }],
      temperature: 0.3,
      max_tokens: 80
    });
    const feedback = res.choices[0].message.content?.trim();
    if (feedback) {
      globalState.agentFeedbackMemory[agent].push(feedback);
      console.log(`[Agent Reward] ${agent} feedback -> ${feedback}`);
    }
  } catch (e) {
    console.error(`[Agent Reward] Feedback gen failed:`, e);
  }
}

export async function updateAgentMetaFeedback(
  agent: string, 
  userInput: string,
  metaKey: string,
  metaMeaning: string,
  client: OpenAI
) {
  const prompt = `
The user provided feedback about your behavior: "${userInput}"
This feedback implies: "${metaMeaning}" (Keyword: ${metaKey})

Based on this, describe in one concise sentence a specific action you should take or avoid in the future to better meet the user's preference. Start your sentence with "I should..." or "I will try to...".
Example: If user said "too long", you might say "I should provide more concise answers."
Example: If user said "too formal", you might say "I will try to use a friendlier tone."
`;

  try {
    const res = await client.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-nano-8b-v1",
      messages: [{ role: "user", content: prompt.trim() }],
      temperature: 0.3,
      max_tokens: 60
    });
    let fb = res.choices[0].message.content?.trim() || "";
    
    // Formatting
    fb = fb.replace(/^["']|["']$/g, '');
    if (!fb.toLowerCase().startsWith("i should") && !fb.toLowerCase().startsWith("i will")) {
        fb = "I should " + fb;
    }
    fb = "📝 [Meta Feedback] " + fb.charAt(0).toUpperCase() + fb.slice(1);
    fb = fb.split('.')[0] + '.';

    globalState.agentFeedbackMemory[agent].push(fb);
    console.log(`[Meta] Success: ${fb}`);

  } catch(e) {
    console.error(`[Meta] Failed:`, e);
  }
}
