
import { defineEventHandler } from 'h3';
import OpenAI from 'openai';
import { readEmotionLog } from '../../utils/logging';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new OpenAI({
    apiKey: config.nvidiaApiKey || process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
  });

  const logs = await readEmotionLog();
  
  // Dates (using local time YYYY-MM-DD)
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const yesterdayStr = yesterdayDate.toLocaleDateString('en-CA');

  const todayLogs = logs.filter(l => l.timestamp.startsWith(todayStr));
  const yesterdayLogs = logs.filter(l => l.timestamp.startsWith(yesterdayStr));

  // Stats
  const countEmotions = (entries: typeof logs) => {
      const stats: Record<string, number> = {};
      entries.forEach(e => {
          const emo = e.emotion || "unknown";
          stats[emo] = (stats[emo] || 0) + 1;
      });
      return stats;
  };

  const todayStats = countEmotions(todayLogs);
  const yesterdayStats = countEmotions(yesterdayLogs);

  // Compare
  let compareText = "";
  if (yesterdayLogs.length > 0) {
      const diff: string[] = [];
      const keys = new Set([...Object.keys(todayStats), ...Object.keys(yesterdayStats)]);
      keys.forEach(k => {
          const d = (todayStats[k] || 0) - (yesterdayStats[k] || 0);
          diff.push(`${k} ${d >= 0 ? '+' : ''}${d}`);
      });
      const yestStr = Object.entries(yesterdayStats).map(([k,v]) => `${k}: ${v}`).join(", ");
      compareText = `Yesterday's emotion counts: ${yestStr}\nChange summary: ${diff.join(", ")}`;
  } else {
      compareText = "No emotion data is available for yesterday; please analyze today's data only.";
  }

  const emotionSummaryText = Object.entries(todayStats).map(([k,v]) => `${k}: ${v}`).join(", ") || "no data";

  const prompt = `
Today is ${todayStr}.
Today's emotion counts: ${emotionSummaryText}
${compareText}

Write a structured emotional daily report in the following format:

YYYY/MM/DD
Today's Mood Keywords
<3–5 emotion keywords derived from today's dominant emotions>

Emotion Trend
<describe changes if yesterday's data is available; 
if yesterday is missing, acknowledge that and focus on today's emotions>

Emotional Summary
<brief description of today's emotional pattern>

AI Observation
<1–2 sentences interpreting what today's emotions suggest about the user's mindset>

Healing Exercise
<one small, gentle self-care suggestion>

AI's Message
<2–3 sentences written like a kind, human message, no signature>

Tone: warm, natural, and empathetic.
Write in English.
Keep each section under 3 sentences.
`;

  let aiReport = "";
  try {
      const res = await client.chat.completions.create({
          model: "nvidia/llama-3.1-nemotron-nano-8b-v1",
          messages: [{ role: "user", content: prompt.trim() }],
          temperature: 0.6,
          max_tokens: 420
      });
      aiReport = res.choices[0].message.content?.trim() || "No report generated.";
  } catch (e) {
      aiReport = `[Error generating report: ${e}]`;
  }

  return {
      date: todayStr,
      total_entries: todayLogs.length,
      emotion_counts: todayStats,
      yesterday_counts: yesterdayStats,
      ai_daily_report: aiReport
  };
});
