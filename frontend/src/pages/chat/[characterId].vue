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
      <div ref="bubbleAreaRef" class="chat-bubble-area">
        <ChatBubble
          v-for="msg in messages"
          :key="`${msg.id}-${msg.content.length}`"
          :message="msg.content"
          :is-user="msg.role === 'user'"
        />
        <div v-if="isLoading" class="chat-bubble-loading">
          <div class="typing-dots">
            <span class="dot" />
            <span class="dot" />
            <span class="dot" />
          </div>
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
        <button class="send-button" @click="sendMessage"><Icon icon="mdi:send" class="btn-icon" /></button>
      </div>
    </div>

    <ExitPrompt v-if="showExitPrompt" />
  </div>
  <div v-else>
    <p>Character not found. Redirecting...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { CHARACTERS, FUSION_CHARACTER } from '~/constants/characters';
import AppHeader from '~/components/AppHeader.vue';
import ChatBubble from '~/components/ChatBubble.vue';
import ExitPrompt from '~/components/chat/ExitPrompt.vue'; // 导入 ExitPrompt 组件
import { streamChatMessage } from '~/services/chatService';
import type { ChatMessage } from '~/types/chat';

const showExitPrompt = ref(false);

const route = useRoute();
const router = useRouter();
const characterId = route.params.characterId as string;
const allCharacters = [...CHARACTERS, FUSION_CHARACTER];
const character = allCharacters.find(c => c.id === characterId);

// 气泡区域的 ref，用于自动滚动
const bubbleAreaRef = ref<HTMLDivElement | null>(null);

// 如果角色不存在，重定向到首页
if (!character) {
  router.replace('/');
}

const messages = ref<ChatMessage[]>([
  {
    id: 'greeting',
    role: 'assistant',
    characterId: characterId,
    content: character ? `Hello! I'm ${character.name}, your ${character.role}. ${character.description}` : 'Hello!',
    timestamp: Date.now(),
  },
]);

const inputText = ref('');
const isLoading = ref(false);

/**
 * 自动滚动到最新消息（强制滚动到底部）
 */
const scrollToBottom = async (): Promise<void> => {
  await nextTick();
  if (bubbleAreaRef.value) {
    // 使用 requestAnimationFrame 确保在下一帧滚动，避免阻塞
    requestAnimationFrame(() => {
      if (bubbleAreaRef.value) {
        // 强制滚动到底部
        bubbleAreaRef.value.scrollTop = bubbleAreaRef.value.scrollHeight;
      }
    });
  }
};

/**
 * 立即滚动到底部（不等待 nextTick）
 */
const scrollToBottomImmediate = (): void => {
  if (bubbleAreaRef.value) {
    const element = bubbleAreaRef.value;
    element.scrollTop = element.scrollHeight;
    // 调试日志
    console.warn(`[Scroll] scrollTop: ${element.scrollTop}, scrollHeight: ${element.scrollHeight}, clientHeight: ${element.clientHeight}`);
  }
};

/**
 * 监听全局隐藏退出提示事件
 */
onMounted(() => {
  window.addEventListener('hideExitPrompt', () => {
    showExitPrompt.value = false;
  });
});

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
  await scrollToBottom();

  let assistantMessageIndex = -1;
  let lastUpdate = Date.now();

  try {
    // Build history: include all messages except the greeting and current user message
    // This ensures we don't send the initial greeting to the backend, preventing duplication
    const historyMessages = messages.value
      .filter(m => m.id !== 'greeting' && m.id !== userMessage.id);

    // 流式接收消息
    for await (const chunk of streamChatMessage(
      characterId,
      userInput,
      historyMessages,
    )) {
      // chunk 本身就是完整内容（不是增量），直接使用
      console.warn(`[Chat] Received chunk: "${chunk.slice(0, 50)}..." | Total length: ${chunk.length}`);

      // 在接收到第一个 chunk 时创建助手消息
      if (assistantMessageIndex === -1) {
        isLoading.value = false; // 立即隐藏加载状态
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          characterId: characterId,
          content: chunk,
          timestamp: Date.now(),
        };
        messages.value.push(assistantMessage);
        assistantMessageIndex = messages.value.length - 1;
        console.warn(`[Chat] Created new message with ${chunk.length} chars`);
        await scrollToBottom();
      } else {
        // 直接更新 messages 数组中的消息内容，触发 Vue 响应式更新
        const msg = messages.value[assistantMessageIndex];
        if (msg) {
          msg.content = chunk;
          console.warn(`[Chat] Updated message to ${chunk.length} chars`);
        }

        // 每次更新都立即滚动到底部
        const now = Date.now();
        if (now - lastUpdate >= 50) {
          lastUpdate = now;
          scrollToBottomImmediate();
        }
      }
    }

    // 最后滚动确保内容完整可见
    await scrollToBottom();
    isLoading.value = false;
  } catch (error) {
    console.error('Failed to send message:', error);
    isLoading.value = false;

    // 如果有部分响应但最后出错，保留已有内容
    if (assistantMessageIndex === -1) {
      // 添加错误提示消息
      messages.value.push({
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        characterId: characterId,
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the API server.`,
        timestamp: Date.now(),
      });
    }
  }
};


</script>

<style scoped>
.chat-page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  background-color: var(--color-surface);
  overflow: hidden;
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
  flex: 1;
  display: flex;
  padding: 1.5rem 1.875rem 1rem; /* top right bottom - 减少上下 padding */
  align-items: flex-start; /* 头像与气泡顶部对齐 */
  min-height: 0; /* Flexbox overflow fix */
  max-height: 100%; /* 限制最大高度 */
  overflow: hidden; /* 防止内容溢出 */
}

.chat-character-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20%; /* 减小头像区域宽度 */
  max-width: 200px; /* 限制最大宽度 */
  margin-right: 2rem; /* 减少间距 */
  flex-shrink: 0; /* 防止头像区域被压缩 */
}

.chat-avatar {
  width: 12rem; /* 192px - 减小头像 */
  height: 12rem; /* 192px */
  object-fit: contain;
  margin-bottom: 0.75rem; /* 减少间距 */
  margin-top: 0; /* 移除上边距 */
}

.chat-role-text {
  font-size: 1.25rem; /* 20px */
  font-weight: normal; /* 角色身份标签字重 */
  color: var(--color-text-secondary); /* 灰色 */
  margin-bottom: 0.75rem; /* 12px */
}

.chat-bubble-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0.5rem 0 0; /* top right bottom left - 减少边距 */
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0; /* 允许 flex 容器正确计算高度 */
  max-height: 100%; /* 限制最大高度 */
  scroll-behavior: smooth; /* 平滑滚动 */
}

/* 自定义滚动条样式 */
.chat-bubble-area::-webkit-scrollbar {
  width: 8px;
}

.chat-bubble-area::-webkit-scrollbar-track {
  background: transparent;
}

.chat-bubble-area::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-full);
}

.chat-bubble-area::-webkit-scrollbar-thumb:hover {
  background: var(--color-secondary);
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

.typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #666;
  animation: typing-bounce 1.4s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.chat-input-area {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Increased gap */
  padding: 0.75rem 1rem; /* 12px 16px */
  margin: 4rem auto; /* Center horizontally, increase vertical margin */
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
  color: inherit;
}
</style>
