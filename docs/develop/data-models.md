# 数据模型文档

本文档定义了 EmoAI 系统的核心数据结构和 TypeScript 类型定义。

---

## 类型文件组织

```
types/
├── index.ts              # 统一导出所有类型
├── chat.ts              # 聊天相关类型
├── diary.ts             # 日记相关类型
├── emotion.ts           # 情绪相关类型
└── common.ts            # 通用类型
```

---

## 1. 关于角色数据

**角色数据来源**：前端本地列表

角色信息可以直接在前端定义为常量对象，无需从后端获取：

```typescript
// src/types/character.ts
type CharacterId = 'rational-analyst' | 'compassionate-mentor' | 'encouraging-companion';

interface Character {
  id: CharacterId;
  name: string;
  avatar: string;
  description: string;
  // 其他必要的角色信息
}

// 前端直接维护角色列表
export const CHARACTERS: Record<CharacterId, Character> = {
  'rational-analyst': {
    id: 'rational-analyst',
    name: 'Rational Analyst',
    avatar: '/images/rational-analyst.png',
    description: 'A logical and analytical perspective...'
  },
  'compassionate-mentor': {
    id: 'compassionate-mentor',
    name: 'Compassionate Mentor',
    avatar: '/images/compassionate-mentor.png',
    description: 'A warm and supportive guidance...'
  },
  'encouraging-companion': {
    id: 'encouraging-companion',
    name: 'Encouraging Companion',
    avatar: '/images/encouraging-companion.png',
    description: 'A positive and uplifting presence...'
  }
};
```

**优点**：
- 无需后端 API 调用
- 角色数据始终可用
- 快速加载，无网络延迟
- 前端完全控制，易于维护

---

## 2. 聊天数据模型 (chat.ts)

### ChatMessage 接口

```typescript
interface ChatMessage {
  id: string;                      // 唯一标识（UUID）
  role: 'user' | 'ai';             // 消息发送者
  characterId: CharacterId;        // AI 角色 ID
  content: string;                 // 消息内容
  timestamp: number;               // 时间戳（毫秒）
}
```

**说明**：
- 聊天记录仅在前端内存中存储，不持久化到本地或数据库
- 仅保留本次会话的消息，页面刷新后消息清空
- 情绪分析结果由后端返回，不在前端存储

---

## 3. 情绪数据模型 (emotion.ts)

### EmotionScores 接口

```typescript
interface EmotionScores {
  happy: number;       // 开心 (0-10)
  satisfied: number;   // 满足 (0-10)
  calm: number;        // 平静 (0-10)
  anxious: number;     // 焦虑 (0-10)
  angry: number;       // 愤怒 (0-10)
  sad: number;         // 悲伤 (0-10)
}
```

### EmotionAnalysis 接口

```typescript
interface EmotionAnalysis {
  primary: EmotionType;            // 主要情绪
  secondary?: EmotionType;         // 次要情绪
  scores: EmotionScores;           // 各维度评分（0-10）
  keywords: string[];              // 情绪关键词
}

type EmotionType = 'happy' | 'satisfied' | 'calm' | 'anxious' | 'angry' | 'sad';
```

**说明**：
- EmotionAnalysis 用于分析聊天过程中的情绪状态
- 置信度和危机检测在日记模块处理，不在聊天分析中

### 情绪维度常量

```typescript
enum EmotionDimension {
  HAPPY = 'happy',
  SATISFIED = 'satisfied',
  CALM = 'calm',
  ANXIOUS = 'anxious',
  ANGRY = 'angry',
  SAD = 'sad'
}

const POSITIVE_EMOTIONS = [
  EmotionDimension.HAPPY,
  EmotionDimension.SATISFIED,
  EmotionDimension.CALM
];

const NEGATIVE_EMOTIONS = [
  EmotionDimension.ANXIOUS,
  EmotionDimension.ANGRY,
  EmotionDimension.SAD
];

const EMOTION_COLORS = {
  happy: '#FFD93D',      // 黄色
  satisfied: '#6BCF7F',  // 绿色
  calm: '#4DA6FF',       // 蓝色
  anxious: '#FF9E64',    // 橙色
  angry: '#F55E5E',      // 红色
  sad: '#9B88E0'         // 紫色
};

const EMOTION_LABELS = {
  happy: '开心',
  satisfied: '满足',
  calm: '平静',
  anxious: '焦虑',
  angry: '愤怒',
  sad: '悲伤'
};
```

---

## 4. 日记数据模型 (diary.ts)

### DiaryRecord 接口

```typescript
interface DiaryRecord {
  id: string;                           // 唯一标识（UUID）
  date: string;                         // 日期（YYYY-MM-DD）
  characterId: CharacterId;             // 对话的 AI 角色 ID
  
  // 核心情绪数据
  emotionScores: EmotionScores;        // 该日期的情绪评分
  moodKeywords: [string, string, string];  // 3 个关键词（确切的情绪名称）
  
  // 日记内容（6 个模块）
  moodSummary: string;                 // 今日心情小结
  trendAnalysis: string;               // 情绪变化趋势
  insights: string;                    // 小小觉察
  practice: string;                    // 温柔小练习
  message: string;                     // 今日寄语
  
  // 元数据
  createdAt: number;                   // 创建时间戳
}
```

**说明**：
- 日记数据完全由后端生成和提供
- 前端仅用于显示，不生成或修改
- 用户可以查看历史日记，但不能编辑

---

## 5. 公共数据模型 (common.ts)

### 分页数据

```typescript
interface Pagination<T> {
  items: T[];              // 当前页数据
  total: number;           // 总数
  page: number;            // 当前页（从 1 开始）
  pageSize: number;        // 每页条数
  hasMore: boolean;        // 是否有更多数据
}
```

**用途**：
- 日记列表：用户查看历史日记时分页加载
- 其他列表类接口：如需要

**示例**：
```typescript
// 获取日记列表
const response = await fetch('/api/diary/list?page=1&pageSize=10');
const data: Pagination<DiaryRecord> = await response.json();
```

### API 响应格式

```typescript
interface ApiResponse<T = any> {
  code: number;                       // 响应码 (200 成功, 400+ 错误)
  message: string;                    // 响应信息
  data?: T;                           // 响应数据
  timestamp: number;                  // 响应时间戳
}
```

### 流式响应

```typescript
interface StreamMessage {
  type: 'start' | 'chunk' | 'end' | 'error';
  content?: string;                   // 文本块（type=chunk）
  error?: string;                     // 错误信息（type=error）
}
```

---

## 6. 数据持久化策略

### 不需要持久化的数据

以下数据**不需要**存储到 localStorage 或数据库：

| 数据 | 原因 |
|------|------|
| 聊天记录 | 仅当前会话使用，刷新即清空 |
| 情绪分析 | 由后端生成，不需要本地缓存 |
| 日记内容 | 由后端生成和存储，前端仅显示 |

### 可选的本地缓存

如需缓存提高体验，可缓存以下数据：

```typescript
// 可选：缓存日记列表（用于快速加载）
const CACHE_KEYS = {
  DIARY_LIST: 'emoai:diary:list',      // 日记摘要列表
  CHARACTER_INFO: 'emoai:characters',  // 角色信息
};

// 缓存策略
// - 有效期：30 分钟
// - 用户手动刷新时清空
// - 后端更新时由后端通知清理
```

### 临时会话数据

```typescript
// 只在当前会话保留
const SESSION_DATA = {
  currentChatMessages: [],        // 当前聊天消息
  currentCharacterId: null,       // 当前角色选择
};
```

---

## 7. 类型使用示例

### 在组件中使用

```typescript
<script setup lang="ts">
import type { ChatMessage } from '@/types';

interface Props {
  message: ChatMessage;
}

const props = withDefaults(defineProps<Props>(), {});
</script>
```

### 在 Store 中使用

```typescript
import type { ChatMessage, CharacterId } from '@/types';

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([]);
  const currentCharacterId = ref<CharacterId>('rational-analyst');
  
  function addMessage(message: ChatMessage) {
    messages.value.push(message);
  }
  
  return { messages, currentCharacterId, addMessage };
});
```

### 在 API 服务中使用

```typescript
import type { ChatMessage, EmotionAnalysis } from '@/types';

async function sendMessage(message: ChatMessage): Promise<string> {
  const response = await fetch('/api/chat/send', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
  
  const data = await response.json();
  return data.reply;
}
```

---

## 8. 类型导出 (index.ts)

```typescript
// src/types/index.ts
export type { ChatMessage, CharacterId } from './chat';
export type { EmotionScores, EmotionAnalysis, EmotionType } from './emotion';
export type { DiaryRecord } from './diary';
export type { ApiResponse, StreamMessage, Pagination } from './common';
export type { CharacterInfo } from './common';
```

使用时：
```typescript
import type { ChatMessage, DiaryRecord, CharacterId } from '@/types';
```

---

## 9. 简化的架构优势

由于采用了以下简化方案：

| 方面 | 简化 | 优势 |
|------|------|------|
| 角色数据 | 前端本地常量 | 无需 API 调用，快速加载，前端独立维护 |
| 聊天记录 | 仅内存存储 | 降低前端复杂度，无需同步逻辑 |
| 情绪分析 | 简化模型（0-10分） | 减少复杂度，专注于聊天分析 |
| 日记数据 | 由后端存储 | 用户数据在服务端安全，包含完整分析 |
| 用户系统 | 不实现 | 减少开发工作量 |
| 多语言 | 仅英文 | 简化文案管理 |

这种设计让前端专注于 UI 呈现和用户交互，聊天流程由前端驱动，日记等持久化数据由后端完全处理。

---

## 10. 下一步阅读

- 📄 [开发指南](./development-guide.md) - 类型使用的最佳实践
- 📄 [API 规范](./technical/api-specification.md) - API 请求/响应类型（待补充）
- 📄 [模块设计](./module-design.md) - 各模块的数据流向
