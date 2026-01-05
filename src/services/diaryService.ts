import type { DiaryRecord } from '~/types';
import { formatISO } from 'date-fns';

const MOCK_DIARY_DATA: DiaryRecord[] = [
  {
    id: '1',
    date: '2025-10-18',
    characterId: 'maya',
    emotionScores: { happy: 8, satisfied: 7, calm: 6, anxious: 2, angry: 1, sad: 1 },
    moodKeywords: ['grateful', 'productive', 'calm'],
    moodSummary: 'Today was a good day. I felt productive and grateful for the small things.',
    trendAnalysis: 'Your mood has been steadily improving over the past week.',
    insights: 'You tend to feel happier on days when you spend time outdoors.',
    practice: 'Try to spend at least 15 minutes outside tomorrow.',
    message: 'Maya is proud of you for taking care of yourself.',
    createdAt: Date.now(),
  },
  {
    id: '2',
    date: '2025-10-17',
    characterId: 'atlas',
    emotionScores: { happy: 4, satisfied: 3, calm: 5, anxious: 6, angry: 2, sad: 5 },
    moodKeywords: ['tired', 'anxious', 'okay'],
    moodSummary: 'Felt a bit anxious today about the upcoming presentation.',
    trendAnalysis: 'Anxiety levels have been higher than usual.',
    insights: 'Your anxiety seems to be linked to work-related stress.',
    practice: 'Try some deep breathing exercises before your presentation.',
    message: 'Atlas reminds you that it is okay to feel anxious sometimes.',
    createdAt: Date.now() - 86400000,
  },
];

export const diaryService = {
  /**
   * Attempt to fetch diary list from backend `/api/diary`.
   * Falls back to MOCK data if the request fails.
   */
  async getDiaryList(): Promise<DiaryRecord[]> {
    try {
      const res = await fetch('/api/diary');
      if (!res.ok) throw new Error(`Failed to fetch diary list: ${res.status}`);
      const data = await res.json();
      // Expecting an array of diary records from backend
      return data;
  } catch {
      // Fallback to mock with ensured ISO dates
      return MOCK_DIARY_DATA.map(d => ({ ...d, date: d.date || formatISO(new Date(d.createdAt || Date.now()), { representation: 'date' }) }));
    }
  },

  /**
   * Attempt to fetch a diary entry by date from `/api/diary/{date}`.
   * Falls back to mock data if the request fails or the endpoint is not available.
   */
  async getDiaryByDate(date: string): Promise<DiaryRecord | undefined> {
    try {
      const res = await fetch(`/api/diary/${encodeURIComponent(date)}`);
      if (!res.ok) throw new Error(`Failed to fetch diary entry: ${res.status}`);
      const entry = await res.json();
      return entry;
    } catch {
      return MOCK_DIARY_DATA.find(d => d.date === date);
    }
  },
};
