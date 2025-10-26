import type { ChatMessage } from '~/types/chat';
import { CHARACTERS } from '~/constants/characters';

/**
 * 获取角色的系统提示词
 */
function getSystemPrompt(characterId: string): string {
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
 * @param history - 消息历史
 * @returns 异步生成器，逐个返回响应文本块
 */
export async function* streamChatMessage(
  characterId: string,
  message: string,
  history: ChatMessage[],
): AsyncGenerator<string, void, unknown> {
  // 构建消息历史
  const messages = [
    {
      role: 'system' as const,
      content: getSystemPrompt(characterId),
    },
    ...history.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user' as const,
      content: message,
    },
  ];

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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      // 解析 SSE 格式或纯文本流
      const lines = chunk.split('\n');
      for (const line of lines) {
        // 处理 SSE 格式 (data: ...)
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              yield content;
            }
          } catch {
            // 忽略解析错误，继续处理下一行
            continue;
          }
        } else if (line.trim()) {
          // 如果是普通文本，直接返回
          yield line;
        }
      }
    }

    // 完成时的最后一个解码
    const finalChunk = decoder.decode();
    if (finalChunk) {
      const lines = finalChunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              yield content;
            }
          } catch {
            continue;
          }
        } else if (line.trim()) {
          yield line;
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
