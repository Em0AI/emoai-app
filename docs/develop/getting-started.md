# 快速入门指南

欢迎加入 EmoAI 开发团队！本指南将帮助您快速搭建开发环境并开始贡献代码。

---

## 前提条件

### 系统要求
- **操作系统**：macOS, Linux, Windows (WSL)
- **Node.js**：>= 18.0.0
- **包管理器**：npm >= 9.0.0 (或 yarn / pnpm)
- **代码编辑器**：VS Code (推荐)

### 验证环境

```bash
# 检查 Node.js 版本
node --version  # 应显示 v18+ 或更高

# 检查 npm 版本
npm --version   # 应显示 9.0+ 或更高
```

---

## 1. 项目初始化

### 1.1 克隆项目

```bash
# 克隆仓库
git clone https://github.com/neverbiasu/emoai-app.git

# 进入项目目录
cd emoai-app

# 进入前端目录
cd frontend
```

### 1.2 安装依赖

```bash
# 使用 npm 安装依赖
npm install

# 或者使用 yarn
yarn install

# 或者使用 pnpm
pnpm install
```

首次安装可能需要几分钟，取决于网络速度。

### 1.3 环境变量配置

在 `frontend` 目录下创建 `.env.local` 文件：

```env
# API 配置
NUXT_PUBLIC_API_BASE=http://localhost:3000

# AI 提供商密钥（选择一个）
NUXT_PUBLIC_OPENAI_API_KEY=sk-your-api-key-here

# 可选：其他 AI 提供商
# NUXT_PUBLIC_ANTHROPIC_API_KEY=xxx
# NUXT_PUBLIC_GOOGLE_API_KEY=xxx

# 开发环境标志
NUXT_PUBLIC_ENV=development
```

**获取 API 密钥**：
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Anthropic Console](https://console.anthropic.com)
- [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## 2. 启动开发服务器

### 2.1 基本启动

```bash
# 进入前端目录（如果不在的话）
cd frontend

# 启动开发服务器
npm run dev
```

首次启动会编译 TypeScript 和 Vue 文件，可能需要 30-60 秒。

输出应该看起来像这样：
```
➜  Local:    http://localhost:3000/
➜  Network:  use --host to expose

ℹ Using default Tailwind CSS file
✔ Nuxt Icon server bundle mode is set to local
✔ Vite client built in 2.34s
✔ Vite server built in 1.89s
```

### 2.2 访问应用

在浏览器中打开：[http://localhost:3000](http://localhost:3000)

您应该看到首页，展示三个 AI 角色卡片。

### 2.3 常用命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run preview    # 预览生产构建
npm run lint       # ESLint 检查和修复
npm run format     # 使用 Prettier 格式化代码
npm run type-check # TypeScript 类型检查
```

---

## 3. 项目结构快速浏览

```
frontend/
├── src/
│   ├── components/       # Vue 组件
│   ├── pages/           # 页面和路由
│   ├── stores/          # Pinia 状态管理
│   ├── composables/     # 组合式函数
│   ├── services/        # API 服务
│   ├── types/           # TypeScript 类型
│   ├── utils/           # 工具函数
│   └── assets/          # 静态资源
├── nuxt.config.ts       # Nuxt 配置
├── tsconfig.json        # TypeScript 配置
└── package.json         # 项目依赖
```

### 主要目录说明

| 目录 | 用途 |
|------|------|
| `components/` | 可复用的 Vue 组件 |
| `pages/` | 页面组件（自动路由） |
| `stores/` | Pinia 全局状态 |
| `composables/` | 逻辑复用函数 |
| `services/` | API 和外部服务 |
| `types/` | TypeScript 类型定义 |
| `utils/` | 工具和辅助函数 |

---

## 4. 第一个改动

### 4.1 修改首页欢迎文案

1. 打开文件：`src/pages/index.vue`

2. 找到欢迎文案部分（第一个 `<h1>` 标签）

3. 修改文本（例如从"Emo AI will always be with you"改为其他）

4. 保存文件，浏览器会自动刷新显示更改

这证明了热更新（HMR）正常工作！

### 4.2 修改角色信息

1. 打开文件：`src/utils/constants.ts`

2. 找到 `CHARACTERS` 常量

3. 修改某个角色的描述或名称

4. 保存，页面自动更新

---

## 5. 代码规范和工具

### 5.1 代码风格检查

```bash
# 检查并自动修复代码问题
npm run lint

# 只检查不修复
npx eslint . --max-warnings=0
```

### 5.2 代码格式化

```bash
# 格式化所有文件
npm run format

# 格式化特定文件
npx prettier --write src/components/home/CharacterCard.vue
```

### 5.3 类型检查

```bash
# 检查 TypeScript 类型错误
npm run type-check
```

**在 VS Code 中**：
- 安装 [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 扩展获得 Vue 3 支持
- 安装 [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) 扩展
- 打开文件时自动检查错误

---

## 6. 调试技巧

### 6.1 浏览器开发者工具

```javascript
// 在浏览器控制台中访问 Vue 状态
const app = document.querySelector('#__nuxt').__nuxt_data;
console.log(app); // 查看 Vue 组件数据

// 访问 Pinia Store
import { useChatStore } from '@/stores/chat';
const store = useChatStore();
console.log(store.messages);
```

### 6.2 VS Code 调试

1. 安装 [Debugger for Firefox](https://marketplace.visualstudio.com/items?itemName=firefox-devtools.vscode-firefox-debug) 或 Chrome 调试扩展

2. 在代码中设置断点（F9）

3. 按 F5 启动调试器

4. 浏览器中执行代码会在断点处暂停

### 6.3 常用调试技巧

```typescript
// 打印完整对象
console.log(JSON.stringify(object, null, 2));

// 使用控制台表格查看数组
console.table(messages);

// 性能计时
console.time('operation');
// ... 代码 ...
console.timeEnd('operation');

// 条件断点：只在满足条件时暂停
debugger;  // 手动设置断点
```

---

## 7. 常见问题解决

### 问题：依赖安装失败

**症状**：
```
npm ERR! ERESOLVE could not resolve dependency
```

**解决方案**：
```bash
# 使用 --legacy-peer-deps 标志
npm install --legacy-peer-deps

# 或清除缓存后重试
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 问题：端口 3000 已被占用

**症状**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：
```bash
# 使用不同端口
npm run dev -- --port 3001

# 或杀死占用端口的进程
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 问题：热更新不工作

**症状**：修改代码后页面不刷新

**解决方案**：
```bash
# 重启开发服务器
npm run dev

# 清除缓存
rm -rf .nuxt
npm run dev

# 或硬刷浏览器（Ctrl+Shift+R）
```

### 问题：TypeScript 错误提示

**症状**：VS Code 显示大量错误但能正常运行

**解决方案**：
1. 重启 VS Code
2. 运行 `npm run type-check` 验证真正的错误
3. 安装 Volar 扩展：`code --install-extension vue.volar`

---

## 8. 使用 Git 的最佳实践

### 8.1 创建特性分支

```bash
# 创建并切换到新分支
git checkout -b feature/chat-interface

# 推送分支
git push -u origin feature/chat-interface
```

### 8.2 提交代码

```bash
# 查看改动
git status
git diff

# 暂存改动
git add .

# 提交
git commit -m "feat: 实现聊天界面"

# 推送
git push
```

### 8.3 提交信息格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     新功能
fix:      bug 修复
docs:     文档更新
style:    代码风格（不影响功能）
refactor: 代码重构
perf:     性能优化
test:     测试
chore:    构建/依赖更新
```

**示例**：
```
feat: 添加聊天消息流式显示
fix: 修复危机干预弹窗显示错误
docs: 更新 API 文档
```

---

## 9. VS Code 推荐配置

### 9.1 推荐扩展

```json
{
  "recommendations": [
    "vue.volar",                          // Vue 3 支持
    "dbaeumer.vscode-eslint",             // ESLint
    "esbenp.prettier-vscode",             // Prettier
    "vue.vscode-typescript-vue-plugin",   // TS Vue 插件
    "bradlc.vscode-tailwindcss",          // TailwindCSS
    "GitHub.copilot",                     // GitHub Copilot (可选)
  ]
}
```

### 9.2 工作区设置 (.vscode/settings.json)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 10. 下一步

恭喜！您已经完成了基本设置。

### 继续阅读
- 📄 [开发指南](./development-guide.md) - 详细的编码规范
- 📄 [系统架构](./system-architecture.md) - 了解项目整体设计
- 📄 [模块设计](./module-design.md) - 各功能模块详情

### 开始开发
1. 选择一个 TODO 任务
2. 创建特性分支
3. 按照代码规范编写代码
4. 提交 Pull Request

---

## 获取帮助

遇到问题？

1. **查看文档**：阅读对应的文档文件
2. **检查 FAQ**：查看[常见问题](./faq.md)
3. **提出 Issue**：在 GitHub 上提出问题
4. **讨论**：联系团队成员

---

**祝您开发愉快！** 🚀
