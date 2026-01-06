import { defineEventHandler, readBody, createError } from 'h3';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';

const nvidia = createOpenAICompatible({
  name: 'nvidia',
  apiKey: process.env.NVIDIA_API_KEY || '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const model = nvidia('nvidia/llama-3.1-nemotron-nano-8b-v1');

export default defineEventHandler(async (event) => {
  try {
    if (!process.env.NVIDIA_API_KEY) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error: NVIDIA_API_KEY is not set',
      });
    }

    const { messages } = await readBody(event);

    if (!Array.isArray(messages) || messages.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request: messages array is required',
      });
    }

    const result = await streamText({
      model,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Chat API] Error:', errorMsg);
    console.error('[Chat API] Details:', error);

    throw createError({
      statusCode: 500,
      statusMessage: `Chat API error: ${errorMsg}`,
    });
  }
});
