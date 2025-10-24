# 模块设计文档

本文档详细描述了 EmoAI 系统的各个功能模块、它们的职责、交互方式和实现思路。

---

## 模块概览

```
┌─────────────────────────────────────────┐
│         用户界面模块 (UI Modules)        │
├──────────┬──────────┬──────────┬────────┤
│  首页    │  聊天    │  日记    │  公共  │
│ (Home)   │ (Chat)   │ (Diary)  │(Common)│
└──────────┴──────────┴──────────┴────────┘
           ↓
┌─────────────────────────────────────────┐
│      业务逻辑模块 (Business Logic)        │
├──────────┬──────────┬────────────────────┤
│ 聊天逻辑 │ 日记逻辑 │ 情绪分析逻辑      │
└──────────┴──────────┴────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│      服务模块 (Services)                 │
├──────────┬──────────┬────────────────────┤
│ AI服务   │ 情绪服务 │ 日记生成服务      │
└──────────┴──────────┴────────────────────┘
```

---

## 1. 首页模块 (Home Module)

### 1.1 模块职责
- 展示三个 AI 角色：理性分析师、温柔导师、积极陪伴者
- 提供角色选择交互
- 跳转到对应角色的聊天页面

### 1.2 核心组件

#### CharacterCard.vue
**目标**：单个角色卡片组件

```typescript
interface Props {
  character: Character;
  isHovered?: boolean;
}

interface Emits {
  click: [character: Character];
}
```

**功能**：
- 展示角色头像、名称、描述
- 鼠标悬停效果（放大、阴影）
- 点击事件处理

#### CharacterGrid.vue
**目标**：角色网格组件

**功能**：
- 布局三个角色卡片
- 管理悬停状态
- 处理卡片点击事件

#### 页面：pages/index.vue
**功能**：
- 首页主页面
- 导航栏显示
- 标题和描述文案
- 角色网格
- 跳转聊天页面

### 1.3 交互流程

```
用户访问首页
  ↓
读取前端角色列表（常量）
  ↓
展示三个角色卡片
  ↓
用户鼠标悬停
  ↓
卡片放大显示
  ↓
用户点击卡片
  ↓
保存选择的角色到 ChatStore
  ↓
跳转到 /chat/[characterId]
```

### 1.4 数据来源

**角色配置** (src/constants/characters.ts)：
```typescript
import type { Character } from '@/types';

export const CHARACTERS: Record<string, Character> = {
  'rational-analyst': {
    id: 'rational-analyst',
    name: 'Rational Analyst',
    avatar: '/images/rational-analyst.png',
    description: 'Helps you think through challenges with logic and clarity'
  },
  'compassionate-mentor': {
    id: 'compassionate-mentor',
    name: 'Compassionate Mentor',
    avatar: '/images/compassionate-mentor.png',
    description: 'Provides warm, supportive guidance with understanding'
  },
  'encouraging-companion': {
    id: 'encouraging-companion',
    name: 'Encouraging Companion',
    avatar: '/images/encouraging-companion.png',
    description: 'Brings positive energy and motivation to your day'
  }
};

// 便捷函数
export function getCharacterById(id: string): Character | undefined {
  return CHARACTERS[id];
}

export function getAllCharacters(): Character[] {
  return Object.values(CHARACTERS);
}
```

---

## 2. 聊天模块 (Chat Module)

### 2.1 模块职责
- 实现用户与 AI 的实时聊天交互
- 管理聊天消息历史
- 处理语音输入
- 进行情绪分析和安全检测
- 显示危机干预提示

### 2.2 核心组件

#### ChatWindow.vue
**目标**：聊天窗口主容器

**功能**：
- 显示聊天消息列表
- 自动滚动到最新消息
- 加载动画显示
- 消息分页加载（可选）

#### ChatMessage.vue
**目标**：单条聊天消息

```typescript
interface Props {
  message: ChatMessage;
  characterName?: string;
}
```

**功能**：
- 区分用户消息（右侧）和 AI 消息（左侧）
- 显示消息内容和时间
- 支持 Markdown 渲染（AI 回复）
- 流式文本动画效果

#### InputArea.vue
**目标**：输入区域

**功能**：
- 文本输入框
- 语音输入按钮
- 发送按钮
- 输入验证和禁用状态
- 提示语显示

#### VoiceRecorder.vue
**目标**：语音录制组件

**功能**：
- 调用浏览器 MediaRecorder API
- 显示录制动画
- 录制完后语音转文本
- 发送语音识别结果

#### CharacterAvatar.vue
**目标**：左侧角色显示

**功能**：
- 显示角色头像
- 显示角色名称
- 显示"切换角色"按钮
- 处理角色切换逻辑

#### CrisisAlert.vue
**目标**：危机干预提示弹窗

**功能**：
- 显示危机干预文案
- 15 秒倒计时
- 取消按钮
- 自动触发应急电话（可选）

### 2.3 页面：pages/chat/[role].vue

**功能**：
- 聊天页面主体
- 整合所有聊天组件
- 管理聊天状态
- 处理路由参数（角色 ID）
- 初始化欢迎消息

### 2.4 状态管理 (ChatStore)

```typescript
interface ChatState {
  // 当前聊天数据
  messages: ChatMessage[];             // 当前会话的消息列表
  currentCharacterId: CharacterId;    // 当前选择的角色 ID
  
  // UI 状态
  isLoading: boolean;                  // AI 生成中
  isRecording: boolean;                // 语音录制中
  error?: string;                      // 错误信息
  
  // 安全状态
  crisisAlertShown: boolean;          // 危机提示是否显示过
}

interface ChatGetters {
  userMessages: ChatMessage[];        // 所有用户消息
  aiMessages: ChatMessage[];          // 所有 AI 消息
  lastMessage?: ChatMessage;          // 最后一条消息
  messageCount: number;               // 消息总数
  shouldAutoScroll: boolean;          // 是否应该自动滚动
}

interface ChatActions {
  addMessage(msg: ChatMessage): void;
  clearMessages(): void;              // 会话结束时清空
  setCurrentCharacter(id: CharacterId): void;
  setLoading(loading: boolean): void;
  setRecording(recording: boolean): void;
}
```

**存储策略**：
- 聊天记录仅在内存中存储（Pinia store）
- 页面刷新后自动清空
- 不需要 localStorage 或数据库持久化

### 2.5 业务逻辑 (useChat)

**主要函数**：
```typescript
// 发送消息
async function sendMessage(content: string): Promise<void>

// 接收 AI 回复（流式）
async function receiveAIReply(characterId: string, messages: ChatMessage[]): Promise<string>

// 情绪分析
async function analyzeMessage(content: string): Promise<EmotionAnalysis>

// 危机检测
function detectCrisis(text: string): boolean

// 加载聊天历史
function loadChatHistory(date: string): void

// 保存聊天到本地
function saveChatToLocal(): void
```

### 2.6 交互流程

#### 基本聊天流程
```
用户输入文本
  ↓
验证内容（非空、长度限制）
  ↓
显示用户消息气泡
  ↓
调用 AI 服务获取回复（流式）
  ↓
实时显示 AI 回复文本
  ↓
分析用户消息情绪
  ↓
检测是否包含危机信号
  ├─ 是 → 显示危机干预弹窗
  └─ 否 → 继续
  ↓
保存消息到 ChatStore
  ↓
更新本地存储
  ↓
更新全局情绪数据
```

#### 危机干预流程
```
检测到极端负面表述
  ↓
立即显示危机提示弹窗
  ↓
开始 15 秒倒计时
  ↓
用户有两个选择：
  ├─ 点击 Cancel → 关闭弹窗，继续聊天
  └─ 倒计时结束 → 打开应急电话拨号
  ↓
（可选）拨打当地应急电话
```

---

## 3. 日记模块 (Diary Module)

### 3.1 模块职责
- 生成基于聊天的情绪日记
- 展示日记列表和详情
- 可视化情绪数据（雷达图）
- 提供日期切换

### 3.2 核心组件

#### DiaryList.vue
**目标**：左侧日记列表

**功能**：
- 按日期降序展示历史日记
- 点击切换查看不同日期
- 显示日记标题和日期
- 高亮当前选中日记

#### DiaryContent.vue
**目标**：中间日记内容区

**功能**：
- 显示 6 个核心模块：
  1. 今日心情关键词（3 个）
  2. 情绪变化趋势
  3. 今日心情小结
  4. 小小觉察
  5. 温柔小练习
  6. 今日寄语

#### MoodRadar.vue
**目标**：右侧情绪雷达图

**功能**：
- 绘制 6 维度雷达图
- 显示情绪占比
- 鼠标悬停显示数值
- 对应颜色和图例

#### MoodStats.vue
**目标**：情绪统计组件

**功能**：
- 显示每个情绪维度的比例
- 颜色方块示意
- 百分比显示

### 3.3 页面：pages/diary.vue

**功能**：
- 日记页面主体
- 三列布局（列表、内容、图表）
- 日期切换逻辑
- 加载和缓存管理

### 3.4 状态管理 (DiaryStore)

```typescript
interface DiaryRecord {
  id: string;
  date: string;                    // YYYY-MM-DD
  characterId: string;             // 对话角色
  moodKeywords: [string, string, string];  // 3个关键词
  emotionScores: EmotionScores;   // 6维度评分
  moodSummary: string;            // 心情小结
  trendAnalysis: string;          // 情绪变化趋势
  insights: string;               // 小小觉察
  practice: string;               // 温柔小练习
  message: string;                // 今日寄语
  createdAt: number;
}

interface DiaryState {
  diaries: Map<string, DiaryRecord>;    // 按日期存储
  currentDate: string;                  // 当前查看的日期
  isLoading: boolean;                   // 加载中
  error?: string;
}

interface DiaryGetters {
  currentDiary?: DiaryRecord;
  diaryDates: string[];              // 所有日记日期
  sortedDiaries: DiaryRecord[];     // 按时间排序
}

interface DiaryActions {
  setDiaries(diaries: DiaryRecord[]): void;
  setCurrentDate(date: string): void;
  setLoading(loading: boolean): void;
}
```

**数据来源**：
- 日记数据由后端生成和存储
- 前端从后端 API 加载
- 前端仅用于显示，不修改或生成
```

### 3.5 业务逻辑 (useDiary)

**主要函数**：
```typescript
// 加载日记列表
async function loadDiaries(): Promise<void>

// 获取特定日期的日记
async function getDiary(date: string): Promise<DiaryRecord>
```

**数据流向**：
- 前端请求后端 API → 获取日记列表
- 后端返回日记数据 → 存储到 DiaryStore
- 前端显示日记内容

### 3.6 关键词提取规则（后端实现）

**说明**：关键词提取由后端实现，前端仅用于显示

后端在生成日记时已进行关键词提取，前端直接使用 `moodKeywords` 字段。

### 3.7 交互流程

```
用户进入日记页面
  ↓
加载所有日记列表
  ↓
默认显示最新日期的日记
  ↓
用户点击列表中日期
  ↓
加载该日期的日记内容
  ↓
显示：
  ├─ 中间区域：6 个内容模块
  ├─ 右侧：雷达图
  └─ 左侧：日期列表高亮
  ↓
用户查看完成
```

---

## 4. 公共组件模块 (Common Components)

### 4.1 Navigation.vue
**职责**：顶部导航栏

**功能**：
- 显示应用名称 "Emo AI will always be with you"
- 两个菜单项："Talk With Us" 和 "Emotional Diary"
- 导航到对应页面
- 当前页面高亮

### 4.2 Modal.vue
**职责**：通用弹窗框架

**功能**：
- 自定义弹窗容器
- 显示/隐藏动画
- 关闭按钮
- 背景遮罩点击关闭

### 4.3 CrisisAlert.vue
**职责**：危机干预提示

**功能**：（详见聊天模块）

### 4.4 LoadingSpinner.vue
**职责**：加载动画

**功能**：
- 显示加载中状态
- 自定义大小和颜色

---

## 5. 模块间通信

### 5.1 状态流向

```
首页选择角色
  ↓
保存到 UserStore
  ↓
导航到聊天页面
  ↓
读取 UserStore 的角色信息
  ↓
初始化 ChatStore
  ↓
用户聊天过程中
  ↓
实时更新 ChatStore 和情绪数据
  ↓
切换到日记页面
  ↓
读取 ChatStore 中的消息
  ↓
生成 DiaryStore 中的日记
```

### 5.2 事件通信

```
首页
  │
  ├─ 点击角色卡片
  │   └─ emit: character-selected
  │       └─ 保存到 UserStore
  │       └─ 导航到聊天页面
  │
聊天页面
  │
  ├─ 发送消息
  │   └─ emit: message-sent
  │       └─ 调用 AI 服务
  │       └─ 更新 ChatStore
  │
  ├─ 检测到危机信号
  │   └─ emit: crisis-detected
  │       └─ 显示 CrisisAlert
  │
日记页面
  │
  └─ 点击日期
      └─ 加载对应日记
```

---

## 6. 模块开发顺序

建议按以下顺序开发各模块：

| 顺序 | 模块 | 依赖 | 时间 |
|------|------|------|------|
| 1 | 首页 + 公共组件 | 无 | 2 天 |
| 2 | 聊天模块（UI） | 首页 | 3 天 |
| 3 | AI 服务 + 聊天逻辑 | 聊天 UI | 4 天 |
| 4 | 日记模块 | 聊天模块 | 3 天 |
| 5 | 集成测试和优化 | 全部 | 2 天 |

---

## 7. 下一步阅读

- 📄 [数据模型](./data-models.md) - 详细的类型定义
- 📄 [开发指南](./development-guide.md) - 编码规范和开发建议
- 📄 各模块详细文档 (modules 目录)
