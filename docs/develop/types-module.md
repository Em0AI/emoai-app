# 类型模块开发文档

**模块名**：Types (类型)  
**文件数**：6 个  
**职责**：TypeScript 类型定义、API 契约

---

## 文件清单

```
types/
├── index.ts                        ← 类型导出入口
├── character.ts                    ← 角色类型
├── chat.ts                         ← 聊天类型
├── diary.ts                        ← 日记类型
├── emotion.ts                      ← 情绪类型
└── api.ts                          ← API 请求/响应类型
```

---

## 详细类型定义

### types/index.ts
```typescript
// 统一导出所有类型
export * from './character'
export * from './chat'
export * from './diary'
export * from './emotion'
export * from './api'
```

### types/character.ts
```typescript
// 角色 ID 类型
export type CharacterId = 
  | 'rational-analyst' 
  | 'creative-dreamer' 
  | 'mindful-sage'

// 角色信息
export interface Character {
  id: CharacterId
  name: string                    // 中文名称
  avatar: string                  // 头像 URL
  description: string             // 角色描述
  style: {
    backgroundColor: string       // 背景颜色
    primaryColor: string          // 主颜色
  }
}
```

### types/chat.ts
```typescript
// 消息发送者
export type MessageRole = 'user' | 'ai'

// 聊天消息
export interface ChatMessage {
  id: string                       // 唯一 ID (uuid)
  role: MessageRole                // 发送者 (用户/AI)
  content: string                  // 消息内容
  timestamp: string                // ISO 时间戳
  emotion?: EmotionAnalysis        // 情绪分析（AI 消息时）
}

// 聊天历史
export interface ChatHistory {
  characterId: CharacterId
  messages: ChatMessage[]
  updatedAt: string
}
```

### types/diary.ts
```typescript
// 日记记录
export interface DiaryRecord {
  id: string                       // 唯一 ID
  characterId: CharacterId         // 角色 ID
  date: string                     // 日期 (YYYY-MM-DD)
  content: string                  // 日记内容（支持多行）
  emotionAnalysis: EmotionAnalysis // 情绪分析
  createdAt: string                // 创建时间
  updatedAt: string                // 更新时间
}

// 日记列表项
export interface DiaryListItem {
  id: string
  characterId: CharacterId
  date: string
  preview: string                  // 预览文本（截断 120 字）
  emotionScores: EmotionScores
  primaryEmotion: EmotionType
}
```

### types/emotion.ts
```typescript
// 情绪类型
export type EmotionType = 
  | 'happy' 
  | 'satisfied' 
  | 'calm' 
  | 'anxious' 
  | 'angry' 
  | 'sad'

// 情绪评分（0-10 scale）
export interface EmotionScores {
  happy: number           // 0-10
  satisfied: number       // 0-10
  calm: number            // 0-10
  anxious: number         // 0-10
  angry: number           // 0-10
  sad: number             // 0-10
}

// 情绪分析结果
export interface EmotionAnalysis {
  primary: EmotionType              // 主要情绪
  scores: EmotionScores             // 6 维度评分
  keywords: string[]                // 情绪关键词
}
```

### types/api.ts
```typescript
// ===== 聊天 API =====

// POST /api/chat/send
export interface ChatSendRequest {
  characterId: CharacterId
  message: string
}

export interface ChatSendResponse {
  reply: string
  emotionAnalysis: EmotionAnalysis
}

// SSE /api/chat/stream
export interface ChatStreamRequest {
  characterId: CharacterId
  message: string
}

export interface ChatStreamMessage {
  chunk?: string                    // 流式文本块
  emotionAnalysis?: EmotionAnalysis // 最后消息时包含
}

// ===== 日记 API =====

// GET /api/diary/list
export interface DiaryListRequest {
  limit?: number           // default: 20
  offset?: number          // default: 0
  sortBy?: 'date-asc' | 'date-desc'
}

export interface DiaryListResponse extends Array<DiaryRecord> {}

// GET /api/diary/:diaryId
export interface DiaryDetailRequest {
  diaryId: string
}

export interface DiaryDetailResponse extends DiaryRecord {}

// ===== 通用错误 =====

export interface ApiError {
  code: string             // 错误代码
  message: string          // 错误消息（中文）
  details?: any            // 额外信息
  timestamp: string        // 时间戳
}
```

---

## 类型使用示例

### 示例 1: 在 Composable 中使用
```typescript
// composables/useChat.ts
import type { ChatMessage, EmotionAnalysis, ChatSendResponse } from '~/types'

export const useChat = () => {
  const messages: Ref<ChatMessage[]> = ref([])
  
  const addMessage = (msg: ChatMessage): void => {
    messages.value.push(msg)
  }
  
  const updateEmotion = (emotion: EmotionAnalysis): void => {
    // 类型安全的操作
    const { primary, scores, keywords } = emotion
    // ...
  }
  
  return { messages, addMessage, updateEmotion }
}
```

### 示例 2: 在服务中使用
```typescript
// services/aiService.ts
import type { 
  ChatSendRequest, 
  ChatSendResponse, 
  ChatStreamMessage 
} from '~/types'

export default {
  async chat(
    characterId: string, 
    message: string
  ): Promise<ChatSendResponse> {
    const request: ChatSendRequest = {
      characterId,
      message
    }
    
    const response = await apiClient.post<ChatSendResponse>(
      '/api/chat/send',
      request
    )
    
    return response
  }
}
```

### 示例 3: 在存储中使用
```typescript
// stores/chatStore.ts
import type { ChatMessage, ChatHistory } from '~/types'

export const useChatStore = defineStore('chat', () => {
  const history: Ref<ChatHistory[]> = ref([])
  
  const addMessage = (msg: ChatMessage): void => {
    // 类型检查：msg 必须符合 ChatMessage 接口
    const newMessage: ChatMessage = msg
    // ...
  }
  
  return { history, addMessage }
})
```

---

## 类型关系图

```
EmotionScores ← 用于 → EmotionAnalysis ← 用于 → ChatMessage
    ↑                        ↑                        ↑
    ├─ 用于                  ├─ 用于              ├─ 用于
    │  DiaryRecord           │  ChatSendResponse  │  ChatHistory
    │  DiaryListItem         │                    │
    └─ 用于                  └─ 用于              └─ 用于
       DiaryEmotionSummary      DiaryRecord          useChat()

CharacterId ← 用于 → Character ← 用于 → ChatMessage
    ↑                   ↑               ↑
    ├─ 用于            ├─ 用于      ├─ 用于
    │  DiaryRecord     │  CHARACTERS │  chatStore
    │  ChatMessage     └─ 用于      └─ 用于
    └─ 用于              组件数据      页面上下文
       API 请求
```

---

## 与其他模块的关系

```
类型模块
├─ 首页模块 → Character
├─ 聊天模块 → ChatMessage, EmotionAnalysis, ChatStreamMessage
├─ 日记模块 → DiaryRecord, DiaryListItem
├─ 服务模块 → ChatSendRequest, ChatSendResponse, DiaryListResponse
└─ 常量模块 → 无（常量提供运行时值）
```

---

## 开发步骤

1. 创建 types/index.ts（导出入口）
2. 创建 types/emotion.ts（情绪类型，最基础）
3. 创建 types/character.ts（角色类型）
4. 创建 types/chat.ts（聊天类型）
5. 创建 types/diary.ts（日记类型）
6. 创建 types/api.ts（API 契约）
7. 在其他模块中 import 使用

---

## 注意事项

- ✅ 所有类型统一通过 types/index.ts 导出
- ✅ 使用 `import type` 导入（不增加运行时代码）
- ✅ EmotionScores 都是 0-10 范围
- ✅ 日期格式统一为 ISO 8601 (YYYY-MM-DD)
- ✅ 时间戳统一为 ISO 格式
- ✅ 所有字符串 ID 使用 uuid
- ✅ 类型和接口命名要清晰（避免歧义）

