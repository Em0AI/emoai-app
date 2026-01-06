/**
 * 情感数据缓存管理 composable
 *
 * 新策略（简化版）：
 * 1. emotion_today - 当天数据（每次都从后端获取最新）
 * 2. emotion_all - 历史所有日期数据（从 public/emotion_all.json 读取）
 * 3. 应用启动时和手动调用时都会获取最新当天数据
 * 4. ai_daily_report 在获取时就结构化为对象，便于使用
 */

import { ref, readonly } from 'vue';

/**
 * AI 每日报告的结构化格式
 */
export interface AiDailyReport {
  moodKeywords: string;
  trend: string;
  summary: string;
  observation: string;
  exercise: string;
  message: string;
}

/**
 * 后端 API 返回的每日情感统计格式
 */
interface EmotionStatsDay {
  date: string;
  total_entries: number;
  emotion_counts: Record<string, number>;
  yesterday_counts: Record<string, number>;
  ai_daily_report: string;
}

/**
 * 扩展的情感统计数据（包含结构化的 ai_daily_report）
 */
export interface EmotionStatsDayExtended extends EmotionStatsDay {
  parsedReport: AiDailyReport;
}

/**
 * 解析 ai_daily_report 字符串为结构化对象
 */
function parseAiDailyReport(reportText: string): AiDailyReport {
  const lines = reportText.split('\n').filter(l => l.trim());

  let moodKeywords = '';
  let trend = '';
  let summary = '';
  let observation = '';
  let exercise = '';
  let message = '';

  for (const line of lines) {
    if (line.includes('Mood Keywords')) {
      moodKeywords = line.replace(/Today's Mood Keywords:|Mood Keywords:/i, '').trim();
    } else if (line.includes('Trend:')) {
      trend = line.replace(/Emotion Trend:/i, '').trim();
    } else if (line.includes('Summary:')) {
      summary = line.replace(/Emotional Summary:/i, '').trim();
    } else if (line.includes('Observation:')) {
      observation = line.replace(/AI Observation:/i, '').trim();
    } else if (line.includes('Exercise:')) {
      exercise = line.replace(/Healing Exercise:/i, '').trim();
    } else if (line.includes('Message:')) {
      message = line.replace(/AI's Message:/i, '').trim();
    }
  }

  return {
    moodKeywords: moodKeywords || 'N/A',
    trend: trend || 'N/A',
    summary: summary || 'N/A',
    observation: observation || 'N/A',
    exercise: exercise || 'N/A',
    message: message || 'N/A',
  };
}

export function useEmotionDataCache() {
  const emotionToday = ref<EmotionStatsDayExtended | null>(null);
  const emotionAll = ref<Record<string, EmotionStatsDayExtended>>({});
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * 从公共目录读取 JSON 文件
   */
  async function loadJsonFile<T>(filename: string): Promise<T | null> {
    try {
      const response = await fetch(`/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`[useEmotionDataCache] Failed to load ${filename}:`, err);
      return null;
    }
  }

  /**
   * 获取当天最新数据（每次都从后端获取）
   * 失败时降级到本地缓存
   */
  async function fetchTodayEmotionStats(): Promise<EmotionStatsDayExtended | null> {
    try {
      console.warn('[useEmotionDataCache] Fetching latest emotion_stats/today from backend...');
      const response = await fetch('https://unamalgamable-acknowledgedly-hedy.ngrok-free.dev/api/emotion_stats/today', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json() as EmotionStatsDay;
      const extended: EmotionStatsDayExtended = {
        ...data,
        parsedReport: parseAiDailyReport(data.ai_daily_report),
      };
      console.warn('[useEmotionDataCache] ✅ Fetched latest today data:', data.date, 'entries:', data.total_entries);
      return extended;
    } catch (err) {
      console.warn('[useEmotionDataCache] ⚠️ Failed to fetch today stats (will use local cache):', err);
      // 降级到本地缓存
      return emotionToday.value || null;
    }
  }

  /**
   * 保存数据到本地 localStorage（可选）
   */
  async function persistToPublic() {
    try {
      console.warn('[useEmotionDataCache] Persisting to localStorage...');

      if (typeof window !== 'undefined') {
        if (emotionToday.value) {
          localStorage.setItem('emotion_today', JSON.stringify(emotionToday.value));
        }
        localStorage.setItem('emotion_all', JSON.stringify(emotionAll.value));
        console.warn('[useEmotionDataCache] ✅ Saved to localStorage');
      }
    } catch (err) {
      console.warn('[useEmotionDataCache] ⚠️ Failed to persist:', err);
    }
  }

  /**
   * 初始化：加载历史数据和当天数据
   * 优先级：后端当天数据 > 本地emotion_today.json > 空
   */
  async function initializeData() {
    isLoading.value = true;
    error.value = null;

    try {
      console.warn('[useEmotionDataCache] Initializing...');

      // 1. 加载历史数据（emotion_all.json）
      const loadedAll = await loadJsonFile<Record<string, EmotionStatsDay>>('emotion_all.json');
      if (loadedAll) {
        // 转换为 ExtendedVersion，添加 parsedReport
        const extendedAll: Record<string, EmotionStatsDayExtended> = {};
        Object.entries(loadedAll).forEach(([date, data]) => {
          extendedAll[date] = {
            ...data,
            parsedReport: parseAiDailyReport(data.ai_daily_report),
          };
        });
        emotionAll.value = extendedAll;
        console.warn('[useEmotionDataCache] ✅ Loaded emotion_all.json with', Object.keys(loadedAll).length, 'dates');
      } else {
        console.warn('[useEmotionDataCache] ⚠️ No emotion_all.json found');
      }

      // 2. 尝试从后端获取最新当天数据
      const latestToday = await fetchTodayEmotionStats();
      if (latestToday) {
        emotionToday.value = latestToday;
        emotionAll.value[latestToday.date] = latestToday;
        console.warn('[useEmotionDataCache] ✅ Updated emotion_today with backend data');
      } else {
        // 3. 后备方案：加载本地当天数据
        const cachedToday = await loadJsonFile<EmotionStatsDay>('emotion_today.json');
        if (cachedToday) {
          const extended: EmotionStatsDayExtended = {
            ...cachedToday,
            parsedReport: parseAiDailyReport(cachedToday.ai_daily_report),
          };
          emotionToday.value = extended;
          console.warn('[useEmotionDataCache] ✅ Using local emotion_today.json as fallback');
        } else {
          console.warn('[useEmotionDataCache] ⚠️ No emotion_today data available');
        }
      }

      console.warn('[useEmotionDataCache] ✅ Initialization complete');
      await persistToPublic();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useEmotionDataCache] Initialization failed:', error.value);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 手动刷新当天数据
   */
  async function refreshData() {
    isLoading.value = true;
    error.value = null;

    try {
      const latestToday = await fetchTodayEmotionStats();
      if (latestToday) {
        emotionToday.value = latestToday;
        emotionAll.value[latestToday.date] = latestToday;
        await persistToPublic();
        console.warn('[useEmotionDataCache] ✅ Data refreshed');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('[useEmotionDataCache] Refresh failed:', error.value);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    emotionToday: readonly(emotionToday),
    emotionAll: readonly(emotionAll),
    isLoading: readonly(isLoading),
    error: readonly(error),
    initializeData,
    refreshData,
  };
}
