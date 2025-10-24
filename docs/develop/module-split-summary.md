# ✅ 模块拆分确认表 - 快速查看

**日期**：2025年10月18日

---

## 🎯 模块分解总览

### Module 1: 首页 (Home)
```
首页
├─ 页面：pages/index.vue
├─ 组件：3 个 (Card, Grid, Section)
└─ 文件数：4
```

| 项目 | 数量 | 文件 |
|------|------|------|
| 页面 | 1 | pages/index.vue |
| 组件 | 3 | CharacterCard, Grid, Section |
| Store | 0 | - |
| Composable | 0 | - |
| Service | 0 | - |
| **小计** | **4** | - |

---

### Module 2: 聊天 (Chat)
```
聊天交互
├─ 页面：pages/chat/[characterId].vue
├─ 组件：6 个
├─ Composables：3 个 (useChat, useChatStream, useEmotion)
├─ Store：1 个 (chatStore)
└─ Service：1 个 (aiService)
```

| 项目 | 数量 | 文件 |
|------|------|------|
| 页面 | 1 | pages/chat/[characterId].vue |
| 组件 | 6 | ChatWindow, Header, MessageList, Message, Input, EmotionIndicator |
| Composables | 3 | useChat, useChatStream, useEmotion |
| Store | 1 | chatStore.ts |
| Service | 1 | aiService.ts |
| **小计** | **12** | - |

---

### Module 3: 日记 (Diary)
```
日记查看
├─ 页面：2 个 (list, detail)
├─ 组件：11 个
├─ Composables：2 个 (useDiary, useDiaryList)
├─ Store：1 个 (diaryStore)
└─ Service：1 个 (diaryService)
```

| 项目 | 数量 | 文件 |
|------|------|------|
| 页面 | 2 | index.vue, [date].vue |
| 组件 | 11 | List, Card, Detail, Header, Content, MoodSummary, Trend, Insights, Practice, Message, EmotionRadar |
| Composables | 2 | useDiary, useDiaryList |
| Store | 1 | diaryStore.ts |
| Service | 1 | diaryService.ts |
| **小计** | **17** | - |

---

### Module 4: 公共 (Common)
```
公共组件和布局
├─ 布局：1 个 (default.vue)
├─ 组件：6 个
└─ 文件数：7
```

| 项目 | 数量 | 文件 |
|------|------|------|
| 布局 | 1 | default.vue |
| 组件 | 6 | Navigation, Header, Footer, Loading, ErrorAlert, EmptyState |
| **小计** | **7** | - |

---

### Module 5: 服务层 (Services)
```
API 和业务逻辑
├─ 业务服务：2 个 (aiService, diaryService)
├─ 通用 API：1 个 (apiClient)
└─ 错误处理：1 个
```

| 项目 | 数量 | 文件 |
|------|------|------|
| 业务服务 | 2 | aiService.ts, diaryService.ts |
| API 客户端 | 1 | apiClient.ts |
| 错误处理 | 1 | errorHandler.ts |
| **小计** | **4** | - |

---

### Module 6: 类型 (Types)
```
TypeScript 类型定义
├─ 主文件：1 个 (index.ts)
└─ 分类：5 个 (common, chat, diary, emotion, character)
```

| 项目 | 数量 | 文件 |
|------|------|------|
| 类型导出 | 1 | index.ts |
| 通用类型 | 1 | common.ts |
| 聊天类型 | 1 | chat.ts |
| 日记类型 | 1 | diary.ts |
| 情绪类型 | 1 | emotion.ts |
| 角色类型 | 1 | character.ts |
| **小计** | **6** | - |

---

### Module 7: 常量 (Constants)
```
常量值定义
├─ 角色常量：1 个
├─ 情绪常量：1 个
└─ API 常量：1 个
```

| 项目 | 数量 | 文件 |
|------|------|------|
| 角色 | 1 | characters.ts |
| 情绪 | 1 | emotions.ts |
| API | 1 | api.ts |
| **小计** | **3** | - |

---

### Module 8: 工具 (Utils)
```
工具函数
├─ 格式化：1 个
├─ 验证：1 个
└─ 日期：1 个
```

| 项目 | 数量 | 文件 |
|------|------|------|
| 格式化 | 1 | format.ts |
| 验证 | 1 | validation.ts |
| 日期 | 1 | datetime.ts |
| **小计** | **3** | - |

---

## 📊 全部模块统计表

| 模块 | 页面 | 组件 | Composables | Stores | Services | 类型 | 常量 | 工具 | 总计 |
|------|------|------|-----------|--------|----------|------|------|------|------|
| 首页 | 1 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | **4** |
| 聊天 | 1 | 6 | 3 | 1 | 1 | 0 | 0 | 0 | **12** |
| 日记 | 2 | 11 | 2 | 1 | 1 | 0 | 0 | 0 | **17** |
| 公共 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | **6** |
| 服务 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | **4** |
| 类型 | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | **6** |
| 常量 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | **3** |
| 工具 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | **3** |
| **总计** | **4** | **26** | **5** | **2** | **6** | **6** | **3** | **3** | **56** |

---

## 🗂️ 目录树（文件数分解）

```
src/
├── pages/ (4)
│   ├── index.vue                           (1)
│   ├── chat/[characterId].vue              (1)
│   └── diary/
│       ├── index.vue                       (1)
│       └── [date].vue                      (1)
│
├── components/ (33)
│   ├── home/ (3)
│   │   ├── CharacterCard.vue
│   │   ├── CharacterGrid.vue
│   │   └── CharacterSection.vue
│   ├── chat/ (7)
│   │   ├── ChatWindow.vue
│   │   ├── ChatHeader.vue
│   │   ├── ChatMessageList.vue
│   │   ├── ChatMessage.vue
│   │   ├── ChatInput.vue
│   │   └── EmotionIndicator.vue
│   ├── diary/ (12)
│   │   ├── DiaryList.vue
│   │   ├── DiaryCard.vue
│   │   ├── DiaryDetail.vue
│   │   ├── DiaryHeader.vue
│   │   ├── DiaryContent.vue
│   │   ├── MoodSummary.vue
│   │   ├── TrendAnalysis.vue
│   │   ├── Insights.vue
│   │   ├── Practice.vue
│   │   ├── Message.vue
│   │   └── EmotionRadar.vue
│   └── common/ (7)
│       ├── Navigation.vue
│       ├── Header.vue
│       ├── Footer.vue
│       ├── Loading.vue
│       ├── ErrorAlert.vue
│       ├── EmptyState.vue
│       └── layouts/default.vue
│
├── stores/ (2)
│   ├── chatStore.ts
│   └── diaryStore.ts
│
├── composables/ (5)
│   ├── useChat.ts
│   ├── useChatStream.ts
│   ├── useEmotion.ts
│   ├── useDiary.ts
│   └── useDiaryList.ts
│
├── services/ (4)
│   ├── aiService.ts
│   ├── diaryService.ts
│   ├── apiClient.ts
│   └── errorHandler.ts
│
├── types/ (6)
│   ├── index.ts
│   ├── common.ts
│   ├── chat.ts
│   ├── diary.ts
│   ├── emotion.ts
│   └── character.ts
│
├── constants/ (3)
│   ├── characters.ts
│   ├── emotions.ts
│   └── api.ts
│
└── utils/ (3)
    ├── format.ts
    ├── validation.ts
    └── datetime.ts

总计：56 个文件
```

---

## 🚀 开发路线图

### Phase 1: 基础设施 (3-5 天)
```
优先级：必须先完成
├─ types/ (6 个文件)
├─ constants/ (3 个文件)
├─ utils/ (3 个文件)
├─ services/apiClient.ts (1)
├─ services/errorHandler.ts (1)
└─ components/common/ (6 个)

目标：搭建基础框架
产出：可用的基础组件和工具
```

### Phase 2: 首页 (1-2 天)
```
依赖：Phase 1 完成
├─ constants/characters.ts (已完成)
├─ components/home/ (3)
├─ pages/index.vue (1)
└─ Navigation 组件 (已完成)

目标：首页正常显示和导航
产出：可选择角色的首页
```

### Phase 3: 聊天 (5-7 天)
```
依赖：Phase 1, 2 完成
├─ types/chat.ts (已完成)
├─ services/aiService.ts (1)
├─ stores/chatStore.ts (1)
├─ composables/useChat.ts (1)
├─ composables/useChatStream.ts (1)
├─ composables/useEmotion.ts (1)
├─ components/chat/ (6)
└─ pages/chat/[characterId].vue (1)

目标：实现聊天功能、流式响应、情绪显示
产出：完整的聊天交互功能
```

### Phase 4: 日记 (5-7 天)
```
依赖：Phase 1, 3 完成
├─ types/diary.ts (已完成)
├─ services/diaryService.ts (1)
├─ stores/diaryStore.ts (1)
├─ composables/useDiary.ts (1)
├─ composables/useDiaryList.ts (1)
├─ components/diary/ (11)
└─ pages/diary/ (2)

目标：实现日记列表、详情查看
产出：完整的日记功能
```

**总预估**：15-20 天

---

## ✨ 确认清单

- [ ] 同意模块拆分（8 个大模块）
- [ ] 同意组件数量（26 个）
- [ ] 同意总文件数（56 个）
- [ ] 同意开发顺序（Phase 1-4）
- [ ] 同意 15-20 天的预估

---

## ❓ 需要调整吗？

### 可能的调整方案

**1. 减少组件数量**
   - 合并小组件：e.g. MoodSummary + TrendAnalysis 合并
   - 影响：减少 2-3 个组件，减少复杂度

**2. 增加模块**
   - 拆分更细：e.g. 单独的 "设置" 模块
   - 影响：增加文件，但组织更清晰

**3. 调整开发顺序**
   - 优先完成某个模块
   - 影响：改变优先级，可能影响进度

**4. 修改数据流**
   - 改变 State 管理方式
   - 影响：架构复杂度

---

## 📞 后续步骤

1. **确认模块拆分** ✅
   - 是否满意当前方案？
   - 需要调整哪些地方？

2. **开始代码生成**
   - 生成所有文件？
   - 还是优先生成 Phase 1？

3. **版本控制**
   - 创建分支：`feature/module-split`？
   - 逐阶段提交？

---

**准备好开始了吗？** 🎉

