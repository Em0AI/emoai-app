#!/usr/bin/env node
/**
 * 导出脚本：从浏览器 dump 的 JSON 生成 emotion_log.json
 *
 * 使用步骤：
 * 1. 启动 dev server: bun run dev
 * 2. 打开 http://localhost:3001
 * 3. 打开 DevTools Console，运行:
 *    copy(JSON.stringify(JSON.parse(localStorage.getItem("emotion_logs_export")), null, 2))
 * 4. 新建文件 emotion_logs_dump.json，粘贴数据
 * 5. 运行: node frontend/scripts/export-emotion-log.mjs emotion_logs_dump.json
 * 6. 生成 emotion_log.json
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ 用法: node export-emotion-log.mjs <dump-file>');
  console.error('');
  console.error('示例: node export-emotion-log.mjs emotion_logs_dump.json');
  process.exit(1);
}

const dumpFile = path.resolve(args[0]);

if (!fs.existsSync(dumpFile)) {
  console.error(`❌ 文件不存在: ${dumpFile}`);
  process.exit(1);
}

try {
  const content = fs.readFileSync(dumpFile, 'utf-8');
  let data;

  // 尝试解析 JSON
  try {
    data = JSON.parse(content);
  } catch {
    // 如果失败，假设是字符串格式的 JSON
    data = JSON.parse(JSON.parse(`"${content.replace(/"/g, '\\"')}"`));
  }

  // 生成输出文件
  const outputFile = path.resolve('emotion_log.json');
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');

  // 输出统计信息
  console.warn(`✅ 导出完成: ${outputFile}`);
  console.warn('');
  console.warn('📊 统计信息:');
  console.warn(`   - 总日志数: ${data.totalLogs || 0}`);
  console.warn(`   - 日期数: ${data.totalDates || 0}`);
  console.warn(`   - 导出时间: ${data.exportTime || 'N/A'}`);

  if (data.summary?.emotionCounts) {
    console.warn('   - 情感分布:');
    Object.entries(data.summary.emotionCounts).forEach(([emotion, count]) => {
      console.warn(`     * ${emotion}: ${count}`);
    });
  }

  console.warn('');
  console.warn('✨ 现在可以检查 emotion_log.json 中的数据完整性');
} catch (err) {
  console.error('❌ 处理失败:', err instanceof Error ? err.message : err);
  process.exit(1);
}
