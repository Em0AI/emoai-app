import type { ChatMessage } from '~/types/chat';
import { CHARACTERS } from '~/constants/characters';

/**
 * 获取角色的系统提示词
 * 注：不再使用，因为后端自己管理系统提示词
 */
function _getSystemPrompt(characterId: string): string {
  const character = CHARACTERS.find(c => c.id === characterId);
  if (!character) {
    return 'You are a helpful and empathetic AI assistant.';
  }

  return `You are ${character.name}, a ${character.role}. ${character.description}. Be empathetic, supportive, and engaging. Respond in a warm and friendly tone.`;
}

/**
 * 发送消息到后端 API 并处理流式响应
 * @param characterId - 角色 ID
 * @param message - 用户消息
 * @param history - 消息历史（不包括当前用户消息）
 * @returns 异步生成器，逐个返回响应文本块
 */
export async function* streamChatMessage(
  characterId: string,
  message: string,
  history: ChatMessage[],
): AsyncGenerator<string, void, unknown> {
  // Build message history for the API request
  // Note: The backend manages system prompts, so we only send user/assistant history
  const messages = history.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }))
    .concat([
      {
        role: 'user' as const,
        content: message,
      },
    ]);

  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      // Parse server-sent event (SSE) format: data: {...}
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (!data || data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            // Extract reply_chunk from the backend response
            const content = parsed.reply_chunk || '';
            if (content) {
              chunkCount++;
              // Debug: log only every 10th chunk to avoid console spam
              if (chunkCount % 10 === 0) {
                console.warn(`[StreamChat] Chunk ${chunkCount}: ${content.slice(0, 50)}...`);
              }
              yield content;
            }
          } catch {
            // Skip lines that are not valid JSON
            continue;
          }
        }
      }
    }

    // Final decode to catch any remaining data
    const finalChunk = decoder.decode();
    if (finalChunk.trim()) {
      const lines = finalChunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (!data || data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.reply_chunk || '';
            if (content) {
              yield content;
            }
          } catch {
            continue;
          }
        }
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    // 提供诊断信息
    if (errorMsg.includes('Failed to fetch')) {
      console.error('Failed to fetch from /api/chat. Possible causes:');
      console.error('1. Backend API server is not running');
      console.error('2. Network error - Check your internet connection');
      console.error('3. NVIDIA_API_KEY environment variable not set on server');
      console.error('4. NVIDIA API is unreachable from the server');
    }

    console.error('Chat API error:', error);
    throw error;
  }
}

/**
 * 获取简单的非流式回复
 * @param characterId - 角色 ID
 * @param message - 用户消息
 * @param history - 消息历史
 * @returns 完整的回复文本
 */
export async function getChatResponse(
  characterId: string,
  message: string,
  history: ChatMessage[],
): Promise<string> {
  let fullResponse = '';

  for await (const chunk of streamChatMessage(characterId, message, history)) {
    fullResponse += chunk;
  }

  return fullResponse;
}
