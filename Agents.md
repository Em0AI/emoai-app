# AGENTS.md

EmoAI 是一个 AI 驱动的心理健康伴侣应用。本文件为 AI Agents 提供项目指导和规范。

## Dev environment tips

### 初始化项目
```bash
# 进入前端目录
cd frontend

# 安装依赖（使用 bun）
bun install

# 启动开发服务器
bun run dev
```

### 项目结构快速导航
- `src/composables/` - Vue composables (e.g., useChatStream)
- `src/components/` - Vue components (PascalCase)
- `src/stores/` - Pinia stores
- `src/types/` - TypeScript type definitions
- `src/services/` - API services and utilities
- `src/pages/` - Nuxt pages (auto-routed)
- `docs/` - Project documentation
- **关键**: `docs/API-REFERENCE.md` - Backend API 规范
- **关键**: 本文件 `Agents.md` - Agent 行为规范

### 必读文件
1. **docs/API-REFERENCE.md** - 了解后端 API 合约（2 个端点，流式响应）
2. **docs/develop/data-models.md** - 了解核心数据类型 (ChatMessage, DiaryRecord, EmotionScores)
3. **src/types/** - 所有 TypeScript 类型定义
4. **src/services/** - 所有 API 和数据访问层

### 常用命令
- `bun run dev` - 启动开发服务器（Vite + Nuxt hot reload）
- `npx eslint "src/**/*.{ts,vue}" --fix` - 自动修复代码风格
- `npx tsc --noEmit` - 检查 TypeScript 错误（strict mode）
- `bun run build` - 生产构建
- `bun run preview` - 预览生产构建

### 关键约束
- **TypeScript strict mode** - tsconfig.json 中 `strict: true`，禁止使用 `any`
- **无分号风格** - ESLint 强制，所有代码无分号结尾
- **@types/node** - 已安装，NODE 全局可用
- **路径别名** - `~/` 和 `@/` 都映射到 `src/`（见 tsconfig.json）

### 依赖版本（核心）
- Nuxt 3.x, Vue 3.5.x, TypeScript 5.x
- Pinia 2.x, Vite 5.x, ESLint 8.x
- Tailwind 3.x, @nuxt/ui 2.x
- bun (package manager)

### NVIDIA API 配置（通过 Nuxt 服务器 API）

**重要**: 本项目使用 Nuxt 服务器端点调用 NVIDIA API，避免了浏览器 CORS 问题。

**配置步骤**:

1. 获取 NVIDIA API 密钥：
   - 访问 https://build.nvidia.com/
   - 注册/登录账户
   - 获取 API 密钥

2. 在 `.env` 文件中配置 API 密钥：
   ```bash
   # .env (前端根目录)
   NVIDIA_API_KEY=your_nvidia_api_key_here
   ```
   Nuxt 服务器会自动从 `.env` 加载该环境变量。

**工作流程**:
1. 用户在前端聊天页面发送消息
2. 前端调用 `/api/chat` POST 端点（Nuxt 服务器）
3. 服务器使用 `@ai-sdk/openai-compatible` 调用 NVIDIA API
4. NVIDIA API Key 从服务器环境变量读取（不暴露给客户端）
5. 流式响应返回给客户端
6. 前端实时显示消息流

**API 端点**:
- 路由: `src/server/api/chat.post.ts`
- 方法: POST `/api/chat`
- 请求体: `{ messages: Array<{ role: string; content: string }> }`
- 响应: Server-Sent Events (SSE) 流或文本流

**相关文件**:
- `.env` - 环境变量配置（NVIDIA_API_KEY）
- `src/server/api/chat.post.ts` - 后端 API 端点，使用 @ai-sdk/openai-compatible
- `src/services/chatService.ts` - 前端服务，调用 `/api/chat`
- `src/pages/chat/[characterId].vue` - 聊天页面，使用 `streamChatMessage()`
- `nuxt.config.ts` - Nuxt 配置

**安全性优势**:
- ✅ API Key 不暴露给客户端（存储在服务器环境变量）
- ✅ 避免 CORS 问题（所有 API 调用来自服务器）
- ✅ 可以添加速率限制、日志记录等服务器端功能
- ✅ 支持生产环境部署

**故障排除**:
- 如果看到 "Failed to fetch from /api/chat"，检查：
  1. 开发服务器是否运行：`bun run dev`
  2. `.env` 文件是否包含有效的 `NVIDIA_API_KEY`
  3. 应用是否已重启（加载新的 .env）
  4. 浏览器开发者工具 Network 标签查看 API 响应

---

## Testing instructions

### 类型检查
```bash
# 运行 TypeScript 严格模式检查
npx tsc --noEmit

# 或启动 dev server（会自动检查）
bun run dev
```

**目标**: 零类型错误。如果有错误，用具体类型或 union types，不要用 `any`。

### 代码风格检查
```bash
# 检查所有文件
npx eslint "src/**/*.{ts,vue}"

# 自动修复风格问题
npx eslint "src/**/*.{ts,vue}" --fix

# 如果还有错误，查看详细列表
npx eslint src/ --format=compact
```

**目标**: 所有 lint 检查通过（exit code 0）。常见修复：移除分号、排序 import、删除未使用变量。

### Dev server 验证
```bash
# 启动开发服务器
bun run dev

# 访问 http://localhost:3000
# 检查：
# 1. 页面加载无错误
# 2. 聊天流可正常发送
# 3. 情感分析数据正确解析
# 4. 没有 console 错误
```

**目标**: Dev server 启动成功（exit code 0），浏览器无错误。

### 做出重要改动时
- 检查涉及的组件或 composable 是否有现有的测试（如果有 `*.spec.ts`）
- 如果改了类型定义，用 `grep -r "OldType" src/` 找所有引用，确认都更新了
- 如果改了 API 调用方式，验证所有调用处都适配了
- 危机检测逻辑（emotion.crisisDetected）是不可触及的 - 即使有 TODO 也要保留

### 提交前检查单
- [ ] `npx tsc --noEmit` 通过（zero errors）
- [ ] `npx eslint "src/**/*.{ts,vue}" --fix` 通过且无新改动
- [ ] `bun run dev` 启动成功，浏览器无 console 错误
- [ ] 核心功能手工测试（如有改动）
- [ ] 文档已同步（如有 API 或流程改动）
- [ ] 没有使用 `any` 或其他禁止项

---

## PR instructions

### 提交规范

#### 标题格式
```
<type>(<scope>): <subject>
```

**Type**:
- `feat` - 新功能 (e.g., `feat(chat): add real-time emotion widget`)
- `fix` - Bug 修复 (e.g., `fix(stream): handle multi-line response parsing`)
- `refactor` - 代码重构，逻辑不变 (e.g., `refactor(store): simplify chatStore`)
- `style` - 代码风格调整 (e.g., `style(eslint): remove trailing semicolons`)
- `docs` - 文档更新 (e.g., `docs: update API-REFERENCE`)
- `test` - 测试相关 (e.g., `test: add useChatStream unit tests`)
- `chore` - 工具/配置 (e.g., `chore: upgrade eslint`)

**Scope** (可选): 模块名称如 `chat`, `emotion`, `diary`, `auth`

**Examples**:
```
feat(chat): implement useChatStream with emotion parsing
fix(emotion): handle missing emotion data in stream
docs: clarify API contract for diary endpoint
style: apply eslint --fix to all components
```

#### 分支命名
```
feature/<feature-name>          # 新功能
bugfix/<bug-name>               # Bug 修复
refactor/<component>            # 重构
docs/<doc-topic>                # 文档
```

**Examples**:
```
feature/chat-stream-optimization
bugfix/emotion-parsing-crash
refactor/remove-unused-composables
docs/api-reference-update
```

#### 提交前步骤
1. 确保所有代码改动已完成
2. 运行 `npx tsc --noEmit` - 必须通过
3. 运行 `npx eslint "src/**/*.{ts,vue}" --fix` - 必须通过
4. 测试 dev server：`bun run dev` - 必须启动成功
5. 手工测试涉及的功能模块

#### PR 描述模板
```markdown
## What
简要描述做了什么（1-2 句话）

## Why
为什么要做这个改动（背景/需求）

## How
如何实现的（高层次技术概述）

## Changed files
- `src/components/ChatWindow.vue` - Updated UI
- `src/composables/useChatStream.ts` - New composable
- `docs/API-REFERENCE.md` - Updated API docs

## Testing
如何验证这个改动（手工测试步骤或自动化测试）

## Checklist
- [x] TypeScript 检查通过
- [x] ESLint 检查通过
- [x] Dev server 启动成功
- [x] 手工测试关键功能
- [x] 文档已同步
- [x] 没有使用 `any`
- [x] 危机检测逻辑保留无误
```

#### 合并前要求
- [ ] 代码审查通过
- [ ] 所有自动检查通过（CI/CD 如有配置）
- [ ] 至少 1 个批准
- [ ] 无冲突
- [ ] 提交信息清晰、规范

### PR 的禁止项
1. 直接改 TypeScript 类型不更新引用处
2. 删除代码不经过审查
3. 改 API 端点或数据结构不更新文档
4. 提交包含 `any`, `@ts-ignore`, `@ts-nocheck`
5. 删除或禁用危机检测逻辑
6. 一个 PR 做太多不相关的改动（应该分开）

---

## Architecture & Key Decisions

### 前后端分工
- **前端** 维护：3 个预定义角色、聊天历史、日记列表（全部存储到 Pinia/localStorage）
- **后端** 提供：2 个 API 端点（聊天流 + 日记生成），嵌入情感分析和危机检测

### API 合约（见 docs/API-REFERENCE.md）
- **POST /api/chat/stream** - 流式聊天，返回 ReadableStream，包含 `<<<EMOTION_ANALYSIS>>>` 标记
- **POST /api/diary/generate** - 生成日记，返回 JSON

### 核心数据模型
- **ChatMessage** - { id, role, characterId, content, timestamp }
- **DiaryRecord** - { id, date, characterId, emotionScores, moodKeywords, ..., createdAt }
- **EmotionScores** - { happy, satisfied, calm, anxious, angry, sad } 各 0-10
- **EmotionAnalysis** - { scores, crisisDetected, crisisReason, suggestion }

### 危机检测 (P0 优先级)
- 当 crisisDetected === true，前端显示危机对话框
- 显示 15 秒倒计时和心理援助热线号码
- 逻辑 **不可删除、禁用或改变** - 即使有 TODO 也要保留框架

---

## Code style requirements

### Vue 组件 (PascalCase 文件名)
```vue
<script setup lang="ts">
import type { ChatMessage } from '@/types/chat';

interface Props {
  message: ChatMessage;
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
});
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- 使用 Tailwind CSS 类，不编写 style 标签 -->
  </div>
</template>
```

### Composables (camelCase 文件名，use 前缀)
```typescript
export function useChatStream(characterId: string) {
  const store = useChatStore();
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);

  const sendMessage = async (text: string): Promise<void> => {
    // 实现
  };

  return { messages: readonly(messages), loading, sendMessage };
}
```

### TypeScript 规则
- **必须** 标注函数参数类型和返回类型
- **必须** 标注 ref/reactive 变量的泛型类型
- **禁止** 使用 `any` - 用 `unknown` 或具体类型
- **禁止** 隐式 `any` (tsconfig.json: `noImplicitAny: true`)
- **推荐** 为复杂类型创建 interfaces/types，放在 `src/types/`

### 文件结构
```
src/
  components/          # Vue 组件 (PascalCase.vue)
  composables/        # 组合函数 (useName.ts)
  stores/             # Pinia stores (storeName.ts)
  types/              # TypeScript definitions (Name.ts)
  services/           # API & utility services (serviceName.ts)
  pages/              # Nuxt pages (auto-routed)
  constants/          # Constants (UPPER_SNAKE_CASE.ts)
  assets/             # CSS, images
  layouts/            # Nuxt layouts
```

### 编码约定
- **分号结尾** (ESLint 强制 `semi: always`)
- **单引号** (ESLint 强制 `quotes: single`)
- **2 空格缩进** (ESLint 强制 `indent: 2`)
- **行末逗号** (多行结尾逗号 `comma-dangle: always-multiline`)
- **所有 async 操作用 try-catch 包装**
- **错误消息必须用户可读**

### 注释规则

#### JSDoc 注释
```typescript
/**
 * 发送聊天消息并处理流式响应
 * @param text - 用户输入的文本
 * @param characterId - 角色 ID
 * @returns Promise 当前消息列表
 * @throws Error 当流式读取失败时
 */
export async function sendMessage(text: string, characterId: string): Promise<ChatMessage[]> {
  // 实现
}
```

#### 单行注释
```typescript
// 初始化消息列表
const messages = ref<ChatMessage[]>([]);

// 标记是否正在加载
const loading = ref(false);
```

#### 使用注释规范
- **必须**: 复杂逻辑上方添加注释解释"为什么"而非"做什么"
- **必须**: 公开函数/导出使用 JSDoc
- **必须**: 注释以空格开头 (ESLint: `spaced-comment`)
- **可选**: 临时调试注释使用 `// TODO:` 或 `// FIXME:`
- **禁止**: 直接提交 console.log/debugger（除非在 dev/debug 标记下）

#### 注释示例
```typescript
// ❌ 不好：没有说明逻辑
const result = data.filter(item => item.status === 'active');

// ✅ 好：说明意图
// 只保留状态为 active 的项，用于后续的情感分析
const activeItems = data.filter(item => item.status === 'active');

// ❌ 不好：注释重复代码
i++; // 增加计数器

// ✅ 好：说明为什么
// 跳过已处理的消息，防止重复解析
i++;
```

### ESLint 配置详解

**当前配置** (`eslint.config.mjs`):

```javascript
// Vue 规则
'vue/multi-word-component-names': 'off',           // 允许单词组件名
'vue/max-attributes-per-line': [                   // 单行最多 3 个属性
  'error',
  { singleline: 3, multiline: 1 }
],
'vue/singleline-html-element-content-newline': 'off', // 元素内容可同行
'vue/html-indent': ['error', 2],                   // HTML 缩进 2 格

// JavaScript/TypeScript 规则
'no-console': ['warn', { allow: ['warn', 'error'] }], // 允许警告和错误日志
'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
'prefer-const': 'error',                          // 优先使用 const
'no-var': 'error',                                // 禁止 var

// 注释规则
'no-multi-spaces': 'error',                       // 禁止多个空格
'spaced-comment': ['error', 'always'],            // 注释必须有空格

// 缩进和格式
'indent': ['error', 2],                           // 2 空格缩进
'comma-dangle': ['error', 'always-multiline'],    // 多行末尾逗号
'semi': ['error', 'always'],                      // 强制分号
'quotes': ['error', 'single', { avoidEscape: true }], // 单引号

// 行尾规则
'eol-last': ['error', 'always'],                  // 文件末尾必须换行
'no-trailing-spaces': 'error'                     // 禁止行末空格
```

**如何运行 ESLint**:
```bash
# 检查所有文件
npx eslint "src/**/*.{ts,vue}"

# 自动修复
npx eslint "src/**/*.{ts,vue}" --fix

# 查看详细错误
npx eslint src/ --format=compact
```

---

## Forbidden items

1. **禁止 `any` 类型** - 使用具体类型或 union types
2. **禁止 `@ts-ignore` 或 `@ts-nocheck`** - 解决根本问题，不是跳过检查
3. **禁止删除危机检测逻辑** - 即使有 TODO 或看起来不必要
4. **禁止未经审查删除代码** - "死代码"也要通过 PR 审查确认
5. **禁止改 API 不同步文档** - docs/API-REFERENCE.md 必须与代码一致
6. **禁止改类型定义不更新引用** - 用 `grep -r OldType src/` 找所有引用
7. **禁止在 PR 中混合不相关改动** - 每个 PR 聚焦一个功能或 Bug
8. **禁止跳过类型检查或 lint** - 提交前必须通过 `tsc --noEmit` 和 `eslint`

---

## Common issues & troubleshooting

### Dev server 无法启动
**错误**: `bun run dev` 报错或卡住
**解决**:
1. 检查 Node 版本：`node --version`（需要 18+）
2. 清理并重装：`rm -rf .nuxt node_modules && bun install`
3. 看完整错误信息，搜索关键词如 ENOENT、cannot find module
4. 如果端口占用：`lsof -i :3000` 然后 `kill -9 <PID>`

### ESLint 检查失败
**错误**: `npx eslint src/ ` 返回非零码
**解决**:
1. 运行 `npx eslint "src/**/*.{ts,vue}" --fix` 自动修复
2. 运行 `npx eslint src/ --format=compact` 看还有哪些错误
3. 手工修复：删除未使用变量、调整 import 顺序、修复分号问题
4. 再次检查：`npx eslint "src/**/*.{ts,vue}"` 应该通过

### TypeScript 错误级联
**错误**: 改了一个文件，几十/百个类型错误
**解决**:
1. 找第一个错误（通常是根本原因）
2. 检查是否改了 `src/types/` 中的类型定义
3. 用 `grep -r "OldTypeName" src/` 找所有引用
4. 批量更新或恢复原来的定义

### Stream 解析失败
**错误**: 情感分析数据未正确解析
**解决**:
1. 检查 API 响应格式是否有 `<<<EMOTION_ANALYSIS>>>` 标记
2. 检查 useChatStream.ts 中的标记检测逻辑
3. 测试 `JSON.parse()` 是否能解析情感数据
4. 添加 console.log 调试流内容

### CSS 不工作
**错误**: Tailwind 类未应用
**解决**:
1. 检查 `src/assets/css/main.css` 是否有 `@tailwind` 指令
2. 检查 `nuxt.config.ts` 是否配置了 Tailwind
3. 重启 dev server：`bun run dev`
4. 清理缓存：`rm -rf .nuxt`

---

## Quick reference

### 快速添加组件
```bash
# 1. 创建文件
touch src/components/MyComponent.vue

# 2. 编写代码（见 Code style 部分）
# 3. 运行 lint
npx eslint src/components/MyComponent.vue --fix

# 4. 类型检查
npx tsc --noEmit
```

### 快速添加 Composable
```bash
# 1. 创建文件
touch src/composables/useMyComposable.ts

# 2. 编写代码，导出一个 use* 函数
# 3. 运行检查
npx tsc --noEmit && npx eslint src/composables/useMyComposable.ts --fix
```

### 快速修复风格问题
```bash
# 一键修复所有 ESLint 问题
npx eslint "src/**/*.{ts,vue}" --fix

# 验证通过
npx eslint "src/**/*.{ts,vue}"
```

### 快速验证改动
```bash
# 完整检查
npx tsc --noEmit && npx eslint "src/**/*.{ts,vue}" --fix && bun run dev

# 如果都通过，dev server 会启动，可以手工测试
```

---

## Last updated
2025-10-19 - 初始版本，基于 OpenAI agents.md 格式
