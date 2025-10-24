# EmoAI 开发文档

欢迎来到 EmoAI 开发文档中心。本文档包含了系统架构设计、模块划分、技术选型和开发指南。

## 📚 文档导航

### 快速开始
- **[快速入门](./getting-started.md)** - 项目初始化和环境配置
- **[开发指南](./development-guide.md)** - 本地开发流程和最佳实践

### 核心设计
- **[系统架构](./system-architecture.md)** - 整体架构设计和技术栈
- **[模块设计](./module-design.md)** - 功能模块划分和职责说明
- **[数据模型](./data-models.md)** - 核心数据结构和类型定义

### 功能模块
- **[首页模块](./modules/home.md)** - 角色选择页面开发指南
- **[聊天模块](./modules/chat.md)** - AI 聊天功能实现
- **[日记模块](./modules/diary.md)** - 情绪日记生成和展示
- **[公共组件](./modules/common.md)** - 跨模块可复用组件

### 技术实现
- **[AI 服务集成](./technical/ai-integration.md)** - LLM API 调用和流式处理
- **[情绪分析](./technical/emotion-analysis.md)** - 情绪识别和危机检测
- **[状态管理](./technical/state-management.md)** - Pinia 状态管理指南
- **[API 规范](./technical/api-specification.md)** - 前后端接口规范

### 发布和部署
- **[构建流程](./deployment/build.md)** - 编译打包流程
- **[部署指南](./deployment/deployment.md)** - Vercel 部署步骤
- **[性能优化](./deployment/performance.md)** - 前端性能优化建议

### 其他
- **[常见问题](./faq.md)** - 开发中常见问题解答
- **[代码规范](./code-style.md)** - TypeScript 和 Vue 3 代码规范
- **[变更日志](./changelog.md)** - 项目更新历史

---

## 🎯 项目概览

### 核心功能
- ✨ **多角色 AI 陪伴** - 理性分析师、温柔导师、积极陪伴者
- 💬 **治愈式对话** - 基于 LLM 的自然语言交互
- 📊 **情绪可视化** - 六维度情绪雷达图和趋势分析
- 📝 **智能日记** - AI 自动生成情绪日报
- 🚨 **危机干预** - 实时检测极端情绪并提醒求助

### 技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| Nuxt.js | 3.x | 前端框架 |
| Vue | 3.x | UI 框架 |
| TypeScript | 5.x | 类型系统 |
| Pinia | 2.x | 状态管理 |
| @nuxt/ui | 2.x | UI 组件库 |
| Vite | 5.x | 构建工具 |
| ai-sdk | 3.x | LLM 集成 |
| Vercel | - | 部署平台 |

### 项目结构
```
frontend/
├── src/
│   ├── components/      # Vue 组件库
│   ├── pages/          # 页面路由
│   ├── stores/         # Pinia 状态管理
│   ├── composables/    # 组合式函数和业务逻辑
│   ├── services/       # API 服务层
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数集
│   └── assets/         # 静态资源
├── nuxt.config.ts      # Nuxt 配置
├── tsconfig.json       # TypeScript 配置
└── package.json        # 项目依赖
```

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0 (或 yarn / pnpm)

### 初始化项目
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开浏览器访问
# http://localhost:3000
```

### 常用命令
```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run preview    # 预览生产构建
npm run lint       # 代码检查和修复
npm run format     # 代码格式化
```

---

## 📖 文档使用建议

### 按角色阅读
- **前端开发者**：阅读《系统架构》→《模块设计》→《开发指南》→《功能模块》
- **设计师**：阅读《模块设计》→《系统架构》
- **测试人员**：阅读《功能模块》→《常见问题》
- **运维人员**：阅读《部署指南》→《性能优化》

### 按任务阅读
- **搭建开发环境**：《快速入门》→《开发指南》
- **开发新功能**：《模块设计》→对应《模块文档》→《API 规范》
- **集成 AI 服务**：《AI 服务集成》→《API 规范》
- **部署上线**：《构建流程》→《部署指南》

---

## 📝 贡献指南

### 提交代码前检查清单
- [ ] 代码遵循《代码规范》
- [ ] 本地通过 `npm run lint` 检查
- [ ] 功能测试无误
- [ ] 提交信息清晰明了
- [ ] 必要时更新对应文档

### 更新文档的建议
- 当添加新功能时，同步更新对应的模块文档
- 发现文档错误或不清楚的地方，及时反馈或修正
- 保持文档与代码同步更新

---

## 🤝 获取帮助

### 常见问题
遇到问题？先查看《常见问题》(./faq.md)

### 讨论和反馈
- 在项目 Issue 中提出问题
- 通过 PR 提交改进建议
- 与团队讨论架构问题

---

## 📅 文档版本

| 版本 | 日期 | 主要内容 |
|------|------|---------|
| 1.0 | 2025-10-18 | 初始版本，包含基础架构设计和模块划分 |

**最后更新**：2025-10-18

---

**开心开发！** 🎉
