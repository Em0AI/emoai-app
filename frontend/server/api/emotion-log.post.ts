import { defineEventHandler, createError } from 'h3';

/**
 * 获取完整的情感日志数据并进行处理
 * 路由: POST /api/emotion-log
 *
 * 流程:
 * 1. 调用后端 /api/emotion_log 获取完整日志（323 条）
 * 2. 按日期分组
 * 3. 统计各情感类型数量
 * 4. 返回结构化的 emotion_log.json 格式数据
 *
 * 用途: 用于前端导出完整日志数据，验证数据完整性
 */

interface EmotionLog {
  timestamp: string;
  emotion?: string;
  content?: string;
  [key: string]: unknown;
}

interface GroupedByDate {
  [date: string]: EmotionLog[];
}

interface EmotionCounts {
  [emotion: string]: number;
}

interface ExportData {
  exportTime: string;
  totalLogs: number;
  totalDates: number;
  logs: EmotionLog[];
  groupedByDate: GroupedByDate;
  summary: {
    emotionCounts: EmotionCounts;
  };
}

export default defineEventHandler(async (event) => {
  try {
    // @ts-expect-error - Nuxt auto-import
    const config = useRuntimeConfig(event);
    const backendUrl = config.public.apiUrl || 'http://localhost:8000';
    const url = `${backendUrl}/api/emotion_log`;

    console.warn('[emotion-log API] 获取后端日志...');
    console.warn(`[emotion-log API] Backend URL: ${url}`);

    // 1. 调用后端 API 获取原始日志
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[emotion-log API] 后端返回错误 ${response.status}:`, errorText);
      throw createError({
        statusCode: response.status,
        statusMessage: `Backend returned ${response.status}`,
      });
    }

    const backendData = await response.json();

    // 后端直接返回数组，不是 { logs: [...] }
    const logs = (Array.isArray(backendData) ? backendData : backendData.logs || []) as EmotionLog[];

    if (!Array.isArray(logs) || logs.length === 0) {
      console.warn('[emotion-log API] 没有获取到日志数据');
      throw createError({
        statusCode: 400,
        statusMessage: 'No logs returned from backend',
      });
    }

    console.warn(`[emotion-log API] ✅ 获取 ${logs.length} 条日志`);

    // 2. 按日期分组
    const groupedByDate: GroupedByDate = {};
    logs.forEach((log) => {
      const timestamp = log.timestamp as string;
      if (!timestamp) return;

      const date = timestamp.split('T')[0];
      if (!date) return;

      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(log);
    });

    console.warn(`[emotion-log API] 按日期分组: ${Object.keys(groupedByDate).length} 个日期`);

    // 3. 统计情感数量
    const emotionCounts: EmotionCounts = {};
    logs.forEach((log) => {
      const emotion = (log.emotion as string) || 'unknown';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    console.warn('[emotion-log API] 情感统计:', emotionCounts);

    // 4. 构建导出数据
    const exportData: ExportData = {
      exportTime: new Date().toISOString(),
      totalLogs: logs.length,
      totalDates: Object.keys(groupedByDate).length,
      logs,
      groupedByDate,
      summary: {
        emotionCounts,
      },
    };

    console.warn('[emotion-log API] ✅ 数据处理完成，返回给前端');

    return {
      success: true,
      data: exportData,
      stats: {
        totalLogs: logs.length,
        totalDates: Object.keys(groupedByDate).length,
        emotionCounts,
      },
    };
  } catch (err) {
    console.error('[emotion-log API] 处理失败:', err);
    throw createError({
      statusCode: 500,
      statusMessage: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});
