
import OpenAI from 'openai';

interface MetaResult {
  key: string | null;
  meaning: string | null;
}

const META_PATTERNS: Record<string, string> = {
  "shorter": "User prefers shorter replies.",
  "longer": "User prefers longer replies.",
  "too formal": "User prefers a more casual tone.",
  "too casual": "User prefers a more professional tone.",
  "speak slower": "User wants more structured explanations.",
  "more emotional": "User wants richer emotional responses.",
  "less emotional": "User prefers neutral tone.",
};

export function detectMetaFeedback(text: string): MetaResult {
  const t = text.toLowerCase().trim();
  for (const [k, meaning] of Object.entries(META_PATTERNS)) {
    if (t.includes(k)) {
      return { key: k, meaning };
    }
  }
  if (/\b(you|your|model|ai|prompt|too long|not human|why you)\b/.test(t)) {
    return { key: "general_meta", meaning: "User is reflecting about the model or its behavior." };
  }
  return { key: null, meaning: null };
}

export async function interpretFeedback(userInput: string, client: OpenAI): Promise<Record<string, string>> {
  try {
    const prompt = `
You are a feedback analyzer for a conversational AI system.
The user just said: "${userInput}"
Infer what the user is implicitly asking the chatbot to adjust.

Possible feedback dimensions:
- reply_length: short / long / unchanged
- tone: warmer / calmer / more_humorous / unchanged
- positivity: increase / decrease / unchanged
- empathy: increase / decrease / unchanged

Respond with a short valid JSON object only.
Example: {"reply_length":"short","tone":"warmer"}
`;

    const resp = await client.chat.completions.create({
        model: "nvidia/llama-3.1-nemotron-nano-8b-v1",
        messages: [{ role: "user", content: prompt.trim() }],
        temperature: 0.2,
        max_tokens: 100
    });

    const raw = resp.choices[0].message.content?.trim() || "";
    // Extract JSON
    const match = raw.match(/\{.*\}/s);
    if (match) {
        return JSON.parse(match[0]);
    }
    return {};
  } catch (e) {
    console.error(`[Meta] Interpret failed:`, e);
    return {};
  }
}
