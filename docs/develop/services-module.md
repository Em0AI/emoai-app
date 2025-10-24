# 服务模块开发文档

**模块名**：Services (服务)  
**文件数**：4 个  
**职责**：API 通信、AI 服务、错误处理

---

## 文件清单

```
services/
├── apiClient.ts                    ← HTTP 客户端
├── aiService.ts                    ← AI 服务
├── diaryService.ts                 ← 日记服务
└── errorHandler.ts                 ← 错误处理
```

---

## 模块交互图

```
前端组件
  ├─ useChat() / useDiary()
  │  └─ 调用 Services
  │
  ├─ aiService.ts
  │  ├─ streamChat() - 流式聊天
  │  └─ 内部用 apiClient 发送请求
  │
  ├─ diaryService.ts
  │  ├─ fetchDiaryList() - 获取列表
  │  ├─ fetchDiaryDetail() - 获取详情
  │  └─ 内部用 apiClient 发送请求
  │
  ├─ apiClient.ts
  │  ├─ get() / post() - HTTP 方法
  │  ├─ stream() - SSE 流式请求
  │  └─ 异常自动处理
  │
  └─ errorHandler.ts
     ├─ formatError() - 格式化错误
     └─ showNotification() - 用户提示
```

---

## 文件详解

### apiClient.ts
```typescript
// 配置
const API_BASE_URL = process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000'

// 导出方法
export default {
  // HTTP 基础方法
  async get<T>(url: string, config?: RequestInit): Promise<T>
  async post<T>(url: string, data?: any, config?: RequestInit): Promise<T>
  async put<T>(url: string, data?: any, config?: RequestInit): Promise<T>
  async delete<T>(url: string, config?: RequestInit): Promise<T>
  
  // 流式请求
  async stream<T>(url: string, data?: any): Observable<T>
}

// 功能
- 统一 API 请求入口
- 自动添加 headers (Content-Type, etc)
- 自动错误处理（调用 errorHandler）
- 支持流式响应
- 请求/响应拦截
```

### aiService.ts
```typescript
// 导出方法
export default {
  // 完整响应
  async chat(characterId: string, message: string): Promise<{
    reply: string
    emotionAnalysis: EmotionAnalysis
  }>
  
  // 流式响应
  streamChat(characterId: string, message: string): Observable<{
    chunk?: string
    emotionAnalysis?: EmotionAnalysis
  }>
}

// 实现
- chat() 使用 apiClient.post()
- streamChat() 使用 apiClient.stream()
- 异常自动由 apiClient 处理

// API 调用
POST /api/chat/send
  Request: { characterId, message }
  Response: { reply, emotionAnalysis }

SSE /api/chat/stream
  Request: { characterId, message }
  Response: { chunk?, emotionAnalysis? }
```

### diaryService.ts
```typescript
// 导出方法
export default {
  // 获取列表
  async fetchDiaryList(params?: {
    limit?: number      // default: 20
    offset?: number     // default: 0
    sortBy?: string     // 'date-asc' | 'date-desc'
  }): Promise<DiaryRecord[]>
  
  // 获取详情
  async fetchDiaryDetail(diaryId: string): Promise<DiaryRecord>
}

// 实现
- fetchDiaryList() 使用 apiClient.get()
- fetchDiaryDetail() 使用 apiClient.get()
- 异常由 apiClient 自动处理

// API 调用
GET /api/diary/list?limit=20&offset=0&sortBy=date-desc
GET /api/diary/:diaryId
```

### errorHandler.ts
```typescript
// 导出方法
export default {
  // 格式化错误对象
  formatError(error: any): {
    code: string
    message: string
    details?: any
  }
  
  // 显示用户提示
  showNotification(error: any, context?: string): void
  
  // 特定错误处理
  handleAuthError(): void
  handleNetworkError(): void
  handleValidationError(errors: any): void
}

// 错误类型
- Network Error (请求失败)
- HTTP Error (4xx, 5xx)
- Validation Error (参数校验)
- Auth Error (认证失败)
- Timeout Error (请求超时)

// 用户通知
- 显示错误 Toast / Modal
- 可选重试按钮
- 错误日志记录
```

---

## 流程示例

### 示例 1: 完整聊天流程
```typescript
// 组件中
const useChat = () => {
  const sendMessage = async (content: string) => {
    try {
      // 调用 aiService（自动处理错误）
      const result = await aiService.chat(characterId, content)
      
      // 更新 UI
      addMessage({ role: 'user', content })
      addMessage({ role: 'ai', content: result.reply })
      updateEmotions(result.emotionAnalysis)
    } catch (error) {
      // errorHandler 在 apiClient 中已处理
      // 这里不需要再处理，除非有特殊逻辑
    }
  }
}

// apiClient 内部流程
async post(url, data) {
  try {
    const response = await fetch(url, { 
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    return response.json()
  } catch (error) {
    // 自动调用 errorHandler
    errorHandler.showNotification(error, 'chat')
    throw error
  }
}
```

### 示例 2: 流式聊天流程
```typescript
// 组件中
const useChatStream = () => {
  const streamResponse = (message: string) => {
    aiService.streamChat(characterId, message)
      .subscribe({
        next: (data) => {
          if (data.chunk) {
            // 逐字显示
            appendChunk(data.chunk)
          }
          if (data.emotionAnalysis) {
            // 最后一条消息包含情绪分析
            updateEmotions(data.emotionAnalysis)
          }
        },
        error: (error) => {
          // errorHandler 在 apiClient 中已处理
          handleStreamError(error)
        }
      })
  }
}

// apiClient 内部流程
async stream(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    // 返回 Observable
    return parseSSE(response.body)
  } catch (error) {
    errorHandler.showNotification(error, 'stream')
    throw error
  }
}
```

---

## 与其他模块的关系

```
服务模块
├─ 聊天模块
│  ├─ useChat() 调用 aiService.chat()
│  ├─ useChatStream() 调用 aiService.streamChat()
│  └─ 通过 apiClient 发送 HTTP 请求
│
├─ 日记模块
│  ├─ useDiary() 调用 diaryService.fetchDiaryList()
│  ├─ useDiaryDetail() 调用 diaryService.fetchDiaryDetail()
│  └─ 通过 apiClient 发送 HTTP 请求
│
└─ 类型模块
   └─ 依赖 ChatMessage, DiaryRecord, EmotionAnalysis 等类型
```

---

## 环境变量

```bash
# .env.local / .env.production
NUXT_PUBLIC_API_URL=https://api.example.com

# .env.development
NUXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 开发步骤

1. 定义后端 API 契约（URL、请求/响应格式）
2. 创建 services/errorHandler.ts（错误处理）
3. 创建 services/apiClient.ts（HTTP 基础）
4. 创建 services/aiService.ts（AI 相关 API）
5. 创建 services/diaryService.ts（日记相关 API）
6. 在 composables 中集成服务

---

## 注意事项

- ✅ 所有 HTTP 请求统一通过 apiClient
- ✅ 错误处理由 apiClient 和 errorHandler 统一管理
- ✅ 流式请求使用 SSE，返回 Observable
- ✅ 环境变量配置 API 基础 URL
- ✅ 自动错误提示（Toast/Modal）
- ✅ 支持请求超时配置

