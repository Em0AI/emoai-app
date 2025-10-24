# EmoAI 项目框架文档

**项目名称**：EmoAI  
**描述**：AI 心理陪伴应用，提供聊天、日记、情绪分析功能  
**最后更新**：2025年10月18日

---

## 技术栈

### 前端框架

| 类别 | 名称 | 版本 | 说明 |
|------|------|------|------|
| **JS 框架** | Nuxt.js | 3.x | 全栈 Vue 框架，支持 SSR/SSG |
| **语言** | TypeScript | 5.x | 类型安全的 JavaScript 超集 |
| **UI 框架** | @nuxt/ui | 2.x | Nuxt 原生 UI 组件库 |
| **图标库** | iconify | 最新 | 大规模开源图标库 |
| **样式** | TailwindCSS | 3.x | 原子化 CSS 框架（集成于 @nuxt/ui） |

### 构建和开发

| 类别 | 名称 | 版本 | 说明 |
|------|------|------|------|
| **构建工具** | Vite | 5.x | 极速前端构建工具 |
| **代码格式化** | Prettier | 3.x | 代码格式化工具 |
| **代码检查** | ESLint | 8.x | 代码质量检查工具 |
| **测试框架** | vitest | 最新 | Vite 原生单元测试 |

### 状态和数据

| 类别 | 名称 | 版本 | 说明 |
|------|------|------|------|
| **状态管理** | Pinia | 2.x | Vue 3 官方推荐状态管理 |
| **AI 集成** | ai-sdk | 3.x | 统一 LLM 接口，支持多个提供商 |
| **流式传输** | eventsource-polyfill | 最新 | SSE 事件流 polyfill |

### 部署

| 类别 | 名称 | 说明 |
|------|------|------|
| **部署平台** | Vercel | 无服务器部署，自动化 CI/CD |

---

## 项目架构

### 前端目录结构

```
src/
├── pages/                          # Nuxt 自动路由
│   ├── index.vue                   # 首页 (/)
│   ├── chat/
│   │   └── [characterId].vue       # 聊天页面
│   └── diary/
│       ├── index.vue               # 日记列表
│       └── [date].vue              # 日记详情
│
├── components/                     # Vue 组件 (26 个)
│   ├── home/                       # 首页模块
│   ├── chat/                       # 聊天模块
│   ├── diary/                      # 日记模块
│   └── common/                     # 公共模块
│
├── stores/                         # Pinia 状态管理 (2 个)
│   ├── chatStore.ts
│   └── diaryStore.ts
│
├── composables/                    # 组合函数 (5 个)
│   ├── useChat.ts
│   ├── useChatStream.ts
│   ├── useEmotion.ts
│   ├── useDiary.ts
│   └── useDiaryList.ts
│
├── services/                       # API 服务层 (4 个)
│   ├── apiClient.ts
│   ├── aiService.ts
│   ├── diaryService.ts
│   └── errorHandler.ts
│
├── types/                          # TypeScript 类型 (6 个)
├── constants/                      # 常量值 (3 个)
├── utils/                          # 工具函数 (3 个)
├── layouts/                        # 布局 (1 个)
└── assets/                         # 静态资源
```

### 8 大模块

```
1. 首页模块 (Home)        → 4 个文件
   首页展示和角色选择

2. 聊天模块 (Chat)        → 12 个文件
   实时聊天、流式响应、情绪显示

3. 日记模块 (Diary)       → 17 个文件
   日记列表、详情查看、6 模块展示

4. 公共模块 (Common)      → 7 个文件
   导航、页脚、提示等共用组件

5. 服务模块 (Services)    → 4 个文件
   API 通信、错误处理

6. 类型模块 (Types)       → 6 个文件
   TypeScript 类型定义

7. 常量模块 (Constants)   → 3 个文件
   常量值管理

8. 工具模块 (Utils)       → 3 个文件
   工具函数库

总计：56 个文件
```

## 开发规范

### TypeScript 严格模式

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "esModuleInterop": true
  }
}
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件名（组件） | PascalCase | `ChatWindow.vue` |
| 文件名（函数/工具） | camelCase | `useChat.ts` |
| 变量和函数 | camelCase | `const userName = ''` |
| 常量值 | UPPER_SNAKE_CASE | `const API_BASE_URL = ''` |
| 类型名 | PascalCase | `interface ChatMessage {}` |

### 函数式组件

```typescript
// 使用 <script setup> 和 Composition API
<script setup lang="ts">
import type { Props } from '@/types'

interface Props {
  message: string
}

defineProps<Props>()
</script>
```

### 代码检查和格式化

```bash
npm run lint         # ESLint 检查
npm run format       # Prettier 格式化
npm run typecheck    # TypeScript 类型检查
```

## 数据模型

### 聊天消息
```typescript
interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  characterId: string
  content: string
  timestamp: number
}
```

### 情绪分析
```typescript
interface EmotionScores {
  happy: number        // 0-10
  satisfied: number    // 0-10
  calm: number         // 0-10
  anxious: number      // 0-10
  angry: number        // 0-10
  sad: number          // 0-10
}

interface EmotionAnalysis {
  primary: EmotionType
  secondary?: EmotionType
  scores: EmotionScores
  keywords: string[]
}
```

### 日记记录
```typescript
interface DiaryRecord {
  id: string
  date: string                    // YYYY-MM-DD
  characterId: string
  emotionScores: EmotionScores
  moodKeywords: [string, string, string]
  moodSummary: string
  trendAnalysis: string
  insights: string
  practice: string
  message: string
  createdAt: number
}
```

## API 规范

### 响应格式
```typescript
interface ApiResponse<T> {
  code: number              // 200 成功, 400+ 错误
  message: string
  data?: T
  timestamp: number
}
```

### 流式响应
使用 **EventSource（SSE）** 处理 AI 流式回复

## 性能优化

- ✅ 代码分割：Nuxt 自动按路由分割
- ✅ 组件懒加载：`defineAsyncComponent()` 动态导入
- ✅ 图片优化：`<NuxtImg>` 自动优化
- ✅ 流式响应：SSE 逐字显示
- ✅ 缓存策略：日记列表本地缓存

## 本地开发

```bash
npm install              # 安装依赖
npm run dev             # 启动开发服务器
npm run build           # 生产构建
npm run preview         # 预览生产版本
npm run test            # 运行单元测试
```

## 部署到 Vercel

```bash
# Vercel 自动检测 nuxt.config.ts
# 自动构建和部署
vercel deploy
```

## 安全措施

- ✅ XSS 防护：Vue 3 自动转义模板
- ✅ 输入验证：表单验证工具
- ✅ 敏感信息：环境变量管理
- ✅ API 验证：请求验证
