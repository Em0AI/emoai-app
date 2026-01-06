
import fs from 'node:fs/promises';
import path from 'node:path';
import type { EmotionLogEntry } from './state';

const LOG_FILE = path.resolve(process.cwd(), 'server/data/logs/emotion_log.jsonl');

export async function logEmotionEntry(entry: EmotionLogEntry) {
  try {
    // Ensure dir exists
    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
    
    const line = JSON.stringify(entry) + '\n';
    await fs.appendFile(LOG_FILE, line, 'utf-8');
  } catch (e) {
    console.error(`[Log] Write failed:`, e);
  }
}

export async function readEmotionLog(): Promise<EmotionLogEntry[]> {
  try {
    // Check if exists
    try {
        await fs.access(LOG_FILE);
    } catch {
        return [];
    }
    
    const content = await fs.readFile(LOG_FILE, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map(line => {
        try {
            return JSON.parse(line);
        } catch {
            return null;
        }
    }).filter(x => x !== null) as EmotionLogEntry[];
  } catch (e) {
    console.error(`[Log] Read failed:`, e);
    return [];
  }
}
