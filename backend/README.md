# 🧠 EmoAI Backend

EmoAI 后端服务 - 基于 FastAPI 的 AI 心理健康伴侣应用后端。

## 📚 文档导航

### 🚀 快速开始
- **[src/README.md](src/README.md)** - 完整使用指南（推荐首先阅读）
  - 环境设置
  - 项目结构
  - API 接口文档
  - 开发指南
  - 故障排除

### 📋 项目分析
- **[MIGRATION_REPORT.md](MIGRATION_REPORT.md)** - 目录迁移完成报告
  - 迁移范围和清单
  - 导入路径更新详情
  - 验证测试结果
  
- **[STRUCTURE_ANALYSIS.md](STRUCTURE_ANALYSIS.md)** - 结构合理性分析
  - 当前状态评分（7/10）
  - 问题和改进建议
  - 优化方案（Phase 1/2/3）

---

## 📁 目录结构

```
backend/
├── src/                          # 源代码目录
│   ├── core/                     # 核心业务逻辑
│   ├── utils/                    # 工具函数
│   ├── data/                     # 数据文件（.gitignore）
│   ├── app.py                    # FastAPI 应用
│   ├── main.py                   # 聊天逻辑
│   ├── config.py                 # 配置
│   ├── state.py                  # 全局状态
│   └── README.md                 # API 文档（本目录的完整指南）
│
├── requirements.txt              # Python 依赖
├── .gitignore                    # Git 忽略规则
├── MIGRATION_REPORT.md          # 迁移报告
├── STRUCTURE_ANALYSIS.md        # 结构分析
└── README.md                     # 本文件（导航页）
```

---

## 🎯 核心功能

### 三个 API 端点
| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/chat/stream` | POST | 流式聊天（SSE） |
| `/api/emotion_log` | GET | 情绪日志读取 |
| `/api/emotion_stats/today` | GET | 当日情绪统计 |

### 四个核心模块
| 模块 | 位置 | 职责 |
|------|------|------|
| 情感分析 | `core/emotion_module.py` | 情感特征提取 |
| Agent 路由 | `core/agent_module.py` | 角色和风格选择 |
| Meta 反馈 | `core/meta_module.py` | 反馈和意图检测 |
| RAG 检索 | `core/rag_module.py` | FAISS 向量检索 |

---

## 🤖 Agent 核心创新点

我们的 Agent 设计超越了传统的单角色对话机器人，集成了一套自适应、自优化的认知框架。其核心创新点体现在以下四个层面：

| 创新点 | 核心模块 | 实现机制 |
| :--- | :--- | :--- |
| **动态思维智能体 (Agent-of-Thought)** | `agent_module.py` | 并非使用单一固定角色，而是在多个专家智能体（共情、咨询、幽默）之间动态选择。通过 `choose_agent_gen3` 函数，系统在每次交互前进行元认知判断，选择最适合当前对话目标的 "思维模式"，实现高度情境化的角色扮演。 |
| **多层上下文检索增强 (RAG)** | `rag_module.py` | RAG 系统为不同 Agent 和用户状态维护独立的 FAISS 向量知识库（如 `counsel_agent` vs `empathy_user`）。这使得信息检索不再是通用搜索，而是针对特定对话场景和情感状态的高度精准上下文注入。 |
| **元反馈驱动的自我修正闭环** | `meta_module.py` & `agent_module.py` | 系统通过 `detect_meta_feedback` 实时捕获用户对 AI 行为的自然语言反馈（例如 "你有点啰嗦"）。`interpret_feedback` 随后调用 LLM 将其解析为结构化偏好，并更新 Agent 的元策略，形成一个持续学习和优化的闭环。 |
| **实时情感与意图融合** | `emotion_module.py` | 系统不仅检测七种核心情感，还通过 `detect_intent` 识别用户意图，并利用 `contextual_valence` 等平滑算法，结合上下文动态调整情感判断。这种多维度融合机制确保了 Agent 响应的稳定性和同理心。 |

---

## ⚡ 快速启动

### 前置条件
```bash
# 1. 安装依赖
cd backend
pip install -r requirements.txt

# 2. 配置 NVIDIA API Key
export NV_API_KEY="your_api_key_here"
```

### 启动服务
```bash
# 方式 A: 直接运行（推荐开发用）
cd src
python app.py

# 方式 B: 使用 uvicorn
cd backend
python -m uvicorn src.app:app --host 0.0.0.0 --port 8010 --reload

# 方式 C: 从项目根目录运行
python -m uvicorn backend.src.app:app --host 0.0.0.0 --port 8010
```

### 验证服务
```bash
# 访问 Swagger 文档
http://localhost:8010/docs

# 测试 API
curl -X POST http://localhost:8010/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"user_input": "Hello, how are you?"}'
```

---

## 📊 项目评分

| 项目 | 得分 | 说明 |
|------|------|------|
| 模块化设计 | 9/10 | ✅ 清晰的分层结构 |
| 数据管理 | 5/10 | ⚠️ 需要整理到 `src/data/` |
| 路径管理 | 6/10 | ⚠️ 建议集中配置 |
| 向后兼容 | 9/10 | ✅ 兼容层设置完善 |
| 文档完整性 | 8/10 | ✅ 详细文档齐全 |
| **总体评分** | **7.4/10** | 基本合理，需优化数据整理 |

---

## 🔧 维护和优化

### 当前优先任务（Phase 1）
- [ ] 将数据文件移至 `src/data/`
  - 移动 `emotion_log.jsonl` 到 `src/data/logs/`
  - 移动 FAISS 索引和语料库到 `src/data/indexes/`
  - 删除根目录中的重复文件
  
- [ ] 更新所有模块中的路径引用

### 短期优化（Phase 2）
- [ ] 在 `config.py` 中集中管理所有路径
- [ ] 创建 `services/` 层处理复杂业务逻辑
- [ ] 添加单元测试和集成测试

### 长期优化（Phase 3）
- [ ] API 版本控制 (`/v1/`, `/v2/`)
- [ ] 专用 `models/` 目录管理数据模型
- [ ] 配置文件管理 (`config/dev.yaml`, `config/prod.yaml`)

---

## 🐛 故障排除

### 常见问题

**导入错误 `ModuleNotFoundError`**
```bash
# 解决：设置 PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)/src"
```

**找不到数据文件**
```bash
# 检查文件位置
ls -la src/data/indexes/
ls -la src/data/logs/
```

**端口占用**
```bash
# 查看占用进程
lsof -i :8010
# 终止进程并重试
```

更多故障排除见 [src/README.md - 常见问题与故障排除](src/README.md#常见问题与故障排除)

---

## 📖 完整文档列表

### 本后端目录
- 📄 [README.md](README.md) - 本文件（导航和概览）
- 📄 [src/README.md](src/README.md) - 详细使用指南 ⭐ 必读
- 📄 [MIGRATION_REPORT.md](MIGRATION_REPORT.md) - 迁移详情
- 📄 [STRUCTURE_ANALYSIS.md](STRUCTURE_ANALYSIS.md) - 结构分析

### 项目文档
- 📄 [docs/API-REFERENCE.md](../docs/API-REFERENCE.md) - 前端调用指南
- 📄 [docs/PRD.md](../docs/PRD.md) - 产品需求文档
- 📄 [Agents.md](../Agents.md) - AI Agents 规范

---

## 📝 贡献指南

### 提交 PR 前
- [ ] 阅读 [STRUCTURE_ANALYSIS.md](STRUCTURE_ANALYSIS.md) 了解架构
- [ ] 遵循现有的模块结构和命名规范
- [ ] 在 `src/test.py` 中验证导入和功能
- [ ] 更新相关文档

### 添加新功能
1. 在对应模块（`core/` 或 `utils/`）中实现
2. 在 `app.py` 中添加 API 路由
3. 在 [src/README.md](src/README.md) 中更新文档
4. 提交 PR 并说明改动

---

## 🚀 部署

### 生产环境检查清单
- [ ] 环境变量已配置
- [ ] 依赖已安装
- [ ] 数据文件已就位
- [ ] FAISS 索引可加载
- [ ] 日志目录可写
- [ ] 所有 API 端点可访问

### Docker 部署（可选）
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ src/

EXPOSE 8010
CMD ["python", "-m", "uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "8010"]
```

---

## 📞 联系与支持

- 🐛 报告 Bug: 在 GitHub 上创建 Issue
- 💡 功能建议: 在 PR 中讨论
- 📧 联系团队: 见项目主 README

---

## 📅 版本历史

### v2.0 (2025-10-31)
- ✅ 完整结构分析报告
- ✅ 详细使用指南更新
- ✅ Backend 导航 README

### v1.0 (2025-10-30)
- ✅ 目录迁移完成
- ✅ 模块化重构
- ✅ 验证脚本通过

---

*最后更新: 2025-10-31*  
版本: 2.0
