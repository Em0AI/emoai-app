import { defineEventHandler, createError } from 'h3';

/**
 * 代理端点：获取完整的情感日志
 * 前端 → Nuxt 服务器 → 后端 API
 *
 * 用途：
 * - 当最新日志超过1天时，用完整日志数据更新缓存
 * - 支持历史数据分析和完整的情感追踪
 */

export default defineEventHandler(async (event) => {
  try {
    // @ts-expect-error - Nuxt server auto-import
    const config = useRuntimeConfig(event);
    const backendUrl = config.public?.NUXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    const url = `${backendUrl}/api/emotion_log`;

    // 调用后端 API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status}`, errorText);
      throw createError({
        statusCode: response.status,
        statusMessage: `Backend API error: ${response.statusText}`,
      });
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching emotion log from backend:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch emotion log',
    });
  }
});
