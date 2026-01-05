
import { defineEventHandler, readBody, createEventStream } from 'h3';
import OpenAI from 'openai';
import { globalState } from '../../utils/state';
import * as emotionMod from '../../utils/emotion';
import * as agentMod from '../../utils/agent';
import * as ragMod from '../../utils/rag';
import * as metaMod from '../../utils/meta';
import { logEmotionEntry } from '../../utils/logging';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  // Initialize OpenAI (Nvidia) Client
  const client = new OpenAI({
    apiKey: config.public.nvidiaApiKey || process.env.NVIDIA_API_KEY, // Access public or private config
    baseURL: 'https://integrate.api.nvidia.com/v1',
  });

  const body = await readBody(event);
  
  // Adapt to frontend schema ({ messages: [...] }) or fallback to legacy ({ user_input: ... })
  let userInput = "";
  let tone = 0.6;
  let agentOverride = null;
  let messagesHistory: any[] = [];

  if (body.messages && Array.isArray(body.messages)) {
    const msgs = body.messages;
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg.role === 'user') {
        userInput = lastMsg.content;
        messagesHistory = msgs.slice(0, -1);
    } else {
        // Fallback or specific logic if last msg is not user
        userInput = ""; 
    }
  } else {
      userInput = String(body.user_input || "");
      tone = body.tone || 0.6;
      agentOverride = body.agent_override;
      // In this legacy mode, we might use server-side history from globalState
      // But let's stick to stateless assumption for consistency if possible, 
      // or use globalState if history is empty.
      messagesHistory = globalState.getConversation("default_session"); 
  }
  
  const emotionHistory = globalState.getEmotionHistory("default_session");

  const eventStream = createEventStream(event);

  (async () => {
    try {
      if (!userInput.trim()) {
        await eventStream.push(JSON.stringify({ reply_chunk: "", report: "Empty input", is_final: true }));
        await eventStream.close();
        return;
      }

      // 1. Meta Detection
      let metaMode = false;
      const { key: metaKey, meaning: metaMeaning } = metaMod.detectMetaFeedback(userInput);
      if (metaKey) {
        metaMode = true;
        const interpretation = await metaMod.interpretFeedback(userInput, client);
        if (interpretation.reply_length) globalState.userPrefs.reply_length = interpretation.reply_length;
        if (interpretation.tone) globalState.userPrefs.tone = interpretation.tone;
        if (interpretation.positivity) globalState.userPrefs.positivity = interpretation.positivity;
        if (interpretation.empathy_level) globalState.userPrefs.empathy_level = interpretation.empathy_level;
      }

      // 2. Emotion Detection
      const { label: emo, score, adjustedValence: adjValRaw } = await emotionMod.detectEmotion(userInput, client);
      const [finalEmo, finalVal] = emotionMod.stableEmotionFusion(
        emo, adjValRaw, score, emotionHistory, metaMode
      );
      emotionHistory.push([userInput, finalEmo, finalVal]);

      // Trend
      let trend = "stable";
      if (emotionHistory.length >= 2) {
        const diff = emotionHistory[emotionHistory.length - 1][2] - emotionHistory[emotionHistory.length - 2][2];
        if (diff > 0.05) trend = "up";
        else if (diff < -0.05) trend = "down";
      }

      // 3. Intent & Agent
      const intent = emotionMod.detectIntent(userInput);
      let agent = "";
      if (agentOverride && agentMod.AGENTS[agentOverride]) {
        agent = agentOverride;
      } else {
        agent = agentMod.chooseAgentGen3(
            finalEmo, intent, finalVal, score, 
            emotionHistory.length > 1 ? emotionHistory[emotionHistory.length - 2][2] : undefined
        );
      }

      // 4. RAG
      let context = "";
      let color = "#FFB6C1";
      if (agent === "counselor") {
        context = await ragMod.retrieveContext("counsel_agent", userInput, client);
        color = "#ADD8E6";
      } else if (agent === "funny") {
        context = "";
        color = "#FFD580";
      } else {
        context = await ragMod.retrieveContext("empathy_agent", userInput, client);
      }

      // 5. Global Tone
      globalState.emotionMemory.push({ text: userInput, emo: finalEmo, val: finalVal });
      const [toneHint, temp] = globalState.getGlobalToneAndTemp();

      // 6. Build Messages for LLM
      const systemPrompt = agentMod.buildGlobalPersona() + "\n\n" + 
                           agentMod.buildPrompt(agent, context, toneHint);

      const llmMessages = [{ role: "system", content: systemPrompt }];
      llmMessages.push(...messagesHistory); // Add history provided by frontend
      llmMessages.push({ role: "user", content: userInput });

      // Report
      const avgVal = globalState.getAverageEmotion();
      const report = `**Emotion:** ${emo} (${score.toFixed(2)}) | **Trend:** ${trend} | **Agent:** <span style='color:${color}'>${agent}</span> | **Avg Valence:** ${avgVal > 0 ? '+' : ''}${avgVal.toFixed(2)}`;
      
      await eventStream.push(JSON.stringify({ 
        reply_chunk: "", 
        report: report, 
        is_final: false 
      }));

      // 7. Stream LLM
      let fullReply = "";
      try {
        const result = await client.chat.completions.create({
            model: "nvidia/llama-3.1-nemotron-nano-8b-v1",
            messages: llmMessages as any,
            temperature: temp,
            max_tokens: globalState.userPrefs.reply_length === "short" ? 200 : 512,
            stream: true
        });

        for await (const chunk of result) {
            const choice = chunk.choices && chunk.choices[0];
            const content = choice?.delta?.content || "";
            if (content) {
                fullReply += content;
                await eventStream.push(JSON.stringify({ 
                    reply_chunk: fullReply, 
                    report: report, 
                    is_final: false 
                }));
            }
        }
      } catch (err) {
        fullReply += ` [Error: ${err}]`;
        console.error("LLM Error:", err);
      }

      await eventStream.push(JSON.stringify({ 
        reply_chunk: fullReply, 
        report: report, 
        is_final: true 
      }));

      await eventStream.close();

      // 8. Log & Reward
      await logEmotionEntry({
          timestamp: new Date().toISOString(),
          user_input: userInput,
          emotion: finalEmo,
          valence: finalVal,
          trend: trend,
          agent_used: agent,
          ai_reply: fullReply
      });

      if (!metaMode) {
         const prevVal = emotionHistory.length >= 2 ? emotionHistory[emotionHistory.length - 2][2] : 0;
         await agentMod.updateAgentReward(agent, prevVal, finalVal, userInput, fullReply, client);
      } else {
         if (metaKey && metaMeaning) {
            await agentMod.updateAgentMetaFeedback(agent, userInput, metaKey, metaMeaning, client);
         }
      }

      // Update global conversation state just in case we need it fallback
      globalState.getConversation("default_session").push({ role: 'user', content: userInput });
      globalState.getConversation("default_session").push({ role: 'assistant', content: fullReply });

    } catch (e) {
      console.error("[Stream API] Fatal error:", e);
      await eventStream.push(JSON.stringify({ 
        error: String(e), 
        reply_chunk: "Internal Server Error", 
        is_final: true 
      }));
      await eventStream.close();
    }
  })();

  return eventStream.send();
});
