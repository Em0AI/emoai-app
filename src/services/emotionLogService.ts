/**
 * 情感日志导出服务
 * 负责调用 emotion-log API 获取完整日志数据
 */

interface ExportData {
  exportTime: string;
  totalLogs: number;
  totalDates: number;
  logs: unknown[];
  groupedByDate: Record<string, unknown[]>;
  summary: {
    emotionCounts: Record<string, number>;
  };
}

interface ApiResponse {
  success: boolean;
  data?: ExportData;
  stats?: {
    totalLogs: number;
    totalDates: number;
    emotionCounts: Record<string, number>;
  };
}

/**
 * 获取完整的情感日志数据
 * @returns 包含完整日志的导出数据
 * @throws 请求失败时抛出错误
 */
export async function getEmotionLogExport(): Promise<ExportData> {
  try {
    const response = await fetch('/api/emotion-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API 返回 ${response.status}: ${response.statusText}`);
    }

    const result = (await response.json()) as ApiResponse;

    if (!result.success || !result.data) {
      throw new Error('API 返回数据无效');
    }

    console.warn('[emotionLogService] ✅ 获取导出数据成功，总日志数:', result.data.totalLogs);

    return result.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[emotionLogService] ❌ 获取失败:', message);
    throw err;
  }
}

/**
 * 保存导出数据到 localStorage
 * @param data 导出数据
 * @param key localStorage 键名，默认 'emotion_logs_export'
 */
export function saveToLocalStorage(data: ExportData, key = 'emotion_logs_export'): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.warn(`[emotionLogService] 💾 数据已保存到 localStorage (${key})`);
  } catch (err) {
    console.error('[emotionLogService] ❌ localStorage 保存失败:', err);
    throw err;
  }
}

/**
 * 从 localStorage 读取导出数据
 * @param key localStorage 键名，默认 'emotion_logs_export'
 * @returns 导出数据，如果不存在则返回 null
 */
export function getFromLocalStorage(key = 'emotion_logs_export'): ExportData | null {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as ExportData;
  } catch (err) {
    console.error('[emotionLogService] ❌ localStorage 读取失败:', err);
    return null;
  }
}
