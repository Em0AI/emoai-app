<template>
  <div class="diary-page-container">
    <AppHeader />
    <div class="page-title-section">
      <Icon icon="lucide:book" class="title-icon" />
      <h1 class="page-title">Your Emotional Diary</h1>
    </div>
    <main class="diary-main-content">
      <div class="column column-left">
        <DiaryList
          :diaries="diaries"
          :selected-diary-id="selectedDiaryId"
          @select-diary="handleSelectDiary"
        />
      </div>
      <div class="column column-middle">
        <div v-if="isLoading">Loading emotional diary...</div>
        <div v-else-if="error" class="error-message">{{ error }}</div>
        <EmotionReport
          v-else-if="selectedDiary"
          :diary="selectedDiary"
          :previous-diary="previousDiary"
        />
        <div v-else>No diary entry selected or available.</div>
      </div>
      <div class="column column-right">
        <MoodRadarChart
          v-if="selectedDiary"
          :emotions="selectedDiary.emotions"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import AppHeader from '~/components/AppHeader.vue';
import DiaryList from '~/components/diary/DiaryList.vue';
import EmotionReport from '~/components/diary/EmotionReport.vue';
import MoodRadarChart from '~/components/diary/MoodRadarChart.vue';
import { diaryEntries } from '~/constants/diaryData';
import { useEmotionDataCache } from '~/composables/useEmotionDataCache';

console.warn('[Diary Page] Script loaded!');

// Define the structure of a diary entry for props (re-declared for clarity in this file)
interface DiaryEntry {
  id: string;
  date: string;
  emotions: { happy: number; content: number; calm: number; anxious: number; angry: number; sad: number };
  summary: string;
  observation: string;
  exercise: string;
  message: string;
}

const isLoading = ref(true);
const error = ref<string | null>(null);

const cacheManager = useEmotionDataCache();

// Initialize with mock data, will be replaced with fetched data
const diaries = ref(diaryEntries);
const selectedDiaryId = ref<string>('');

onMounted(async () => {
  try {
    console.warn('[Diary Page] Starting initialization...');

    // 初始化缓存（加载 emotion_all.json 和 emotion_today.json）
    await cacheManager.initializeData();
    console.warn('[Diary Page] Loaded emotionToday:', cacheManager.emotionToday.value?.date);
    console.warn('[Diary Page] Loaded emotionAll dates:', Object.keys(cacheManager.emotionAll.value));

    // 重新刷新一次确保获取最新的 emotion_today 数据
    await cacheManager.refreshData();
    console.warn('[Diary Page] Refreshed emotion_today with latest data');

    // 从 emotion_all 生成日记列表
    const allDates = Object.keys(cacheManager.emotionAll.value).sort().reverse();
    const generatedDiaries: DiaryEntry[] = allDates.map((date) => {
      const dayData = cacheManager.emotionAll.value[date];
      if (!dayData) return null;

      // 转换 emotion_counts 为前端格式
      const emotionCounts = dayData.emotion_counts as Record<string, number>;
      const standardEmotions = {
        happy: emotionCounts.joy || 0,
        content: emotionCounts.satisfied || 0,
        calm: emotionCounts.calm || emotionCounts.neutral || 0,
        anxious: emotionCounts.anxious || emotionCounts.fear || emotionCounts.disgust || 0,
        angry: emotionCounts.angry || 0,
        sad: emotionCounts.sad || emotionCounts.sadness || 0,
      };

      // 归一化到 100
      const total = Object.values(standardEmotions).reduce((a, b) => a + b, 0);
      if (total > 0) {
        Object.keys(standardEmotions).forEach((key) => {
          standardEmotions[key as keyof typeof standardEmotions] = Math.round(
            (standardEmotions[key as keyof typeof standardEmotions] / total) * 100,
          );
        });
      }

      return {
        id: `emotion-${date}`,
        date,
        emotions: standardEmotions,
        summary: dayData.parsedReport?.summary || 'No summary available',
        observation: dayData.parsedReport?.observation || 'No observation available',
        exercise: dayData.parsedReport?.exercise || 'No exercise available',
        message: dayData.parsedReport?.message || 'No message available',
      };
    }).filter((d) => d !== null) as DiaryEntry[];

    diaries.value = generatedDiaries;
    console.warn('[Diary Page] Generated', generatedDiaries.length, 'diary entries from emotion_all');

    // 自动选中今天
    const todayEntry = generatedDiaries.find((d) => d.date === cacheManager.emotionToday.value?.date);
    if (todayEntry) {
      selectedDiaryId.value = todayEntry.id;
      console.warn('[Diary Page] Selected today diary:', todayEntry.id);
    }
  } catch (err) {
    console.error('[Diary Page] Initialization error:', err);
    error.value = err instanceof Error ? err.message : 'Unknown error';
  } finally {
    isLoading.value = false;
  }
});

const parsedAiDailyReport = computed(() => {
  const today = cacheManager.emotionToday.value;
  if (!today?.parsedReport) {
    return {
      summary: 'No summary available',
      observation: 'No observation available',
      exercise: 'No exercise available',
      message: 'No message available',
    };
  }

  return {
    summary: today.parsedReport.summary,
    observation: today.parsedReport.observation,
    exercise: today.parsedReport.exercise,
    message: today.parsedReport.message,
  };
});

const selectedDiary = computed<DiaryEntry | null>(() => {
  // 优先从 diaries 数组中查找（用户选择的日记）
  const found = diaries.value.find(d => d.id === selectedDiaryId.value);
  if (found) {
    console.warn('[Diary Page] Using selected diary from list:', found.id);
    return found;
  }

  // 如果没有选中但有 emotion_today，用它（当前日期）
  if (cacheManager.emotionToday.value) {
    const today = cacheManager.emotionToday.value;
    const emotionCounts = today.emotion_counts;

    const emotionMapping: Record<string, keyof typeof standardEmotions> = {
      joy: 'happy',
      satisfied: 'content',
      calm: 'calm',
      neutral: 'calm',
      anxious: 'anxious',
      angry: 'angry',
      sad: 'sad',
      sadness: 'sad',
      disgust: 'anxious',
      fear: 'anxious',
      surprise: 'happy',
    };

    const standardEmotions = {
      happy: 0,
      content: 0,
      calm: 0,
      anxious: 0,
      angry: 0,
      sad: 0,
    };

    Object.entries(emotionCounts).forEach(([key, value]) => {
      const mappedKey = emotionMapping[key] || 'calm';
      standardEmotions[mappedKey] += value;
    });

    const total = Object.values(standardEmotions).reduce((a, b) => a + b, 0);
    if (total > 0) {
      Object.keys(standardEmotions).forEach((key) => {
        standardEmotions[key as keyof typeof standardEmotions] = Math.round(
          (standardEmotions[key as keyof typeof standardEmotions] / total) * 100,
        );
      });
    }

    const report = parsedAiDailyReport.value;
    return {
      id: 'emotion-today',
      date: today.date,
      emotions: standardEmotions,
      summary: report.summary || `${today.total_entries} entries today`,
      observation: report.observation || `Focus: ${Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}`,
      exercise: report.exercise || 'Practice mindfulness',
      message: report.message || 'Take care of yourself',
    };
  }

  console.warn('[Diary Page] No diary selected and no today data');
  return null;
});

const previousDiary = computed<DiaryEntry | null>(() => {
  // Get yesterday's data from emotion_today
  const today = cacheManager.emotionToday.value;
  if (!today?.yesterday_counts) {
    return null;
  }

  const yesterdayEmotions = today.yesterday_counts;
  const emotionMapping: Record<string, keyof typeof standardEmotions> = {
    joy: 'happy',
    satisfied: 'content',
    calm: 'calm',
    neutral: 'calm',
    anxious: 'anxious',
    angry: 'angry',
    sad: 'sad',
    sadness: 'sad',
    disgust: 'anxious',
    fear: 'anxious',
    surprise: 'happy',
  };

  const standardEmotions = {
    happy: 0,
    content: 0,
    calm: 0,
    anxious: 0,
    angry: 0,
    sad: 0,
  };

  Object.entries(yesterdayEmotions).forEach(([key, value]) => {
    const mappedKey = emotionMapping[key] || 'calm';
    standardEmotions[mappedKey] += value;
  });

  const total = Object.values(standardEmotions).reduce((a, b) => a + b, 0);
  if (total > 0) {
    Object.keys(standardEmotions).forEach((key) => {
      standardEmotions[key as keyof typeof standardEmotions] = Math.round(
        (standardEmotions[key as keyof typeof standardEmotions] / total) * 100,
      );
    });
  }

  return {
    id: 'emotion-yesterday',
    date: 'Yesterday',
    emotions: standardEmotions,
    summary: 'Yesterday\'s Emotional Summary',
    observation: 'Previous day comparison',
    exercise: 'Reflect on changes',
    message: 'Track your progress',
  };
});

function handleSelectDiary(id: string) {
  selectedDiaryId.value = id;
}

</script>

<style scoped>
.diary-page-container {
  width: 100%;
  height: 100vh;
  background-color: var(--color-background);
  display: flex;
  flex-direction: column;
}

.page-title-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 0;
}

.title-icon {
  width: 32px;
  height: 32px;
  color: inherit;
}

.page-title {
  font-size: 1.75rem; /* 28px */
  font-weight: 500;
  color: var(--color-text-primary);
}

.diary-main-content {
  flex-grow: 1;
  display: flex;
  padding: 0 1.5rem 1.5rem; /* Adjust padding */
  gap: 1.5rem;
  overflow: hidden; /* Prevent layout shift from scrollbars */
}

.column {
  height: 100%;
  max-height: calc(100vh - 200px); /* Adjust based on header and title height */
}

.column-left {
  flex: 0 0 20%;
  min-width: 250px;
}

.column-middle {
  flex: 1 1 50%;
}

.column-right {
  flex: 0 0 30%;
  min-width: 300px;
}
</style>
