# 开发工作流程指南

本文档指导开发人员如何在 EmoAI 项目中工作，从功能分析到代码提交的完整流程。

---

## 工作流程概览

```
功能需求分析
    ↓
    ├─ 理解 PRD 文档
    ├─ 查看模块设计
    ├─ 确认数据模型
    └─ 检查接口规范
    ↓
环境准备
    ├─ 拉最新代码
    ├─ 创建特性分支
    └─ 安装/更新依赖
    ↓
开发实现
    ├─ 编写组件/服务
    ├─ 遵循代码规范
    ├─ 编写必要注释
    └─ 本地测试
    ↓
代码检查
    ├─ ESLint 检查
    ├─ Prettier 格式化
    ├─ TypeScript 检查
    └─ 功能测试
    ↓
提交代码
    ├─ commit message 规范
    ├─ Push 到远程分支
    └─ 创建 Pull Request
```

---

## 1. 功能分析阶段

### 1.1 理解需求

**步骤**：
1. 阅读 [PRD 文档](../PRD.md)
2. 查看相关的[模块设计](./module-design.md)文档
3. 理解用户故事和交互流程
4. 明确功能范围和约束

**示例**：实现聊天消息发送功能

```
PRD 要求：
- 用户输入文本后点击发送
- 显示用户消息气泡（右侧）
- 调用 AI 获取回复
- 实时显示 AI 回复文本
- 完成后保存消息记录
```

### 1.2 检查数据模型

查看 [数据模型](./data-models.md) 了解：
- `ChatMessage` 接口结构
- `EmotionAnalysis` 数据格式
- `ChatStore` 状态定义

### 1.3 确认 API 接口

如果涉及后端，查看对应的 API 规范：
- 请求格式
- 响应格式
- 错误处理

---

## 2. 环境准备

### 2.1 获取最新代码

```bash
# 切换到 main/master 分支
git checkout main

# 获取最新更新
git pull origin main

# 查看最新提交
git log --oneline -10
```

### 2.2 创建特性分支

```bash
# 创建新分支（分支名要有意义）
git checkout -b feature/chat-message-sending

# 分支命名规范
feature/xxx    # 新功能
bugfix/xxx     # 修复 bug
refactor/xxx   # 重构
docs/xxx       # 文档
```

### 2.3 更新依赖

```bash
# 检查依赖是否需要更新
npm outdated

# 安装新的依赖（如果 package.json 有变化）
npm install

# 清除缓存（如遇到问题）
npm cache clean --force
```

---

## 3. 开发实现

### 3.1 代码组织

按照架构设计组织代码：

```
要实现"聊天消息发送"功能，涉及：
├─ components/chat/InputArea.vue      # UI 组件
├─ composables/useChat.ts             # 业务逻辑
├─ stores/chat.ts                     # 状态管理
├─ services/aiService.ts              # API 调用
└─ types/chat.ts                      # 类型定义
```

### 3.2 从类型开始

**最佳实践**：先定义类型，再实现逻辑

```typescript
// src/types/chat.ts - 定义消息类型
interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  emotion?: EmotionAnalysis;
}

// src/composables/useChat.ts - 定义逻辑的返回类型
interface UseChatReturn {
  messages: Ref<ChatMessage[]>;
  sendMessage: (content: string) => Promise<void>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
}

// src/components/chat/InputArea.vue - 使用定义的类型
<script setup lang="ts">
import type { UseChatReturn } from '@/composables/useChat';

interface Props {
  onSendMessage: (message: string) => void;
}
</script>
```

### 3.3 编写代码的几个阶段

#### 第 1 阶段：基础功能实现

```typescript
// 先实现核心逻辑，不考虑优化
async function sendMessage(content: string) {
  // 1. 验证
  if (!content.trim()) return;

  // 2. 创建用户消息
  const userMessage: ChatMessage = {
    id: generateId(),
    role: 'user',
    content,
    timestamp: Date.now()
  };

  // 3. 添加到消息列表
  messages.value.push(userMessage);

  // 4. 调用 AI
  try {
    const aiReply = await getAIReply(content);
    
    // 5. 添加 AI 消息
    const aiMessage: ChatMessage = {
      id: generateId(),
      role: 'ai',
      content: aiReply,
      timestamp: Date.now()
    };
    messages.value.push(aiMessage);

  } catch (error) {
    console.error('Failed to get AI reply:', error);
  }
}
```

#### 第 2 阶段：添加状态管理

```typescript
// 将逻辑集成到 Store
const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);

  async function sendMessage(content: string) {
    isLoading.value = true;
    try {
      // 实现逻辑
    } finally {
      isLoading.value = false;
    }
  }

  return { messages, isLoading, sendMessage };
});
```

#### 第 3 阶段：优化和错误处理

```typescript
// 添加详细的错误处理
async function sendMessage(content: string) {
  // 验证
  const validation = validateMessage(content);
  if (!validation.valid) {
    error.value = validation.message;
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const userMessage = createMessage('user', content);
    messages.value.push(userMessage);

    const aiReply = await withRetry(() => getAIReply(content));
    
    const aiMessage = createMessage('ai', aiReply);
    messages.value.push(aiMessage);

    // 保存到本地存储
    saveChatHistory();

  } catch (err) {
    error.value = extractErrorMessage(err);
    // 撤销用户消息（可选）
    messages.value.pop();
  } finally {
    isLoading.value = false;
  }
}
```

#### 第 4 阶段：添加高级特性

```typescript
// 添加流式显示、情绪分析等
async function sendMessage(content: string) {
  // ... 基础逻辑 ...

  // 情绪分析
  const emotion = await analyzeEmotion(content);

  // 危机检测
  if (detectCrisis(content)) {
    showCrisisAlert();
    return;
  }

  // 流式显示 AI 回复
  let aiContent = '';
  try {
    for await (const chunk of streamAIReply(content)) {
      aiContent += chunk;
      // 实时更新 UI
    }
  } catch (error) {
    // 错误处理
  }
}
```

### 3.4 编写清晰的代码

**注释和文档**：

```typescript
/**
 * 发送聊天消息
 * 
 * @param content - 消息内容（非空）
 * @returns Promise - 消息发送完成时 resolve
 * @throws Error - 如果消息验证失败或 AI 调用失败
 * 
 * @example
 * await sendMessage("I'm feeling anxious today");
 * // 用户消息和 AI 回复都会添加到消息列表
 */
async function sendMessage(content: string): Promise<void> {
  // 实现代码
}
```

**命名约定**：

```typescript
// ✓ 好的名称
const getUserMessageCount = () => messages.value.filter(m => m.role === 'user').length;
const isValidMessage = (content: string) => content.trim().length > 0;

// ✗ 不好的名称
const getCount = () => messages.value.filter(m => m.role === 'user').length;
const check = (content: string) => content.trim().length > 0;
```

---

## 4. 代码检查

### 4.1 本地测试

```bash
# 启动开发服务器
npm run dev

# 在浏览器中手动测试功能
# - 输入消息
# - 检查显示
# - 验证状态更新
```

### 4.2 ESLint 检查

```bash
# 检查所有文件
npm run lint

# 只检查特定文件
npx eslint src/components/chat/InputArea.vue

# 查看详细的错误信息
npm run lint -- --format=detailed
```

### 4.3 代码格式化

```bash
# 格式化所有文件
npm run format

# 只格式化特定文件
npx prettier --write src/components/chat/InputArea.vue
```

### 4.4 TypeScript 检查

```bash
# 类型检查
npm run type-check

# 在 VS Code 中：
# - 打开 Problems 面板（Ctrl+Shift+M）
# - 查看所有类型错误
```

### 4.5 完整的检查流程

```bash
# 按顺序运行所有检查
npm run type-check
npm run lint
npm run format
npm run dev  # 最后启动并手动测试
```

---

## 5. 提交代码

### 5.1 准备提交

```bash
# 查看改动
git status
git diff

# 暂存改动
git add .

# 或只暂存特定文件
git add src/components/chat/InputArea.vue src/types/chat.ts
```

### 5.2 编写提交信息

**格式**：`<type>(<scope>): <subject>`

```bash
# 示例
git commit -m "feat(chat): 实现消息发送功能

- 添加 SendMessage composable
- 创建 InputArea 组件
- 集成 AI 服务调用
- 添加情绪分析和危机检测"
```

**类型（type）**：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码风格（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/依赖

**范围（scope）**：
- `chat`: 聊天相关
- `diary`: 日记相关
- `home`: 首页相关
- `core`: 核心/基础

### 5.3 推送代码

```bash
# 首次推送新分支
git push -u origin feature/chat-message-sending

# 后续推送
git push

# 强制推送（仅在必要时，要谨慎）
git push --force-with-lease
```

### 5.4 创建 Pull Request

在 GitHub 上：

1. 点击 "Compare & pull request"
2. 填写 PR 信息：
   - **标题**：简要描述改动
   - **描述**：详细说明
     - 改动了什么
     - 为什么改动
     - 如何测试
     - 是否有破坏性改动

3. 添加标签（如 `feature`, `bug`, `urgent`）
4. 请求代码审查
5. 等待 CI 检查通过

**PR 模板示例**：
```markdown
## 描述
实现聊天消息发送功能，用户可以输入文本并与 AI 进行对话。

## 改动类型
- [x] 新功能
- [ ] 修复 bug
- [ ] 文档更新

## 关键改动
- 添加 `sendMessage` composable
- 创建 `InputArea` 组件
- 集成 ai-sdk 进行 AI 调用

## 测试清单
- [x] 本地测试通过
- [x] ESLint 检查通过
- [x] TypeScript 检查通过

## 截图或演示
<!-- 添加相关的截图或 GIF -->

## 相关 Issue
Closes #123
```

---

## 6. 代码审查

### 6.1 接收反馈

代码审查阶段可能收到建议：

```
# 审查意见示例
1. "这个函数有点长，考虑拆分"
   → 响应：会进行重构

2. "这里的错误处理不完整"
   → 响应：添加更多错误检查

3. "可以使用 X 组件库的现有组件"
   → 响应：使用建议的组件替换
```

### 6.2 进行修改

```bash
# 根据反馈进行修改
# ... 编辑文件 ...

# 查看更改
git diff

# 提交更改（commit message 可以简化）
git commit -am "refactor: 按审查建议进行改进"

# 推送更新
git push
```

### 6.3 获得批准

当所有审查意见解决后，PR 会被批准。

### 6.4 合并代码

```bash
# 在 GitHub 上点击 "Squash and merge" 或 "Merge"
# 代码会合并到 main 分支

# 本地更新
git checkout main
git pull origin main

# 删除本地特性分支（可选）
git branch -d feature/chat-message-sending
```

---

## 7. 开发小贴士

### 7.1 保持同步

```bash
# 定期同步主分支的更新
git fetch origin
git rebase origin/main

# 如果遇到冲突
git rebase --abort  # 取消 rebase
# 或
git rebase --continue  # 解决冲突后继续
```

### 7.2 提高效率

```bash
# 使用别名简化命令
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status

# 现在可以使用
git co feature/xxx  # 代替 git checkout
```

### 7.3 紧急修复

```bash
# 如果需要临时保存工作
git stash

# 处理其他任务

# 恢复工作
git stash pop
```

---

## 8. 常见开发场景

### 场景 1：实现新的聊天功能

```
1. 阅读 PRD 中的聊天功能部分
2. 查看 module-design.md 的聊天模块说明
3. 理解 ChatMessage 和 ChatStore 的定义
4. 在 src/components/chat/ 创建新组件
5. 在 src/composables/useChat.ts 添加新逻辑
6. 在 src/stores/chat.ts 更新状态
7. 在组件中集成使用
8. 按上述流程检查和提交
```

### 场景 2：修复 bug

```
1. 从 Issue 了解 bug 详情
2. 创建 bugfix 分支
3. 复现 bug（本地测试）
4. 定位问题代码
5. 实现修复
6. 验证修复（再次测试）
7. 提交代码
```

### 场景 3：性能优化

```
1. 使用开发者工具识别性能问题
2. 分析根本原因
3. 实现优化方案
4. 使用性能工具验证改进
5. 确保功能不被破坏
6. 提交代码（commit type: perf）
```

---

## 9. 下一步阅读

- 📄 [开发指南](./development-guide.md) - 代码规范详情
- 📄 [系统架构](./system-architecture.md) - 整体设计
- 📄 [模块设计](./module-design.md) - 功能模块说明
- 📄 [常见问题](./faq.md) - 开发中的常见问题

---

**祝您开发顺利！** 🚀
