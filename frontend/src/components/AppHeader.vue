<template>
  <div class="app-header">
    <div class="logo-section" @click="navigate('/')">
      <img src="/images/logo.svg" alt="EMO AI Logo" class="logo-image" >
      <div v-if="!headerTitle" class="logo-text-container">
        <span class="logo-main">EMO AI</span>
        <span class="logo-sub">will always be with you</span>
      </div>
    </div>

    <div class="header-center">
      <h1 v-if="headerTitle" class="character-title">{{ headerTitle }}</h1>
    </div>

    <nav class="nav-section">
      <div class="nav-item" :class="{ active: isHomeOrChatActive }" @click="navigate(chatLink)">
        <Icon icon="mdi:chat-outline" class="nav-icon" />
        <span class="nav-text">Talk With Us</span>
      </div>
      <div class="nav-item" :class="{ active: isDiaryActive }" @click="navigate('/diary')">
        <Icon icon="mdi:book-open-page-variant" class="nav-icon" />
        <span class="nav-text">Emotional Diary</span>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useHeaderTitle } from '~/composables/useHeaderState';

const headerTitle = useHeaderTitle();

const router = useRouter();
const route = useRoute();

const chatLink = ref('/');

onMounted(() => {
  const lastCharacterId = localStorage.getItem('lastCharacterId');
  if (lastCharacterId) {
    chatLink.value = `/chat/${lastCharacterId}`;
  }
});

const navigate = (path: string) => {
  router.push(path).catch(err => {
    console.error(`[Navigation Error] Failed to navigate to '${path}':`, err);
  });
};

const isHomeOrChatActive = computed(() => route.path === '/' || route.path.startsWith('/chat'));
const isDiaryActive = computed(() => route.path.startsWith('/diary'));

</script>

<style scoped>
.app-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  padding: 1.25rem 1.875rem;
  background-color: var(--color-header-bg);
  border-bottom: 1px solid var(--color-border);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* 12px gap between image and text */
  cursor: pointer;
}

.logo-image {
  height: 72px;
  width: auto;
}

.logo-text-container {
  display: flex;
  flex-direction: column;
}

.logo-main {
  font-size: 3rem;
  font-weight: bold;
  color: var(--color-text-primary);
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1;
}

.logo-sub {
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  font-weight: 300;
  line-height: 1;
}

.header-center {
  text-align: center;
}

.character-title {
  font-size: 1.75rem; /* 28px */
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.nav-section {
  display: flex;
  justify-content: flex-end;
  gap: 2.5rem;
  position: relative;
  top: 4px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #8B8B8B;
  transition: color 0.2s;
  cursor: pointer;
}

.nav-text {
  font-size: 1rem;
  font-weight: 500;
}

.nav-item:hover .nav-text {
  color: var(--color-text-primary);
}

.nav-item.active .nav-text {
  color: var(--color-text-primary);
  font-weight: 600;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-icon {
  width: 30px;
  height: 30px;
  transition: transform 0.2s;
  color: inherit;
}
</style>
