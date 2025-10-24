# 常量模块开发文档

**模块名**：Constants (常量)  
**文件数**：3 个  
**职责**：应用常量、配置值、不可变数据

---

## 文件清单

```
constants/
├── characters.ts                   ← 角色常量
├── emotions.ts                     ← 情绪常量
└── api.ts                          ← API 常量
```

---

## 详细常量定义

### constants/characters.ts
```typescript
import type { Character, CharacterId } from '~/types'

// 角色列表（前端常量，不从后端 API 获取）
export const CHARACTERS: Record<CharacterId, Character> = {
  'rational-analyst': {
    id: 'rational-analyst',
    name: '理性分析师',
    avatar: 'https://api.example.com/avatars/analyst.jpg',
    description: '擅长逻辑分析和问题解决，帮你理清思路',
    style: {
      backgroundColor: '#EBF8FF',    // 浅蓝
      primaryColor: '#3B82F6'        // 蓝色
    }
  },
  
  'creative-dreamer': {
    id: 'creative-dreamer',
    name: '创意梦想家',
    avatar: 'https://api.example.com/avatars/dreamer.jpg',
    description: '充满想象力和创意，激发你的灵感',
    style: {
      backgroundColor: '#FDF2F8',    // 浅粉
      primaryColor: '#EC4899'        // 粉色
    }
  },
  
  'mindful-sage': {
    id: 'mindful-sage',
    name: '冥想智者',
    avatar: 'https://api.example.com/avatars/sage.jpg',
    description: '专注当下和内心平和，引导心灵成长',
    style: {
      backgroundColor: '#ECFDF5',    // 浅绿
      primaryColor: '#10B981'        // 绿色
    }
  }
}

// 角色 ID 列表
export const CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterId[]
```

### constants/emotions.ts
```typescript
import type { EmotionType, EmotionScores } from '~/types'

// 情绪类型
export const EMOTION_TYPES: EmotionType[] = [
  'happy',      // 愉快
  'satisfied',  // 满足
  'calm',       // 平静
  'anxious',    // 焦虑
  'angry',      // 愤怒
  'sad'         // 伤心
]

// 情绪颜色映射（用于 UI 展示）
export const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: '#FBBF24',      // 琥珀色
  satisfied: '#34D399',  // 绿色
  calm: '#60A5FA',       // 蓝色
  anxious: '#F87171',    // 红色
  angry: '#EF4444',      // 深红
  sad: '#A78BFA'         // 紫色
}

// 情绪标签（中文）
export const EMOTION_LABELS: Record<EmotionType, string> = {
  happy: '愉快',
  satisfied: '满足',
  calm: '平静',
  anxious: '焦虑',
  angry: '愤怒',
  sad: '伤心'
}

// 情绪强度等级
export const EMOTION_INTENSITY = {
  LOW: 3,        // 0-3 分为低
  MEDIUM: 6,     // 4-6 分为中
  HIGH: 10       // 7-10 分为高
}

// 默认情绪评分（初始化用）
export const DEFAULT_EMOTION_SCORES: EmotionScores = {
  happy: 5,
  satisfied: 5,
  calm: 5,
  anxious: 0,
  angry: 0,
  sad: 0
}

// 获取情绪强度标签
export const getEmotionIntensity = (score: number): 'low' | 'medium' | 'high' => {
  if (score <= EMOTION_INTENSITY.LOW) return 'low'
  if (score <= EMOTION_INTENSITY.MEDIUM) return 'medium'
  return 'high'
}
```

### constants/api.ts
```typescript
// API 基础 URL
export const API_BASE_URL = process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000'

// API 端点常量
export const API_ENDPOINTS = {
  // 聊天相关
  CHAT_SEND: '/api/chat/send',
  CHAT_STREAM: '/api/chat/stream',
  
  // 日记相关
  DIARY_LIST: '/api/diary/list',
  DIARY_DETAIL: (diaryId: string) => `/api/diary/${diaryId}`,
  
  // 可能的扩展
  // USER_PROFILE: '/api/user/profile',
  // USER_SETTINGS: '/api/user/settings'
}

// 请求超时设置（毫秒）
export const REQUEST_TIMEOUT = 30000  // 30 秒

// 流式请求超时（毫秒）
export const STREAM_TIMEOUT = 120000  // 2 分钟

// 重试配置
export const RETRY_CONFIG = {
  max_retries: 3,
  retry_delay: 1000,  // 1 秒
  backoff_multiplier: 2  // 指数退避
}

// HTTP 状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
}

// 错误代码常量
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN'
}
```

---

## 常量使用示例

### 示例 1: 在首页模块中使用角色常量
```typescript
// pages/index.vue
<script setup lang="ts">
import { CHARACTERS, CHARACTER_IDS } from '~/constants/characters'

const characters = CHARACTERS
const ids = CHARACTER_IDS

onMounted(() => {
  // 获取所有角色
  const allCharacters = ids.map(id => characters[id])
})
</script>
```

### 示例 2: 在情绪显示组件中使用情绪常量
```typescript
// components/chat/EmotionIndicator.vue
<script setup lang="ts">
import { EMOTION_COLORS, EMOTION_LABELS, EMOTION_TYPES } from '~/constants/emotions'
import type { EmotionScores } from '~/types'

interface Props {
  emotionScores: EmotionScores
}

const props = defineProps<Props>()

// 获取颜色
const getColor = (emotion: string) => EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]

// 获取标签
const getLabel = (emotion: string) => EMOTION_LABELS[emotion as keyof typeof EMOTION_LABELS]

// 遍历所有情绪类型
const emotionEntries = EMOTION_TYPES.map(type => ({
  type,
  label: getLabel(type),
  score: props.emotionScores[type],
  color: getColor(type)
}))
</script>
```

### 示例 3: 在服务中使用 API 常量
```typescript
// services/aiService.ts
import { API_ENDPOINTS, STREAM_TIMEOUT } from '~/constants/api'

export default {
  async chat(characterId: string, message: string) {
    const response = await apiClient.post(
      API_ENDPOINTS.CHAT_SEND,
      { characterId, message }
    )
    return response
  },
  
  streamChat(characterId: string, message: string) {
    return apiClient.stream(
      API_ENDPOINTS.CHAT_STREAM,
      { characterId, message },
      { timeout: STREAM_TIMEOUT }
    )
  }
}
```

---

## 与其他模块的关系

```
常量模块
├─ 首页模块 ← CHARACTERS, CHARACTER_IDS
├─ 聊天模块 ← EMOTION_COLORS, EMOTION_LABELS, API_ENDPOINTS
├─ 日记模块 ← EMOTION_COLORS, API_ENDPOINTS
├─ 公共模块 ← 无直接依赖
├─ 服务模块 ← API_ENDPOINTS, API_BASE_URL, RETRY_CONFIG
└─ 工具模块 ← 无直接依赖
```

---

## 开发步骤

1. 创建 constants/emotions.ts（定义情绪常量）
2. 创建 constants/characters.ts（定义角色常量）
3. 创建 constants/api.ts（定义 API 常量）
4. 在各模块中通过 import 使用

---

## 注意事项

- ✅ 常量使用 UPPER_SNAKE_CASE 命名
- ✅ 角色常量直接定义在前端（不从 API 获取）
- ✅ 颜色值为十六进制代码，需要支持 Tailwind
- ✅ API 基础 URL 从环境变量读取
- ✅ 超时时间单位统一为毫秒
- ✅ 常量应该是不可变的

