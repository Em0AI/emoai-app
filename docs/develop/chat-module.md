# 聊天模块开发文档

**模块名**：Chat (聊天)  
**文件数**：12 个  
**职责**：实时聊天交互、流式响应、情绪分析显示

---

## 文件清单

```
pages/chat/
└── [characterId].vue               ← 聊天页面 (/chat/:id)

components/chat/
├── ChatWindow.vue                  ← 聊天容器
├── ChatHeader.vue                  ← 聊天头部
├── ChatMessageList.vue             ← 消息列表
├── ChatMessage.vue                 ← 单条消息
├── ChatInput.vue                   ← 输入框
└── EmotionIndicator.vue            ← 情绪显示（雷达图）

composables/
├── useChat.ts                      ← 聊天逻辑
├── useChatStream.ts                ← 流式响应处理
└── useEmotion.ts                   ← 情绪数据处理

stores/
└── chatStore.ts                    ← 状态管理

services/
└── aiService.ts                    ← AI 服务调用
```

---

## 核心流程

```
用户进入聊天页面
  ↓
pages/chat/[characterId].vue
  ├─ useChat() 初始化
  ├─ useChatStore 获取状态
  └─ ChatWindow 渲染
      ├─ ChatHeader 显示角色信息
      ├─ ChatMessageList 显示消息
      │  ├─ ChatMessage ×n
      │  └─ EmotionIndicator 显示情绪
      └─ ChatInput 输入框
          └─ 用户输入消息
              ↓
            aiService.streamChat()
            SSE 流式接收
              ↓
            逐字显示 AI 回复
            更新情绪分析
```

---

## 组件详解

### ChatWindow.vue
```typescript
// Props
interface Props {
  characterId: string
}

// 功能
- 聊天窗口主容器
- 管理消息列表
- 自动滚动到最新消息
- 组织子组件布局
```

### ChatHeader.vue
```typescript
// Props
interface Props {
  character: Character
}

// 功能
- 显示角色头像和名称
- 返回按钮（跳转回首页）
- 当前聊天角色显示
```

### ChatMessageList.vue
```typescript
// Props
interface Props {
  messages: ChatMessage[]
  emotions?: EmotionAnalysis
  isLoading: boolean
}

// 功能
- 遍历显示消息
- 消息自动滚动
- 显示加载状态
- 集成情绪指示器
```

### ChatMessage.vue
```typescript
// Props
interface Props {
  message: ChatMessage
  emotion?: EmotionAnalysis
}

// 功能
- 区分用户/AI 消息
- 用户消息右对齐，AI 消息左对齐
- AI 消息下显示情绪指示器
- 支持流式动画显示
```

### ChatInput.vue
```typescript
// Props
interface Props {
  disabled: boolean
  isLoading: boolean
}

// Events
emit('send-message', content: string)

// 功能
- 输入框组件
- 发送按钮
- 回车发送消息
- 加载状态显示
- 清空输入框
```

### EmotionIndicator.vue
```typescript
// Props
interface Props {
  emotionScores: EmotionScores
}

// 功能
- 显示 6 维度雷达图
- 颜色映射到 EMOTION_COLORS
- 实时更新情绪数据
- 响应式显示
```

---

## Composables 详解

### useChat.ts
```typescript
// 返回
{
  sendMessage(content: string): Promise<void>
  clearMessages(): void
  currentCharacterId: Ref<string>
}

// 功能
- 处理消息发送
- 调用 aiService.streamChat()
- 接收后端返回的情绪分析
- 管理消息列表
```

### useChatStream.ts
```typescript
// 返回
{
  streamResponse(message: string): Observable<string>
  isStreaming: Ref<boolean>
  currentChunk: Ref<string>
  onError(error: Error): void
}

// 功能
- 建立 SSE 连接
- 逐字接收流式数据
- 处理流式事件
- 错误处理
```

### useEmotion.ts
```typescript
// 返回
{
  formatEmotionScores(scores: EmotionScores): object
  getPrimaryEmotion(scores: EmotionScores): EmotionType
  getEmotionColor(emotion: EmotionType): string
}

// 功能
- 格式化情绪数据
- 获取主要情绪
- 映射情绪到颜色
```

---

## Store 详解

### chatStore.ts
```typescript
// State
{
  messages: ChatMessage[]              // 聊天消息列表
  currentCharacterId: CharacterId      // 当前角色 ID
  isLoading: boolean                   // 加载状态
  error?: string                       // 错误信息
}

// Getters
{
  chatHistory(): ChatMessage[]         // 返回消息列表
  currentCharacter(): Character        // 返回当前角色
}

// Actions
{
  addMessage(msg: ChatMessage): void
  clearMessages(): void
  setCharacterId(id: CharacterId): void
  setLoading(bool: boolean): void
  setError(error?: string): void
}
```

---

## Service 详解

### aiService.ts
```typescript
// 方法
chat(characterId: string, message: string): Promise<{
  reply: string
  emotionAnalysis: EmotionAnalysis
}>

streamChat(characterId: string, message: string): Observable<{
  chunk?: string
  emotionAnalysis?: EmotionAnalysis
}>

// 功能
- 调用后端 API: POST /api/chat/send
- 处理流式响应
- 返回 AI 回复和情绪分析
- 错误处理
```

---

## API 交互

### 请求
```json
POST /api/chat/send
{
  "characterId": "rational-analyst",
  "message": "I am feeling stressed today"
}
```

### 响应（完整）
```json
{
  "reply": "Let me help you...",
  "emotionAnalysis": {
    "primary": "anxious",
    "scores": {
      "happy": 2,
      "satisfied": 1,
      "calm": 2,
      "anxious": 8,
      "angry": 3,
      "sad": 5
    },
    "keywords": ["stressed", "worried"]
  }
}
```

### 流式响应（SSE）
```
data: {"chunk": "Let"}
data: {"chunk": " me"}
data: {"chunk": " help"}
data: {"emotionAnalysis": {...}}
```

---

## 与其他模块的关系

```
聊天模块
├─ 首页模块（跳转来源）
├─ 类型模块（ChatMessage, EmotionAnalysis）
├─ 常量模块（EMOTION_COLORS）
├─ 工具模块（格式化、验证）
└─ 服务模块（API 调用）
```

---

## 开发步骤

1. 定义类型（types/chat.ts, types/emotion.ts）
2. 创建 constants/emotions.ts（颜色、标签）
3. 创建 services/apiClient.ts（基础 HTTP）
4. 创建 services/aiService.ts（AI 服务）
5. 创建 composables/useChat.ts
6. 创建 composables/useChatStream.ts
7. 创建 composables/useEmotion.ts
8. 创建 stores/chatStore.ts
9. 创建聊天组件（6 个）
10. 创建 pages/chat/[characterId].vue

---

## 注意事项

- ✅ 消息仅在内存中存储，刷新清空
- ✅ 流式响应使用 SSE，逐字显示
- ✅ 情绪评分范围 0-10
- ✅ 情绪分析用于聊天，不含置信度/危机检测
- ✅ 响应式设计，移动端适配

