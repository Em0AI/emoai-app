<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Choose a Different Character</h2>
        <button class="close-button" @click="close">✕</button>
      </div>

      <div class="character-grid">
        <div
          v-for="char in characters"
          :key="char.id"
          class="character-card"
          @click="selectCharacter(char.id)"
        >
          <img :src="char.avatar" :alt="char.name" class="character-avatar">
          <p class="character-name">{{ char.name }}</p>
          <p class="character-role">{{ char.role }}</p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="close">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { CHARACTERS } from '~/constants/characters';
import type { Character } from '~/types/character';

const emit = defineEmits<{
  close: [];
  select: [characterId: string];
}>();

const router = useRouter();
const characters: Character[] = CHARACTERS;

/**
 * 选择角色并导航到该角色的聊天页面
 */
const selectCharacter = (characterId: string): void => {
  emit('select', characterId);
  router.push(`/chat/${characterId}`);
};

/**
 * 关闭模态框
 */
const close = (): void => {
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.close-button:hover {
  color: var(--color-text-primary);
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.character-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  background-color: var(--color-background);
}

.character-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.character-avatar {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 0.75rem;
}

.character-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0.25rem 0;
  text-align: center;
}

.character-role {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background-color: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 600;
}

.btn-cancel:hover {
  background-color: var(--color-border);
  color: var(--color-text-primary);
}
</style>
