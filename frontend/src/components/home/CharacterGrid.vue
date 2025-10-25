<template>
  <div class="character-grid">
    <div
      v-for="character in characters"
      :key="character.id"
      class="character-card"
      @click="selectCharacter(character)"
    >
      <img
        :src="character.avatar"
        :alt="character.name"
        class="character-avatar"
        :class="{ 'cat-avatar': character.id === 'cat' }" >
      <p class="character-name">{{ character.name }}</p>
      <p class="character-role">{{ character.role }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Character } from '~/types';

defineProps<{
  characters: Character[];
}>();

const router = useRouter();

const selectCharacter = (character: Character) => {
  localStorage.setItem('lastCharacterId', character.id);
  router.push(`/chat/${character.id}`);
};
</script>

<style scoped>
.character-grid {
  display: flex;
  justify-content: center;
  align-items: flex-end; /* Align items to the bottom */
  gap: 4.5rem; /* 72px */
  width: 100%;
}

.character-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.character-card:hover {
  transform: scale(1.05);
}

.character-avatar {
  height: 15.625rem; /* 250px */
  width: auto; /* Let width adjust to maintain aspect ratio */
  /* Removed object-fit and border-radius to show natural shape */
  margin-bottom: 1.25rem; /* 20px, gap between avatar and role text */
}

.cat-avatar {
  height: 14.0625rem; /* 225px (90% of normal height) */
  width: auto; /* Let width adjust to maintain aspect ratio */
}

.character-name {
  font-size: 1.25rem; /* 20px */
  color: #8B5E2E; /* --color-text-primary */
  font-weight: 500;
  margin-bottom: 0.25rem; /* Gap between name and role */
}

.character-role {
  font-size: 0.875rem; /* 14px */
  color: #8B8B8B; /* --color-text-secondary */
}
</style>
