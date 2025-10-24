# 工具模块开发文档

**模块名**：Utils (工具)  
**文件数**：3 个  
**职责**：通用工具函数、格式化、验证

---

## 文件清单

```
utils/
├── format.ts                       ← 格式化工具
├── validators.ts                   ← 验证工具
└── datetime.ts                     ← 日期时间工具
```

---

## 详细工具定义

### utils/format.ts
```typescript
import type { EmotionScores } from '~/types'

/**
 * 格式化文本长度
 * @param text - 原始文本
 * @param maxLength - 最大长度
 * @param suffix - 后缀 (default: '...')
 * @returns 格式化后的文本
 */
export const truncateText = (
  text: string,
  maxLength: number = 120,
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + suffix
}

/**
 * 移除 HTML 标签
 * @param html - HTML 文本
 * @returns 纯文本
 */
export const stripHtml = (html: string): string => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/**
 * 获取主要情绪
 * @param scores - 情绪评分
 * @returns 最高分的情绪类型
 */
export const getPrimaryEmotion = (scores: EmotionScores): string => {
  return Object.entries(scores).reduce((max, [emotion, score]) =>
    score > scores[max as keyof EmotionScores] ? emotion : max
  )
}

/**
 * 格式化情绪评分为百分比
 * @param score - 0-10 的评分
 * @returns 百分比字符串 (e.g., '70%')
 */
export const emotionScoreToPercentage = (score: number): string => {
  const percentage = Math.round((score / 10) * 100)
  return `${percentage}%`
}

/**
 * 格式化数字为货币或数字格式
 * @param value - 数值
 * @param options - 格式化选项
 * @returns 格式化字符串
 */
export const formatNumber = (
  value: number,
  options?: {
    decimals?: number
    prefix?: string
    suffix?: string
  }
): string => {
  const { decimals = 0, prefix = '', suffix = '' } = options || {}
  const formatted = value.toFixed(decimals)
  return `${prefix}${formatted}${suffix}`
}

/**
 * 检查字符串是否为空或仅空格
 * @param str - 检查的字符串
 * @returns 是否为空
 */
export const isEmpty = (str: string | null | undefined): boolean => {
  return !str || str.trim().length === 0
}
```

### utils/validators.ts
```typescript
import type { CharacterId, EmotionScores } from '~/types'
import { CHARACTER_IDS } from '~/constants/characters'

/**
 * 验证角色 ID 是否有效
 * @param id - 角色 ID
 * @returns 是否有效
 */
export const isValidCharacterId = (id: unknown): id is CharacterId => {
  return typeof id === 'string' && CHARACTER_IDS.includes(id as CharacterId)
}

/**
 * 验证情绪评分
 * @param scores - 情绪评分对象
 * @returns 是否有效
 */
export const isValidEmotionScores = (scores: unknown): scores is EmotionScores => {
  if (typeof scores !== 'object' || scores === null) return false
  
  const emotionKeys = ['happy', 'satisfied', 'calm', 'anxious', 'angry', 'sad']
  const scoreObj = scores as Record<string, unknown>
  
  return emotionKeys.every(key => {
    const value = scoreObj[key]
    return typeof value === 'number' && value >= 0 && value <= 10
  })
}

/**
 * 验证消息内容
 * @param content - 消息内容
 * @returns { valid: boolean, error?: string }
 */
export const validateMessageContent = (content: unknown): { valid: boolean; error?: string } => {
  if (typeof content !== 'string') {
    return { valid: false, error: '消息必须是字符串' }
  }
  
  if (content.trim().length === 0) {
    return { valid: false, error: '消息不能为空' }
  }
  
  if (content.length > 5000) {
    return { valid: false, error: '消息过长（最多 5000 字）' }
  }
  
  return { valid: true }
}

/**
 * 验证日期格式
 * @param date - 日期字符串 (YYYY-MM-DD)
 * @returns 是否有效
 */
export const isValidDateFormat = (date: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(date)) return false
  
  // 额外检查日期合法性
  const d = new Date(date)
  return d instanceof Date && !isNaN(d.getTime())
}

/**
 * 验证 ISO 时间戳
 * @param timestamp - ISO 时间戳
 * @returns 是否有效
 */
export const isValidIsoTimestamp = (timestamp: string): boolean => {
  const date = new Date(timestamp)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * 验证 UUID 格式
 * @param uuid - UUID 字符串
 * @returns 是否有效
 */
export const isValidUuid = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
```

### utils/datetime.ts
```typescript
/**
 * 获取相对时间文本
 * @param date - 日期字符串或 Date 对象
 * @returns 相对时间 (e.g., 'Today', '3 days ago', '2 months ago')
 */
export const getRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''} ago`
  }
  
  const years = Math.floor(diffDays / 365)
  return `${years} year${years > 1 ? 's' : ''} ago`
}

/**
 * 格式化日期为完整格式
 * @param date - 日期字符串或 Date 对象
 * @param locale - 语言 (default: 'zh-CN')
 * @returns 格式化字符串 (e.g., '2024年1月15日，星期一')
 */
export const formatFullDate = (date: string | Date, locale: string = 'zh-CN'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(d)
}

/**
 * 格式化日期为短格式
 * @param date - 日期字符串或 Date 对象 (YYYY-MM-DD)
 * @returns 格式化字符串 (e.g., '2024-01-15')
 */
export const formatShortDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取今天的日期字符串
 * @returns 今天的日期 (YYYY-MM-DD)
 */
export const getTodayDate = (): string => {
  return formatShortDate(new Date())
}

/**
 * 获取昨天的日期字符串
 * @returns 昨天的日期 (YYYY-MM-DD)
 */
export const getYesterdayDate = (): string => {
  const today = new Date()
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  return formatShortDate(yesterday)
}

/**
 * 格式化时间戳为时间字符串
 * @param timestamp - ISO 时间戳
 * @returns 时间字符串 (HH:MM:SS)
 */
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

/**
 * 获取当前 ISO 时间戳
 * @returns ISO 格式的时间戳
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString()
}
```

---

## 工具使用示例

### 示例 1: 在组件中使用格式化工具
```typescript
// components/diary/DiaryCard.vue
<script setup lang="ts">
import { truncateText, stripHtml } from '~/utils/format'
import { getRelativeTime } from '~/utils/datetime'
import type { DiaryRecord } from '~/types'

interface Props {
  diary: DiaryRecord
}

const props = defineProps<Props>()

const preview = computed(() => {
  const cleanContent = stripHtml(props.diary.content)
  return truncateText(cleanContent, 120)
})

const relativeDate = computed(() => {
  return getRelativeTime(props.diary.date)
})
</script>
```

### 示例 2: 在 Composable 中使用验证工具
```typescript
// composables/useChat.ts
import { validateMessageContent, isValidCharacterId } from '~/utils/validators'

export const useChat = () => {
  const sendMessage = (content: string, characterId: string) => {
    // 验证字符内容
    const msgValidation = validateMessageContent(content)
    if (!msgValidation.valid) {
      showError(msgValidation.error)
      return
    }
    
    // 验证角色 ID
    if (!isValidCharacterId(characterId)) {
      showError('无效的角色 ID')
      return
    }
    
    // 发送消息...
  }
}
```

### 示例 3: 在服务中使用日期工具
```typescript
// services/diaryService.ts
import { getTodayDate } from '~/utils/datetime'

export default {
  async fetchDiaryList() {
    // 获取今天的日期
    const today = getTodayDate()
    
    const response = await apiClient.get('/api/diary/list', {
      params: { date: today }
    })
    
    return response
  }
}
```

---

## 与其他模块的关系

```
工具模块
├─ 首页模块 ← 无直接依赖
├─ 聊天模块 ← validateMessageContent, truncateText
├─ 日记模块 ← getRelativeTime, formatFullDate, truncateText
├─ 公共模块 ← formatNumber
├─ 服务模块 ← 无直接依赖
├─ 类型模块 ← 无依赖
└─ 常量模块 ← 无依赖
```

---

## 开发步骤

1. 创建 utils/format.ts（格式化工具）
2. 创建 utils/validators.ts（验证工具）
3. 创建 utils/datetime.ts（日期时间工具）
4. 在需要的模块中 import 使用

---

## 注意事项

- ✅ 工具函数需要充分的 JSDoc 文档
- ✅ 类型参数应该明确指定
- ✅ 函数应该是纯函数（无副作用）
- ✅ 错误处理应该返回有意义的结果，而不是抛出异常
- ✅ 日期处理统一使用 YYYY-MM-DD 格式
- ✅ 所有时间戳统一为 ISO 8601 格式
- ✅ 验证函数应该返回布尔值或详细的验证结果对象

