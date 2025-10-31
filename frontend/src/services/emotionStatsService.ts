// frontend/src/services/emotionStatsService.ts

import { useRuntimeConfig } from "nuxt/app";

export interface EmotionStatsResponse {
  date: string;
  total_entries: number;
  emotion_counts: { [key: string]: number };
  yesterday_counts: { [key: string]: number };
  ai_daily_report: string;
}

/**
 * 获取今天的情感统计数据
 * 注意：后端已启用 CORS，可直接调用后端 API
 */
export async function getEmotionStatsToday(): Promise<EmotionStatsResponse> {
  try {
    const config = useRuntimeConfig();
    const backendBaseUrl = config.public.apiUrl as string;

    if (!backendBaseUrl) {
      throw new Error('Backend API URL not configured in environment');
    }

    const response = await fetch(`${backendBaseUrl}/api/emotion_stats/today`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch emotion stats: ${response.status}`);
    }

    const data: EmotionStatsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching emotion stats:', error);
    throw error;
  }
}
