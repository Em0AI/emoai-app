
import { defineEventHandler } from 'h3';
import { readEmotionLog } from '../utils/logging';

export default defineEventHandler(async (event) => {
  const logs = await readEmotionLog();
  // Sort by timestamp desc
  return logs.sort((a, b) => {
      // String comparison for ISO dates works
      return b.timestamp.localeCompare(a.timestamp);
  });
});
