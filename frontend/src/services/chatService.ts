import type { ChatMessage } from '~/types/chat';

/**
 * 发送消息到后端 API 并处理流式响应
 * 使用 fetch + ReadableStream 处理 Server-Sent Events (SSE)
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

    // 使用 response 的 body 作为 ReadableStream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    // 逐块读取流
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 解码当前块
      buffer += decoder.decode(value, { stream: true });

      // 按行处理缓冲区
      const lines = buffer.split('\n');

      // 最后一行可能不完整，保留在缓冲区中
      buffer = lines.pop() || '';

      // 处理完整的行
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          // 跳过空行或结束标记
          if (!data || data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            // 从后端响应中提取文本块
            const content = parsed.reply_chunk || '';
            if (content) {
              console.warn(`[streamChatMessage] Yielding chunk: "${content}"`);
              yield content;
            }
          } catch (error) {
            // 跳过无法解析的 JSON 行
            console.warn('[StreamChat] Failed to parse JSON:', line, error);
            continue;
          }
        }
      }
    }

    // 处理最后的缓冲区
    if (buffer.trim()) {
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6).trim();
        if (data && data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data);
            const content = parsed.reply_chunk || '';
            if (content) {
              yield content;
            }
          } catch (error) {
            console.warn('[StreamChat] Failed to parse final JSON:', buffer, error);
          }
        }
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    // 提供诊断信息
    if (errorMsg.includes('Failed to fetch')) {
      console.error('Failed to fetch from /api/chat/stream. Possible causes:');
      console.error('1. Frontend API server is not running');
      console.error('2. Network error - Check your internet connection');
      console.error('3. Backend server is not responding');
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
