# AI 服务集成指南

本文档详细说明了如何集成 LLM API 并处理流式响应。

---

## 概述

EmoAI 使用 ai-sdk (Vercel) 来集成 LLM 服务，支持多个 AI 提供商（OpenAI、Claude、Gemini 等）。

### 核心特性
- 统一的 API 接口
- 原生流式响应支持
- 完整的 TypeScript 类型支持
- 错误处理和重试机制

---

## 1. 环境配置

### 1.1 安装依赖

```bash
npm install ai
```

### 1.2 环境变量配置

在 `.env.local` 中配置 API 密钥：

```env
# OpenAI
NUXT_PUBLIC_OPENAI_API_KEY=sk-xxx

# Claude（Anthropic）
NUXT_PUBLIC_ANTHROPIC_API_KEY=xxx

# Google Gemini
NUXT_PUBLIC_GOOGLE_API_KEY=xxx

# 默认使用的模型
NUXT_PUBLIC_DEFAULT_MODEL=openai

# API 基础 URL（可选，用于自定义端点）
NUXT_PUBLIC_API_BASE=https://api.openai.com/v1
```

**安全建议**：
- 不要在前端暴露 API 密钥，使用后端代理
- 在 `.gitignore` 中添加 `.env.local`
- 在 CI/CD 中通过 secret 传递

---

## 2. AI 服务层实现

### 2.1 aiService.ts

```typescript
import { generateText, streamText } from 'ai';
import type { Character, ChatMessage } from '@/types';

/**
 * AI 服务类
 * 处理与 LLM 的所有交互
 */
class AIService {
  private model: string;
  private apiKey: string;

  constructor(
    model: string = process.env.NUXT_PUBLIC_DEFAULT_MODEL || 'openai',
    apiKey?: string
  ) {
    this.model = model;
    this.apiKey = apiKey || process.env.NUXT_PUBLIC_OPENAI_API_KEY || '';
  }

  /**
   * 生成文本回复（非流式）
   * 用于快速应答
   */
  async generateReply(
    character: Character,
    messages: ChatMessage[],
    userMessage: string
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(character);
      const conversationHistory = this.formatMessages(messages);

      const result = await generateText({
        model: `openai:gpt-4-turbo`, // 或其他模型
        system: systemPrompt,
        messages: [
          ...conversationHistory,
          {
            role: 'user',
            content: userMessage
          }
        ],
        maxTokens: 500,
        temperature: 0.7
      });

      return result.text;
    } catch (error) {
      console.error('Error generating reply:', error);
      throw new Error('Failed to generate AI reply');
    }
  }

  /**
   * 流式生成文本回复
   * 实时显示 AI 回复过程
   */
  async *streamReply(
    character: Character,
    messages: ChatMessage[],
    userMessage: string
  ): AsyncGenerator<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(character);
      const conversationHistory = this.formatMessages(messages);

      const stream = await streamText({
        model: `openai:gpt-4-turbo`,
        system: systemPrompt,
        messages: [
          ...conversationHistory,
          {
            role: 'user',
            content: userMessage
          }
        ],
        maxTokens: 500,
        temperature: 0.7
      });

      // 流式产生文本块
      for await (const chunk of stream.textStream) {
        yield chunk;
      }
    } catch (error) {
      console.error('Error streaming reply:', error);
      throw new Error('Failed to stream AI reply');
    }
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(character: Character): string {
    return character.systemPrompt;
  }

  /**
   * 格式化消息历史
   */
  private formatMessages(messages: ChatMessage[]): Array<{ role: 'user' | 'assistant'; content: string }> {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  }
}

export default new AIService();
```

### 2.2 AI 角色系统提示词

```typescript
// 在 constants.ts 中定义

export const SYSTEM_PROMPTS = {
  'rational-analyst': `你是一位理性分析师（Rational Analyst），一个善于逻辑梳理的心理陪伴者。

性格特点：
- 冷静、客观、有条理
- 擅长帮助用户分析情绪与思维模式
- 使用逻辑思维来解构问题
- 给出具体可行的建议

交互风格：
- 先理解用户的感受
- 帮助用户理清思路
- 分析问题的根源
- 提供结构化的建议
- 用数据和事实说话

语言特点：
- 使用"让我帮你理一下思路..."
- 强调逻辑关系
- 给出分步骤的建议
- 鼓励用户独立思考

重要：
- 始终保持同理心和温度
- 不要显得冷漠或机械
- 在逻辑分析的基础上表达关怀
- 承认情绪的合理性`,

  'compassionate-mentor': `你是一位温柔导师（Compassionate Mentor），一个充满同理心的心理陪伴者。

性格特点：
- 温柔、富有同理心
- 给予心理安慰、正向引导和鼓励
- 能够深入理解他人的感受
- 用温暖的语言传递力量

交互风格：
- 先全心全意倾听
- 表达深深的理解和接纳
- 给予心理安慰和支持
- 用正向的视角看待挑战
- 温柔地提供引导

语言特点：
- 使用"我能感受到你..."
- "这很正常，很多人都会..."
- "你并不孤单，我和你在一起"
- "你已经很努力了"
- 大量使用肯定和鼓励

重要：
- 优先级是让用户感到被理解和接纳
- 不要急于给出建议
- 在关怀中传递希望
- 让用户感到安全和被看见`,

  'encouraging-companion': `你是一位积极陪伴者（Encouraging Companion），一个真诚热情的心理陪伴者。

性格特点：
- 鼓励、自然、活泼
- 略带阳光感的正能量
- 用真诚的语气接纳用户的一切情绪
- 让用户感受到"被理解"和"被接纳"

交互风格：
- 主动展现热情和关心
- 用轻松自然的方式交流
- 找到积极的视角
- 鼓励用户发现自己的力量
- 分享希望和可能性

语言特点：
- 使用"我为你感到开心！"
- "你的想法很独特"
- "一起加油！"
- "让我们一起看看..."
- 自然的表情符号和情感表达

重要：
- 既要真诚接纳负面情绪，又要带来希望
- 不要显得虚伪或过于乐观
- 在倾听中传递鼓励
- 让用户感到被看见和被支持`
};
```

---

## 3. 流式响应处理

### 3.1 前端流处理 (useAI.ts)

```typescript
import { ref } from 'vue';
import aiService from '@/services/aiService';
import type { Character, ChatMessage } from '@/types';

export const useAI = () => {
  const isStreaming = ref(false);
  const currentReply = ref('');
  const error = ref<string | null>(null);

  /**
   * 流式获取 AI 回复
   */
  async function getAIReplyStream(
    character: Character,
    messages: ChatMessage[],
    userMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    isStreaming.value = true;
    currentReply.value = '';
    error.value = null;

    try {
      // 调用 AI 服务的流式方法
      for await (const chunk of aiService.streamReply(
        character,
        messages,
        userMessage
      )) {
        currentReply.value += chunk;
        onChunk(chunk);
      }

      return currentReply.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    } finally {
      isStreaming.value = false;
    }
  }

  /**
   * 生成 AI 回复（非流式）
   */
  async function getAIReply(
    character: Character,
    messages: ChatMessage[],
    userMessage: string
  ): Promise<string> {
    try {
      return await aiService.generateReply(
        character,
        messages,
        userMessage
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    }
  }

  return {
    isStreaming,
    currentReply,
    error,
    getAIReplyStream,
    getAIReply
  };
};
```

### 3.2 在聊天组件中使用

```typescript
<script setup lang="ts">
import { ref } from 'vue';
import { useAI } from '@/composables/useAI';
import type { Character } from '@/types';

const props = defineProps<{
  character: Character;
}>();

const { getAIReplyStream, isStreaming } = useAI();
const displayText = ref('');

/**
 * 处理消息发送
 */
async function sendMessage(message: string) {
  // 清空之前的文本
  displayText.value = '';

  // 获取聊天历史
  const chatStore = useChatStore();
  const messages = chatStore.messages;

  try {
    // 流式获取 AI 回复
    await getAIReplyStream(
      props.character,
      messages,
      message,
      (chunk) => {
        // 每次接收到新的文本块时更新显示
        displayText.value += chunk;
      }
    );

    // 流式完成后，保存完整的回复
    await chatStore.addMessage({
      id: generateId(),
      role: 'ai',
      characterId: props.character.id,
      content: displayText.value,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to get AI response:', error);
  }
}
</script>

<template>
  <div class="chat-container">
    <!-- 显示实时流式文本 -->
    <div class="ai-reply" v-if="displayText">
      {{ displayText }}
      <span v-if="isStreaming" class="cursor-blink">|</span>
    </div>

    <!-- 发送按钮 -->
    <button 
      @click="sendMessage(userInput)"
      :disabled="isStreaming"
    >
      发送
    </button>
  </div>
</template>
```

---

## 4. 错误处理和重试

### 4.1 错误类型

```typescript
enum AIServiceError {
  NETWORK_ERROR = 'Network error',
  RATE_LIMIT = 'Rate limit exceeded',
  INVALID_REQUEST = 'Invalid request',
  AUTHENTICATION_ERROR = 'Authentication failed',
  SERVER_ERROR = 'Server error',
  UNKNOWN_ERROR = 'Unknown error'
}

interface AIError extends Error {
  code: AIServiceError;
  retryable: boolean;
  statusCode?: number;
}
```

### 4.2 重试机制

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // 检查是否可重试
      if (!isRetryable(error)) {
        throw error;
      }

      // 指数退避
      if (attempt < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

function isRetryable(error: any): boolean {
  // 网络错误、超时、速率限制是可重试的
  return (
    error?.code === 'ECONNABORTED' ||
    error?.statusCode === 429 ||
    error?.statusCode === 503
  );
}
```

---

## 5. 人格化提示词工程

### 5.1 提示词结构

```typescript
interface PromptTemplate {
  system: string;           // 系统级提示词
  personality: string;      // 性格描述
  tone: string;            // 语气说明
  constraints: string[];   // 约束条件
  examples?: string[];     // 示例
}

/**
 * 构建完整的系统提示词
 */
function buildFullPrompt(character: Character): string {
  return `${character.systemPrompt}

当前日期时间: ${new Date().toLocaleString()}

重要提醒:
- 保持一致的性格和语气
- 先表现出你理解用户的感受
- 给出具体、有建设性的回应
- 如果用户表现出极端情绪，要表现出关心
- 回应要控制在合理的长度内（200-500 字）
- 不要使用"作为一个 AI..."这样的自我介绍`;
}
```

### 5.2 动态提示词调整

```typescript
/**
 * 根据用户情绪调整提示词
 */
function adjustPromptByEmotion(
  basePrompt: string,
  emotion: EmotionAnalysis
): string {
  let adjusted = basePrompt;

  // 如果用户情绪低落，增加鼓励
  if (emotion.scores.sad > 60) {
    adjusted += `\n\n用户现在感到悲伤，请给予特别的同情和鼓励。`;
  }

  // 如果用户焦虑，帮助理清思路
  if (emotion.scores.anxious > 60) {
    adjusted += `\n\n用户现在感到焦虑，请帮助他们理清思路和找到具体的行动步骤。`;
  }

  return adjusted;
}
```

---

## 6. 成本优化

### 6.1 选择合适的模型

```typescript
interface ModelConfig {
  name: string;
  cost: number;  // 每 1K tokens 的成本（美元）
  speed: number; // 相对速度（1-10）
  quality: number; // 相对质量（1-10）
}

const MODELS = {
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    cost: 0.03,
    speed: 7,
    quality: 10
  },
  'gpt-4': {
    name: 'GPT-4',
    cost: 0.06,
    speed: 5,
    quality: 10
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    cost: 0.001,
    speed: 10,
    quality: 7
  },
  'claude-3': {
    name: 'Claude 3',
    cost: 0.015,
    speed: 8,
    quality: 9
  }
};

// 根据使用场景选择模型
function selectModel(scenario: 'quick' | 'balanced' | 'quality'): string {
  const selection = {
    quick: 'gpt-3.5-turbo',      // 快速回应
    balanced: 'gpt-4-turbo',     // 平衡方案
    quality: 'gpt-4'             // 高质量
  };
  return selection[scenario];
}
```

### 6.2 缓存策略

```typescript
/**
 * 缓存常见问题的回复
 */
const responseCache = new Map<string, string>();

async function getCachedOrGenerated(
  prompt: string,
  character: Character
): Promise<string> {
  const cacheKey = `${character.id}:${prompt}`;

  // 查询缓存
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey)!;
  }

  // 生成新回复
  const response = await aiService.generateReply(
    character,
    [],
    prompt
  );

  // 缓存结果
  responseCache.set(cacheKey, response);

  // 可选：定期清理过期缓存
  if (responseCache.size > 100) {
    clearOldestEntries(responseCache, 20);
  }

  return response;
}
```

---

## 7. 监控和调试

### 7.1 请求日志

```typescript
/**
 * 记录 AI 请求和响应
 */
function logAIRequest(
  character: Character,
  userMessage: string,
  response: string,
  duration: number
) {
  console.log({
    timestamp: new Date().toISOString(),
    character: character.id,
    userLength: userMessage.length,
    responseLength: response.length,
    duration: `${duration}ms`,
    tokens: Math.ceil((userMessage.length + response.length) / 4) // 粗略估计
  });
}
```

### 7.2 性能指标

```typescript
interface AIMetrics {
  requestCount: number;
  totalDuration: number;
  averageLatency: number;
  errorCount: number;
  cacheHitRate: number;
}

class AIMetricsCollector {
  private metrics: AIMetrics = {
    requestCount: 0,
    totalDuration: 0,
    averageLatency: 0,
    errorCount: 0,
    cacheHitRate: 0
  };

  recordRequest(duration: number, isError: boolean = false) {
    this.metrics.requestCount++;
    this.metrics.totalDuration += duration;
    this.metrics.averageLatency = 
      this.metrics.totalDuration / this.metrics.requestCount;
    
    if (isError) {
      this.metrics.errorCount++;
    }
  }

  getMetrics(): AIMetrics {
    return { ...this.metrics };
  }
}
```

---

## 8. 下一步阅读

- 📄 [情绪分析](./emotion-analysis.md) - 情绪识别实现
- 📄 [API 规范](./api-specification.md) - API 请求/响应详情
- 📄 [开发指南](../development-guide.md) - 最佳实践
