#!/usr/bin/env node
/**
 * 测试脚本：验证 emotion-log API 和完整流程
 * 直接调用 Nuxt 服务器 API
 */

import https from 'https';

const NUXT_SERVER = 'http://localhost:3002';

function httpRequest(url, method = 'POST') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : require('http');

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.warn('🧪 测试 emotion-log 完整流程\n');

  try {
    console.warn('📊 步骤 1: 调用 POST /api/emotion-log');
    console.warn(`   URL: ${NUXT_SERVER}/api/emotion-log\n`);

    const apiUrl = new URL('/api/emotion-log', NUXT_SERVER).toString();
    const response = await httpRequest(apiUrl, 'POST');

    if (!response.success) {
      console.error('❌ API 失败:', response);
      process.exit(1);
    }

    const data = response.data;

    console.warn('✅ 成功获取数据\n');
    console.warn('📈 统计信息:');
    console.warn(`   - 总日志数: ${data.totalLogs}`);
    console.warn(`   - 日期数: ${data.totalDates}`);
    console.warn(`   - 导出时间: ${data.exportTime}`);
    console.warn('   - 情感分布:');

    Object.entries(data.summary.emotionCounts).forEach(([emotion, count]) => {
      console.warn(`     * ${emotion}: ${count}`);
    });

    console.warn('\n✨ 验证通过！\n');
    console.warn('下一步:');
    console.warn('  1. 打开 http://localhost:3002');
    console.warn('  2. 打开 DevTools (F12)');
    console.warn('  3. 查看 Console 中的 [emotion-log plugin] 日志');
    console.warn('  4. 按指示导出数据');
  } catch (err) {
    console.error('❌ 测试失败:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
