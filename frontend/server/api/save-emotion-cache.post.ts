import { defineEventHandler, createError, readBody } from 'h3';

/**
 * 保存情感数据缓存到本地文件
 * 路由: POST /api/save-emotion-cache
 *
 * 请求体:
 * {
 *   type: 'cache',
 *   emotionToday: { ... },
 *   emotionAll: { [date]: { emotion_counts, logCount }, ... },
 *   emotionDiary: { ... }
 * }
 *
 * 这个端点将数据写入到服务器的 public 目录中，使其可被前端访问
 */

interface CachePayload {
  type: string;
  emotionToday?: unknown;
  emotionAll?: unknown;
  emotionDiary?: unknown;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CachePayload>(event);
    const { type, emotionToday, emotionAll, emotionDiary } = body;

    if (!type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing type parameter',
      });
    }

    console.warn('[save-emotion-cache] Received cache save request');
    console.warn(`[save-emotion-cache] Type: ${type}`);

    // 使用 Node.js 的文件系统 API（在服务器端可用）
    // @ts-expect-error - Using Node.js APIs in Nuxt server context
    const { promises: fs } = await import('fs');
    // @ts-expect-error - Using Node.js APIs in Nuxt server context
    const path = await import('path');

    // 获取项目根目录下的 public 文件夹
    // @ts-expect-error - process is available in server context
    const publicDir = path.join(path.resolve(), 'public');

    console.warn(`[save-emotion-cache] Writing to directory: ${publicDir}`);

    // 1. 保存 emotion_today.json
    if (emotionToday) {
      const todayPath = path.join(publicDir, 'emotion_today.json');
      try {
        await fs.mkdir(publicDir, { recursive: true });
        await fs.writeFile(todayPath, JSON.stringify(emotionToday, null, 2), 'utf-8');
        console.warn(`[save-emotion-cache] ✅ emotion_today.json saved to ${todayPath}`);
      } catch (err) {
        console.warn('[save-emotion-cache] ⚠️ Failed to save emotion_today.json:', err);
      }
    }

    // 2. 保存 emotion_all.json (按日期统计的历史数据)
    if (emotionAll) {
      const allPath = path.join(publicDir, 'emotion_all.json');
      try {
        await fs.mkdir(publicDir, { recursive: true });
        await fs.writeFile(allPath, JSON.stringify(emotionAll, null, 2), 'utf-8');
        console.warn(`[save-emotion-cache] ✅ emotion_all.json saved to ${allPath}`);
      } catch (err) {
        console.warn('[save-emotion-cache] ⚠️ Failed to save emotion_all.json:', err);
      }
    }

    // 3. 保存 emotion_diary.json
    if (emotionDiary) {
      const diaryPath = path.join(publicDir, 'emotion_diary.json');
      try {
        await fs.mkdir(publicDir, { recursive: true });
        await fs.writeFile(diaryPath, JSON.stringify(emotionDiary, null, 2), 'utf-8');
        console.warn(`[save-emotion-cache] ✅ emotion_diary.json saved to ${diaryPath}`);
      } catch (err) {
        console.warn('[save-emotion-cache] ⚠️ Failed to save emotion_diary.json:', err);
      }
    }

    return {
      success: true,
      message: 'Cache data saved to public directory',
    };
  } catch (err) {
    console.error('[save-emotion-cache] Error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});
