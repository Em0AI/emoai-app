import { defineEventHandler, readBody, createError, setResponseHeader } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    // @ts-expect-error - Nuxt server auto-import
    const config = useRuntimeConfig(event);
    const body = await readBody(event);
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request: messages array is required',
      });
    }

    // Extract user input from the last message in history
    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage?.role === 'user' ? lastMessage.content : '';

    if (!userInput) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request: No user input found in the last message.',
      });
    }

    // Extract optional parameters from request body or use defaults
    const tone = body.tone || 0.6;
    const agent_override = body.agent_override || 'default';
    const session_id = body.session_id || `session-${Date.now()}`;

    // Get the backend API URL from config
    const backendBaseUrl = config.public.apiUrl;

    console.warn('[Chat Stream API] Backend URL:', backendBaseUrl);
    console.warn('[Chat Stream API] Full request URL:', `${backendBaseUrl}/api/chat/stream`);

    // Forward the request to the backend streaming API with the correct format
    const apiResponse = await fetch(`${backendBaseUrl}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        user_input: userInput,
        tone,
        agent_override,
        session_id,
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`Error from local AI API: ${errorText}`);
      throw createError({
        statusCode: apiResponse.status,
        statusMessage: `Error from local AI API: ${apiResponse.statusText}`,
      });
    }

    // Set the response headers to indicate a streaming response
    setResponseHeader(event, 'Content-Type', 'text/event-stream');
    setResponseHeader(event, 'Cache-Control', 'no-cache');
    setResponseHeader(event, 'Connection', 'keep-alive');

    // Return the stream body from the local API directly to the client
    return apiResponse.body;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Chat Stream API] Error:', errorMsg);

    // Avoid logging the full error object if it's an H3 error, as it's verbose
    if (!(error && typeof error === 'object' && 'statusCode' in error)) {
      console.error('[Chat Stream API] Details:', error);
    }

    // Re-throw H3 errors directly
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Chat stream error: ${errorMsg}`,
    });
  }
});
