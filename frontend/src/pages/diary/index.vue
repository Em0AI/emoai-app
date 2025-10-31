<template>
  <div class="diary-page-container">
    <AppHeader />
    <div class="page-title-section">
      <Icon icon="mdi:book-multiple" class="title-icon" />
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
import { getEmotionStatsToday, type EmotionStatsResponse } from '~/services/emotionStatsService';

// Define the structure of a diary entry for props (re-declared for clarity in this file)
interface DiaryEntry {
  id: string;
  date: string;
  emotions: Record<string, number>;
  summary: string;
  observation: string;
  exercise: string;
  message: string;
}

const emotionStats = ref<EmotionStatsResponse | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    emotionStats.value = await getEmotionStatsToday();
  } catch (err) {
    error.value = 'Failed to fetch emotion stats.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});

// Mock diary entries for now, will integrate fetched data
const diaries = ref(diaryEntries);
const selectedDiaryId = ref<string>(diaries.value[0]?.id ?? '');

const parsedAiDailyReport = computed(() => {
  if (!emotionStats.value?.ai_daily_report) {
    return {
      summary: '',
      observation: '',
      exercise: '',
      message: '',
    };
  }

  const report = emotionStats.value.ai_daily_report;

  // Parse the multi-line report format from backend
  // Format: "Emotional Summary: ...\nAI Observation: ...\nHealing Exercise: ...\nAI's Message: ..."
  const summaryMatch = report.match(/Emotional Summary:\s*(.*?)(?=\n(?:AI Observation:|$))/s);
  const observationMatch = report.match(/AI Observation:\s*(.*?)(?=\n(?:Healing Exercise:|$))/s);
  const exerciseMatch = report.match(/Healing Exercise:\s*(.*?)(?=\n(?:AI's Message:|$))/s);
  const messageMatch = report.match(/AI's Message:\s*(.*?)$/s);

  return {
    summary: summaryMatch?.[1]?.trim() || 'No summary available',
    observation: observationMatch?.[1]?.trim() || 'No observation available',
    exercise: exerciseMatch?.[1]?.trim() || 'No exercise available',
    message: messageMatch?.[1]?.trim() || 'No message available',
  };
});

const selectedDiary = computed<DiaryEntry | null>(() => {
  // For now, we'll prioritize the fetched AI report if available
  if (emotionStats.value) {
    return {
      id: 'ai-report-today', // A unique ID for the AI report
      date: emotionStats.value.date,
      emotions: emotionStats.value.emotion_counts, // Use emotion_counts for today's emotions
      ...parsedAiDailyReport.value,
    };
  }
  // Fallback to mock data if no AI report is fetched
  return diaries.value.find(d => d.id === selectedDiaryId.value) || null;
});

const previousDiary = computed(() => {
  // For the AI report, we can use yesterday_counts to construct a "previous" diary
  if (emotionStats.value) {
    return {
      id: 'ai-report-yesterday',
      date: 'Yesterday', // Or parse a date from the report if available
      emotions: emotionStats.value.yesterday_counts,
      summary: 'Summary from yesterday (placeholder)',
      observation: 'Observation from yesterday (placeholder)',
      exercise: 'Exercise from yesterday (placeholder)',
      message: 'Message from yesterday (placeholder)',
    };
  }

  if (!selectedDiary.value) return null;
  const selectedIndex = diaries.value.findIndex(d => d.id === selectedDiaryId.value);
  // Since the array is reverse-chronological, the previous day is at the next index
  const isFirstEntry = selectedIndex === diaries.value.length - 1;
  return isFirstEntry ? null : diaries.value[selectedIndex + 1];
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
