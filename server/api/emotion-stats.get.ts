import { defineEventHandler, createError } from 'h3';

/**
 * 代理端点：获取情感统计数据
 * 前端 → Nuxt 服务器 → 后端 API
 *
 * 优势：
 * - 避免 CORS 问题
 * - API Key 不暴露给客户端
 * - 可添加服务器端缓存和速率限制
 */

export default defineEventHandler(async (event) => {
  try {
    // @ts-expect-error - Nuxt server auto-import
    const config = useRuntimeConfig(event);
    const backendUrl = config.public.apiUrl ?? config.public.NUXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    const url = `${backendUrl}/api/emotion_stats/today`;

    console.warn('[emotion-stats] Backend URL:', backendUrl);

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
    console.error('Error fetching emotion stats from backend:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch emotion statistics',
    });
  }
});
