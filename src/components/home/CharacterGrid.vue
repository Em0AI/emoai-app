<template>
  <div class="character-container">
    <div class="fusion-switch-container">
      <span class="switch-label">{{ showFusion ? 'Fusion Mode' : 'Individual Mode' }}</span>
      <label class="switch">
        <input
          type="checkbox"
          :checked="showFusion"
          @change="showFusion = !showFusion"
        >
        <span class="slider" />
      </label>
    </div>

    <div v-if="!showFusion" class="character-grid">
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

    <div v-if="showFusion" class="fusion-display">
      <div class="fusion-content">
        <img
          :src="fusionCharacter.avatar"
          :alt="fusionCharacter.name"
          class="fusion-avatar"
          @click="selectCharacter(fusionCharacter)"
        >
        <div class="fusion-info">
          <p class="fusion-name">{{ fusionCharacter.name }}</p>
          <p class="fusion-role">{{ fusionCharacter.role }}</p>
          <p class="fusion-description">{{ fusionCharacter.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Character } from '~/types';
import { FUSION_CHARACTER } from '~/constants/characters';

defineProps<{
  characters: Character[];
}>();

const router = useRouter();
const showFusion = ref(false);
const fusionCharacter = FUSION_CHARACTER;

const selectCharacter = (character: Character) => {
  localStorage.setItem('lastCharacterId', character.id);
  router.push(`/chat/${character.id}`);
};
</script>

<style scoped>
.character-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 2rem;
  position: relative;
}

.fusion-switch-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
}

.switch-label {
  font-size: 1rem;
  color: #8B5E2E;
  font-weight: 500;
  min-width: 140px;
  text-align: right;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #D4A574;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

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

.fusion-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  width: 100%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fusion-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.fusion-avatar {
  height: 18.75rem; /* 300px */
  width: auto;
  animation: zoomIn 0.4s ease;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.fusion-avatar:hover {
  transform: scale(1.05);
}

@keyframes zoomIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.fusion-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fusion-name {
  font-size: 1.75rem; /* 28px */
  color: #8B5E2E;
  font-weight: 600;
}

.fusion-role {
  font-size: 1.125rem; /* 18px */
  color: #D4A574;
  font-weight: 500;
}

.fusion-description {
  font-size: 1rem; /* 16px */
  color: #8B8B8B;
  max-width: 30rem;
  line-height: 1.6;
}
</style>
