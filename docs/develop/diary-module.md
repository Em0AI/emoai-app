# 日记模块开发文档

**模块名**：Diary (日记)  
**文件数**：17 个  
**职责**：日记列表展示、日记详情查看、后端数据获取

---

## 文件清单

```
pages/diary/
├── index.vue                       ← 日记列表页 (/diary)
└── [diaryId].vue                   ← 日记详情页 (/diary/:id)

components/diary/
├── DiaryList.vue                   ← 日记列表容器
├── DiaryCard.vue                   ← 日记卡片
├── DiaryCardHeader.vue             ← 卡片头部
├── DiaryCardPreview.vue            ← 卡片预览文本
├── DiaryCardMeta.vue               ← 卡片元数据
├── DiaryDetail.vue                 ← 日记详情容器
├── DiaryDetailHeader.vue           ← 详情头部
├── DiaryDetailContent.vue          ← 详情内容区
├── DiaryEmotionSummary.vue         ← 情绪总结
├── DiaryTimeline.vue               ← 时间轴（可选）
└── DiaryEmpty.vue                  ← 空状态提示

composables/
├── useDiary.ts                     ← 日记列表逻辑
├── useDiaryDetail.ts               ← 日记详情逻辑
└── useDiaryFormat.ts               ← 日记格式处理

stores/
└── diaryStore.ts                   ← 状态管理

services/
└── diaryService.ts                 ← 日记 API 调用
```

---

## 核心流程

```
用户访问日记页面
  ↓
pages/diary/index.vue
  ├─ useDiary() 获取日记列表
  ├─ diaryService.fetchDiaryList()
  └─ DiaryList 渲染
      ├─ 顶部：筛选/排序按钮
      ├─ DiaryCard ×n（日记卡片）
      │  ├─ DiaryCardHeader（日期、角色）
      │  ├─ DiaryCardPreview（预览文本）
      │  ├─ DiaryCardMeta（情绪、标签）
      │  └─ 点击事件 → /diary/:id
      └─ DiaryEmpty（无数据时显示）

用户点击卡片
  ↓
pages/diary/[diaryId].vue
  ├─ useDiaryDetail() 获取详情
  ├─ diaryService.fetchDiaryDetail(id)
  └─ DiaryDetail 渲染
      ├─ DiaryDetailHeader（返回按钮、日期）
      ├─ DiaryDetailContent（完整内容）
      ├─ DiaryEmotionSummary（情绪分析）
      └─ 返回按钮 → /diary
```

---

## 组件详解

### DiaryList.vue
```typescript
// Props
interface Props {
  diaries: DiaryRecord[]
  isLoading: boolean
  error?: string
}

// Events
emit('select-diary', diaryId: string)
emit('refresh'): void

// 功能
- 日记卡片列表容器
- 支持滚动加载 / 分页
- 无数据显示 DiaryEmpty
- 加载状态显示
```

### DiaryCard.vue
```typescript
// Props
interface Props {
  diary: DiaryRecord
}

// Events
emit('click'): void

// 功能
- 日记卡片组件
- 显示日期、角色、预览
- 鼠标悬停效果
- 点击跳转详情页
```

### DiaryCardHeader.vue
```typescript
// Props
interface Props {
  date: string
  characterId: string
}

// 功能
- 格式化日期显示 (e.g., "Today", "3 days ago")
- 显示角色头像和名字
- 居左对齐
```

### DiaryCardPreview.vue
```typescript
// Props
interface Props {
  content: string
  maxLength?: number  // default: 120
}

// 功能
- 截断内容到 maxLength
- 末尾添加省略号 "..."
- 删除 HTML 标签（纯文本）
```

### DiaryCardMeta.vue
```typescript
// Props
interface Props {
  diaryId: string
  emotions: EmotionScores
  tags?: string[]
}

// 功能
- 显示主要情绪标签 (e.g., "anxious")
- 显示情绪强度指示器
- 显示自定义标签（如果有）
- 紧凑布局
```

### DiaryDetail.vue
```typescript
// Props
interface Props {
  diary: DiaryRecord
  isLoading: boolean
}

// Events
emit('back'): void

// 功能
- 日记详情页容器
- 组织子组件布局
- 处理返回逻辑
```

### DiaryDetailHeader.vue
```typescript
// Props
interface Props {
  diary: DiaryRecord
}

// Events
emit('back'): void

// 功能
- 返回按钮
- 显示完整日期 (e.g., "2024-01-15, Monday")
- 显示角色名称
- 背景优化
```

### DiaryDetailContent.vue
```typescript
// Props
interface Props {
  content: string
}

// 功能
- 日记完整内容显示
- 支持多行文本
- 字体排版优化
- 适配移动端
```

### DiaryEmotionSummary.vue
```typescript
// Props
interface Props {
  emotions: EmotionAnalysis
}

// 功能
- 显示 6 维度雷达图
- 显示主要情绪
- 显示情绪关键词
- 情绪描述文本
```

### DiaryTimeline.vue (可选)
```typescript
// Props
interface Props {
  diaries: DiaryRecord[]
  highlightId?: string
}

// 功能
- 时间轴显示
- 垂直排列日记
- 连接线设计
- 突出当前日记
```

### DiaryEmpty.vue
```typescript
// Props
interface Props {
  reason?: 'no-data' | 'error' | 'no-results'
}

// 功能
- 无日记时显示
- 提示文本
- 图标设计
- 响应式布局
```

---

## Composables 详解

### useDiary.ts
```typescript
// 返回
{
  diaries: Ref<DiaryRecord[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  fetchDiaries(): Promise<void>
  refreshDiaries(): Promise<void>
  sortBy: Ref<'date-desc' | 'date-asc'>
}

// 功能
- 获取日记列表
- 处理加载状态
- 排序和筛选
- 错误处理
```

### useDiaryDetail.ts
```typescript
// 参数
diaryId: string

// 返回
{
  diary: Ref<DiaryRecord | null>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  fetchDetail(): Promise<void>
}

// 功能
- 根据 ID 获取单条日记
- 处理加载和错误状态
- 响应式更新
```

### useDiaryFormat.ts
```typescript
// 返回
{
  formatDate(date: string): string         // "Today", "3 days ago"
  formatFullDate(date: string): string     // "2024-01-15, Monday"
  formatContent(content: string): string   // 移除 HTML 等
  getPreview(content: string, max: number): string
}

// 功能
- 日期格式化
- 内容格式化
- 相对时间计算
```

---

## Store 详解

### diaryStore.ts
```typescript
// State
{
  diaries: DiaryRecord[]               // 日记列表
  currentDiary?: DiaryRecord           // 当前查看的日记
  isLoading: boolean                   // 加载状态
  sortBy: 'date-asc' | 'date-desc'    // 排序方式
  error?: string                       // 错误信息
}

// Getters
{
  diaryList(): DiaryRecord[]           // 按排序返回列表
  totalCount(): number                 // 日记总数
  getDiaryById(id): DiaryRecord | null
}

// Actions
{
  setDiaries(list: DiaryRecord[]): void
  setCurrentDiary(diary: DiaryRecord): void
  setSortBy(sort: string): void
  clearCurrentDiary(): void
  setLoading(bool: boolean): void
}
```

---

## Service 详解

### diaryService.ts
```typescript
// 方法
fetchDiaryList(params?: {
  limit?: number
  offset?: number
  sortBy?: string
}): Promise<DiaryRecord[]>

fetchDiaryDetail(diaryId: string): Promise<DiaryRecord>

// 功能
- 调用后端 API: GET /api/diary/list
- 调用后端 API: GET /api/diary/:id
- 处理响应数据
- 错误处理
```

---

## API 交互

### 获取日记列表
```json
GET /api/diary/list?limit=20&offset=0&sortBy=date-desc

Response:
[
  {
    "id": "diary-001",
    "characterId": "rational-analyst",
    "date": "2024-01-15",
    "content": "Today was productive...",
    "emotionAnalysis": {
      "primary": "satisfied",
      "scores": {...}
    }
  },
  ...
]
```

### 获取日记详情
```json
GET /api/diary/diary-001

Response:
{
  "id": "diary-001",
  "characterId": "rational-analyst",
  "date": "2024-01-15",
  "content": "Today was productive and fulfilling. I managed to complete...",
  "emotionAnalysis": {
    "primary": "satisfied",
    "scores": {
      "happy": 7,
      "satisfied": 8,
      "calm": 6,
      "anxious": 1,
      "angry": 0,
      "sad": 1
    },
    "keywords": ["productive", "fulfilling"]
  }
}
```

---

## 与其他模块的关系

```
日记模块
├─ 首页模块（导航来源）
├─ 聊天模块（无直接交互）
├─ 类型模块（DiaryRecord, EmotionAnalysis）
├─ 常量模块（EMOTION_COLORS）
├─ 工具模块（日期格式化）
└─ 服务模块（API 调用）
```

---

## 开发步骤

1. 定义类型（types/diary.ts）
2. 创建 services/diaryService.ts（API 层）
3. 创建 composables/useDiaryFormat.ts
4. 创建 composables/useDiary.ts
5. 创建 composables/useDiaryDetail.ts
6. 创建 stores/diaryStore.ts
7. 创建日记组件（11 个）
8. 创建 pages/diary/index.vue
9. 创建 pages/diary/[diaryId].vue

---

## 注意事项

- ✅ 日记数据从后端获取（完整内容 + 情绪分析）
- ✅ 后端负责日记生成，前端仅展示
- ✅ 支持日期相对显示（"Today", "3 days ago"）
- ✅ 无编辑功能，仅读取
- ✅ 卡片预览文本最多 120 字符
- ✅ 响应式设计，移动端适配

