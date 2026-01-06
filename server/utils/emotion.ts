
import OpenAI from 'openai';

// Types
export interface EmotionResult {
  label: string;
  score: number;
  adjustedValence: number;
}

// 1. Constants & Maps
const EMOJI_VALENCE: Record<string, number> = {
  "😊": 0.8, "😍": 0.9, "😄": 0.8, "😢": -0.9, "😭": -1.0, 
  "😡": -0.9, "💔": -0.9, "😱": -0.8, "😞": -0.7, "😔": -0.6, 
  "❤️": 0.9, "💗": 0.8, "🤗": 0.7, "🤩": 0.8, "😶": 0.0, 
  "😕": -0.3, "😮‍💨": 0.2
};

const VALENCE: Record<string, number> = {
  "joy": 1.0, "love": 0.9, "gratitude": 0.8, "optimism": 0.7, "admiration": 0.7, 
  "caring": 0.6, "approval": 0.5, "pride": 0.5, "neutral": 0.0, "realization": 0.2, 
  "curiosity": 0.1, "surprise": 0.2, "confusion": -0.2, "remorse": -0.6, 
  "sadness": -0.8, "grief": -0.9, "fear": -0.9, "nervousness": -0.7, 
  "disappointment": -0.6, "anger": -1.0, "disgust": -0.9, "embarrassment": -0.5, 
  "relief": 0.4, "amusement": 0.8, "excitement": 0.9, "desire": 0.7, "annoyance": -0.4
};

// 2. Helper Functions

function keywordFallback(text: string): string {
    const t = text.toLowerCase();
    if (/\b(happy|good|great|awesome|love|like|yay|fun)\b/.test(t)) return "joy";
    if (/\b(sad|bad|cry|depressed|unhappy|lonely|hurt)\b/.test(t)) return "sadness";
    if (/\b(angry|mad|hate|furious|annoyed)\b/.test(t)) return "anger";
    if (/\b(scared|afraid|fear|worry|worried|anxious)\b/.test(t)) return "fear";
    if (/\b(wow|omg|surprise)\b/.test(t)) return "surprise";
    return "neutral";
}

function emojiValenceAdjust(text: string, baseVal: number): number {
  const presentEmojis: string[] = [];
  for (const char of text) {
    if (EMOJI_VALENCE[char] !== undefined) {
      presentEmojis.push(char);
    }
  }

  if (presentEmojis.length === 0) return baseVal;

  const sum = presentEmojis.reduce((acc, e) => acc + (EMOJI_VALENCE[e] || 0), 0);
  const avg = sum / presentEmojis.length;
  
  return 0.7 * baseVal + 0.3 * avg;
}

// 3. Main Functions

export async function detectEmotion(text: string, client: OpenAI): Promise<EmotionResult> {
  const LABELS = Object.keys(VALENCE).join(", ");
  
  const systemPrompt = `
You are an emotion classification API. 
Classify the user's text into ONE of the following emotions: 
[${LABELS}]

Return a JSON object: {"label": "emotion_name", "score": 0.95}
Score should be between 0.0 and 1.0 representing confidence.
If unsure, use "neutral".
  `.trim();

  try {
     const response = await client.chat.completions.create({
        model: "nvidia/llama-3.1-nemotron-nano-8b-v1",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
        ],
        temperature: 0.1,
        max_tokens: 50,
        stream: false
     });

     const content = response.choices[0]?.message?.content?.trim() || "";
     // Simple parsing attempt (robust to markdown code blocks)
     const jsonStr = content.replace(/```json|```/g, "").trim();
     const result = JSON.parse(jsonStr);

     const label = result.label && VALENCE[result.label] !== undefined ? result.label : "neutral";
     const score = typeof result.score === 'number' ? result.score : 0.5;
     
     const baseVal = VALENCE[label] || 0;
     const adjVal = emojiValenceAdjust(text, baseVal);

     return { label, score, adjustedValence: adjVal };

  } catch (e) {
     console.error("[Emotion] LLM Classification failed, using fallback:", e);
     const fallbackLabel = keywordFallback(text);
     const baseVal = VALENCE[fallbackLabel] || 0;
     const adjVal = emojiValenceAdjust(text, baseVal);
     return { label: fallbackLabel, score: 0.4, adjustedValence: adjVal };
  }
}

export function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (/\b(joke|funny|laugh|story|meme|pun)\b/.test(t)) return "fun";
  if (/\b(help|advise|problem|issue|cheated|betray(ed)?|divorce|grief|depress(ed)?|anxious|panic|lonely)\b/.test(t)) return "help";
  if (/\b(why|how|what|when|where|which|who)\b/.test(t)) return "ask";
  return "chat";
}

export function stableEmotionFusion(
  emo: string,
  val: number,
  score: number,
  history: [string, string, number][], // [text, emo, val]
  metaMode: boolean
): [string, number] {
  if (!history || history.length === 0) return [emo, val];

  const prevEmo = history[history.length - 1][1];
  const prevVal = history[history.length - 1][2];
  const delta = Math.abs(val - prevVal);

  // 1. Low confidence -> inherit
  // LLM scores might be consistently high, so we lower the threshold or trust it more.
  // Let's keep 0.5 for now.
  if (score < 0.5) return [prevEmo, prevVal];

  // 2. Sudden change check
  const signChanged = (val > 0 && prevVal < 0) || (val < 0 && prevVal > 0);
  if (delta > 0.6 && signChanged) {
     const fusedVal = 0.7 * prevVal + 0.3 * val;
     // Keep previous emo if previous intensity was higher
     const fusedEmo = Math.abs(prevVal) > Math.abs(val) ? prevEmo : emo;
     return [fusedEmo, fusedVal];
  }

  // 3. Meta mode
  if (metaMode) {
    const fusedVal = 0.95 * prevVal + 0.05 * val;
    return [prevEmo, fusedVal];
  }

  // 4. Normal decay/smoothing
  const fusedVal = 0.6 * prevVal + 0.4 * val;
  return [emo, fusedVal];
}
