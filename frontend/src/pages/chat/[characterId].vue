<template>
  <div v-if="character" class="chat-page-container">
    <!-- 通用头部 -->
    <AppHeader />

    <!-- 主体内容区 -->
    <div class="chat-main-content">
      <!-- 左侧角色信息 -->
      <div class="chat-character-info">
        <img :src="character.avatar" :alt="character.name" class="chat-avatar">
        <p class="chat-role-text">{{ character.name }}</p>
      </div>

      <!-- 右侧对话气泡 -->
      <div class="chat-bubble-area">
        <ChatBubble
          v-for="msg in messages"
          :key="msg.id"
          :message="msg.content"
          :is-user="msg.role === 'user'"
        />
        <div v-if="isLoading" class="chat-bubble-loading">
          <p class="bubble-text">Thinking...</p>
        </div>
      </div>
    </div>

    <!-- 底部输入区 -->
    <div class="chat-input-area">
      <input
        v-model="inputText"
        type="text"
        placeholder="Let's begin our chat ~"
        class="chat-input"
        @keyup.enter="sendMessage"
      >
      <div class="buttons-group">
        <button class="voice-button"><img src="/icons/audio-icon.png" alt="Voice" class="btn-icon"></button>
        <button class="send-button" @click="sendMessage"><img src="/icons/send-icon.png" alt="Send" class="btn-icon"></button>
      </div>
    </div>

    <ExitPrompt v-if="showExitPrompt" />
  </div>
  <div v-else>
    <p>Character not found. Redirecting...</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CHARACTERS } from '~/constants/characters';
import AppHeader from '~/components/AppHeader.vue';
import ChatBubble from '~/components/ChatBubble.vue';
import ExitPrompt from '~/components/chat/ExitPrompt.vue'; // 导入 ExitPrompt 组件
import { streamChatMessage } from '~/services/chatService';
import type { ChatMessage } from '~/types/chat';

const showExitPrompt = ref(false);

const route = useRoute();
const router = useRouter();
const characterId = route.params.characterId as string;
const character = CHARACTERS.find(c => c.id === characterId);

// 如果角色不存在，重定向到首页
if (!character) {
  router.replace('/');
}

const messages = ref<ChatMessage[]>([
  {
    id: '0',
    role: 'assistant',
    characterId: characterId,
    content: character ? `Hello! I'm ${character.name}, your ${character.role}. ${character.description}` : 'Hello!',
    timestamp: Date.now(),
  },
]);

const inputText = ref('');
const isLoading = ref(false);

/**
 * 发送消息到流式 API 并处理响应
 */
const sendMessage = async (): Promise<void> => {
  // Check for the trigger keyword first
  if (inputText.value.trim().toLowerCase() === 'exit') {
    showExitPrompt.value = true;
    inputText.value = ''; // Clear input
    return;
  }

  if (!inputText.value.trim() || isLoading.value) {
    return;
  }

  const userMessage: ChatMessage = {
    id: `msg_${Date.now()}`,
    role: 'user',
    characterId: characterId,
    content: inputText.value,
    timestamp: Date.now(),
  };

  messages.value.push(userMessage);
  const userInput = inputText.value;
  inputText.value = '';
  isLoading.value = true;

  try {
    // 创建助手消息容器
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant',
      characterId: characterId,
      content: '',
      timestamp: Date.now(),
    };
    messages.value.push(assistantMessage);

    // 流式接收消息
    for await (const chunk of streamChatMessage(
      characterId,
      userInput,
      messages.value.filter(m => m.id !== userMessage.id && m.id !== assistantMessage.id),
    )) {
      assistantMessage.content += chunk;
    }

    isLoading.value = false;
  } catch (error) {
    console.error('Failed to send message:', error);
    isLoading.value = false;

    // 移除空的助手消息，用错误消息替换
    const lastMessage = messages.value[messages.value.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.content === '') {
      messages.value.pop();
    }

    // 添加错误提示消息
    messages.value.push({
      id: `msg_${Date.now()}_error`,
      role: 'assistant',
      characterId: characterId,
      content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the API server.`,
      timestamp: Date.now(),
    });
  }
};


</script>

<style scoped>
.chat-page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-surface);
}

.chat-back-button {
  position: absolute;
  top: 1.25rem; /* 20px */
  left: 1.875rem; /* 30px */
  font-size: 1.5rem;
  color: var(--color-text-primary);
  background: none;
  border: none;
  cursor: pointer;
  z-index: 10; /* 确保在头部之上 */
}

.chat-main-content {
  flex-grow: 1;
  display: flex;
  padding: 2.5rem 1.875rem; /* 40px 30px */
  align-items: flex-start; /* 头像与气泡顶部对齐 */
  min-height: 0; /* Flexbox overflow fix */
}

.chat-character-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 25%; /* 约占内容区宽度的 25%~30% */
  margin-right: 3.125rem; /* 50px (头像与对话气泡间距) */
}

.chat-avatar {
  width: 15rem; /* 240px, 1.2x size */
  height: 15rem; /* 240px, 1.2x size */
  object-fit: contain;
  margin-bottom: 0.9375rem; /* 15px */
  margin-top: 0.5rem; /* Moved up 8px */
}

.chat-role-text {
  font-size: 1.25rem; /* 20px */
  font-weight: normal; /* 角色身份标签字重 */
  color: var(--color-text-secondary); /* 灰色 */
  margin-bottom: 0.75rem; /* 12px */
}



.chat-bubble-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-right: 1.875rem; /* 30px (对话气泡与右侧边距) */
  margin-top: 1.5rem;
  overflow-y: auto;
}

.chat-bubble-loading {
  background-color: #F0F0F0;
  border: 1px solid var(--color-bubble-border);
  border-radius: 16px;
  padding: 12px 20px;
  max-width: 66%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  align-self: flex-start;
}

.chat-bubble-loading .bubble-text {
  font-size: 1.125rem;
  color: #000000;
  font-weight: 500;
  margin: 0;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.5; }
}

.chat-input-area {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Increased gap */
  padding: 0.75rem 1rem; /* 12px 16px */
  margin: 2rem auto; /* Center horizontally, increase vertical margin */
  height: 80px;
  width: 90%;
  max-width: 800px;
  background-color: transparent;
  border: 1px solid #E0D4C1;
  border-radius: 16px; /* Reduced from pill shape */
}

.chat-input {
  flex: 1;
  height: 100%;
  border: none;
  background-color: transparent;
  font-size: 1.125rem;
  outline: none;
  padding: 0 0.75rem;
  box-shadow: none;
}

.chat-input:focus {
  outline: none;
  box-shadow: none;
  border: none;
}

.chat-input::placeholder {
  color: #AAAAAA;
}

.buttons-group {
  display: flex;
  align-items: center;
  gap: 0.25rem; /* 4px */
}

.voice-button,
.send-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-icon {
  width: 32px;
  height: 32px;
}
</style>
