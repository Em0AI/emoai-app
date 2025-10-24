# 📦 前端模块拆分 - 最终版

**日期**：2025年10月18日  
**总文件数**：56 个

---

## 8 大模块

### 1️⃣ 首页模块 (Home) - 4 个文件
```
pages/
└── index.vue                           ← 首页 (/)

components/home/
├── CharacterCard.vue                   ← 单个角色卡片
├── CharacterGrid.vue                   ← 角色网格
└── CharacterSection.vue                ← 角色选择区

constants/
└── characters.ts                       ← 使用此常量
```

---

### 2️⃣ 聊天模块 (Chat) - 12 个文件
```
pages/chat/
└── [characterId].vue                   ← 聊天页 (/chat/:id)

components/chat/
├── ChatWindow.vue                      ← 聊天容器
├── ChatHeader.vue                      ← 聊天头部
├── ChatMessageList.vue                 ← 消息列表
├── ChatMessage.vue                     ← 单条消息
├── ChatInput.vue                       ← 输入框
└── EmotionIndicator.vue                ← 情绪显示

composables/
├── useChat.ts                          ← 聊天逻辑
├── useChatStream.ts                    ← 流式响应
└── useEmotion.ts                       ← 情绪处理

stores/
└── chatStore.ts                        ← 状态管理

services/
└── aiService.ts                        ← AI 调用
```

---

### 3️⃣ 日记模块 (Diary) - 17 个文件
```
pages/diary/
├── index.vue                           ← 日记列表 (/diary)
└── [date].vue                          ← 日记详情 (/diary/:date)

components/diary/
├── DiaryList.vue                       ← 列表容器
├── DiaryCard.vue                       ← 列表项
├── DiaryDetail.vue                     ← 详情容器
├── DiaryHeader.vue                     ← 详情头部
├── DiaryContent.vue                    ← 内容容器
├── MoodSummary.vue                     ← 心情总结
├── TrendAnalysis.vue                   ← 趋势分析
├── Insights.vue                        ← 小小觉察
├── Practice.vue                        ← 温柔小练习
├── Message.vue                         ← 今日寄语
└── EmotionRadar.vue                    ← 情绪雷达图

composables/
├── useDiary.ts                         ← 日记逻辑
└── useDiaryList.ts                     ← 列表分页

stores/
└── diaryStore.ts                       ← 状态管理

services/
└── diaryService.ts                     ← 日记调用
```

---

### 4️⃣ 公共模块 (Common) - 7 个文件
```
components/common/
├── Navigation.vue                      ← 导航栏
├── Header.vue                          ← 页面头部
├── Footer.vue                          ← 页脚
├── Loading.vue                         ← 加载动画
├── ErrorAlert.vue                      ← 错误提示
└── EmptyState.vue                      ← 空状态

layouts/
└── default.vue                         ← 默认布局
```

---

### 5️⃣ 服务模块 (Services) - 4 个文件
```
services/
├── apiClient.ts                        ← 通用 HTTP 客户端
├── errorHandler.ts                     ← 错误处理
├── aiService.ts                        ← (已在聊天模块)
└── diaryService.ts                     ← (已在日记模块)
```

---

### 6️⃣ 类型模块 (Types) - 6 个文件
```
types/
├── index.ts                            ← 统一导出
├── common.ts                           ← 通用类型
├── chat.ts                             ← 聊天类型
├── diary.ts                            ← 日记类型
├── emotion.ts                          ← 情绪类型
└── character.ts                        ← 角色类型
```

---

### 7️⃣ 常量模块 (Constants) - 3 个文件
```
constants/
├── characters.ts                       ← 角色常量
├── emotions.ts                         ← 情绪常量
└── api.ts                              ← API 端点
```

---

### 8️⃣ 工具模块 (Utils) - 3 个文件
```
utils/
├── format.ts                           ← 格式化
├── validation.ts                       ← 验证
└── datetime.ts                         ← 日期
```

---

## 📊 统计总览

| 模块 | 页面 | 组件 | Composables | Stores | Services | 文件数 |
|------|------|------|-----------|--------|----------|--------|
| 首页 | 1 | 3 | - | - | - | 4 |
| 聊天 | 1 | 6 | 3 | 1 | 1 | 12 |
| 日记 | 2 | 11 | 2 | 1 | 1 | 17 |
| 公共 | - | 6 | - | - | - | 7 |
| 服务 | - | - | - | - | 2 | 2 |
| 类型 | - | - | - | - | - | 6 |
| 常量 | - | - | - | - | - | 3 |
| 工具 | - | - | - | - | - | 3 |
| **总计** | **4** | **26** | **5** | **2** | **4** | **56** |

---

## ✅ 确认清单

- [x] 8 个大模块
- [x] 56 个文件
- [x] 清晰的目录结构
- [x] 简洁文档

**准备好开始代码生成了吗？**

