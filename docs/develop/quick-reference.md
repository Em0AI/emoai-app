# 快速参考：关键数据结构

## 1. 角色 (Character)

**来源**：前端常量  
**位置**：`src/constants/characters.ts`

```typescript
export const CHARACTERS: Record<string, Character> = {
  'rational-analyst': {
    id: 'rational-analyst',
    name: 'Rational Analyst',
    avatar: '/images/rational-analyst.png',
    description: 'Helps you think through challenges with logic and clarity'
  },
  // ...
};
```

---

## 2. 情绪评分 (0-10 分制)

```typescript
interface EmotionScores {
  happy: number;       // 0-10
  satisfied: number;   // 0-10
  calm: number;        // 0-10
  anxious: number;     // 0-10
  angry: number;       // 0-10
  sad: number;         // 0-10
}
```

### 聊天中的情绪分析

```typescript
interface EmotionAnalysis {
  primary: EmotionType;
  secondary?: EmotionType;
  scores: EmotionScores;      // 0-10 分
  keywords: string[];
  // ✅ 无置信度、无危机检测
}
```

---

## 3. 聊天消息

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  characterId: CharacterId;
  content: string;
  timestamp: number;
}
```

**存储**：Pinia store（内存）  
**清空**：页面刷新

---

## 4. 日记记录

```typescript
interface DiaryRecord {
  id: string;
  date: string;                              // YYYY-MM-DD
  characterId: CharacterId;
  emotionScores: EmotionScores;              // 0-10 分
  moodKeywords: [string, string, string];
  
  // 后端生成内容
  moodSummary: string;
  trendAnalysis: string;
  insights: string;
  practice: string;
  message: string;
  
  createdAt: number;
}
```

**来源**：后端 API  
**生成**：完全由后端处理

---

## 5. API 响应格式

```typescript
interface ApiResponse<T> {
  code: number;           // 200 成功，400+ 错误
  message: string;
  data?: T;
  timestamp: number;
}

interface Pagination<T> {
  items: T[];
  total: number;
  page: number;           // 从 1 开始
  pageSize: number;
  hasMore: boolean;
}
```

---

## 6. 流式响应

```typescript
interface StreamMessage {
  type: 'start' | 'chunk' | 'end' | 'error';
  content?: string;
  error?: string;
}
```

---

## 职责矩阵

| 功能 | 前端 | 后端 |
|------|------|------|
| 角色定义 | ✅ 常量 | ❌ |
| 聊天消息 | ✅ 内存存储 | ❌ |
| 情绪分析（简单） | ❌ | ✅ |
| 情绪分析（深度） | ❌ | ✅ |
| 日记生成 | ❌ | ✅ |
| 日记存储 | ❌ | ✅ |
| UI 渲染 | ✅ | ❌ |
| 流式显示 | ✅ | ❌ |

---

## 关键路由

```
/                      首页（角色选择）
/chat/[characterId]    聊天页面
/diary                 日记页面
/diary/[date]          特定日期日记
```

---

## 重要文档

- 📄 `data-models.md` - 详细数据结构定义
- 📄 `module-design.md` - 模块架构
- 📄 `system-architecture.md` - 系统设计
- 📄 `architecture-simplification.md` - 简化说明
- 📄 `feedback-summary.md` - 本次更新总结
- 📄 `getting-started.md` - 开发指南
- 📄 `technical/ai-integration.md` - AI 集成

