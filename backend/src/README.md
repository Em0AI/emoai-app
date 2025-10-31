# 🧠 EmoAI 后端 - 完整使用指南

## 📖 目录
1. [快速开始](#快速开始)
2. [项目结构](#项目结构)
3. [API 接口文档](#api-接口文档)
4. [开发指南](#开发指南)

---

## 快速开始

### 环境设置

#### 1. 安装依赖
```bash
cd backend
pip install -r requirements.txt
```

#### 2. 配置环境变量
在 `src/` 目录创建 `.env` 文件（或在 `config.py` 中直接设置）：
```bash
# .env 示例
NV_API_KEY=your_nvidia_api_key_here
```

#### 3. 启动服务器

**方式 A: 直接运行**
```bash
cd src
python app.py
```

**方式 B: 使用 uvicorn**
```bash
cd backend
python -c "import sys; sys.path.insert(0, 'src'); from app import app; import uvicorn; uvicorn.run(app, host='0.0.0.0', port=8010)"
```

**方式 C: 在项目根目录运行**
```bash
python -m uvicorn src.app:app --host 0.0.0.0 --port 8010 --reload
```

#### 4. 验证服务
- 🌐 Web API 文档: http://localhost:8010/docs
- 📊 ReDoc 文档: http://localhost:8010/redoc

---

## 项目结构

### 📁 目录树
```
src/
├── __init__.py                           # 包初始化（管理 sys.path）
├── config.py                             # 配置管理（API Key、客户端）
├── state.py                              # 全局状态（会话、索引）
├── app.py                                # FastAPI 应用入口
├── main.py                               # 主聊天逻辑入口
├── utils.py                              # 兼容层（重导出工具函数）
├── test.py                               # 验证脚本
│
├── core/                                 # 📦 核心业务逻辑层
│   ├── __init__.py
│   ├── emotion_module.py                 # 情感分析
│   ├── agent_module.py                   # Agent 路由与个性化
│   ├── meta_module.py                    # Meta 反馈检测
│   └── rag_module.py                     # RAG 检索与向量索引
│
├── utils/                                # 📦 工具函数层
│   ├── __init__.py
│   └── tools.py                          # 文本处理、日志记录等
│
└── data/                                 # 📦 数据文件（.gitignore）
    ├── indexes/                          # FAISS 向量索引
    │   ├── faiss_empathy_user.index
    │   ├── faiss_empathy_user_corpus.json
    │   ├── faiss_empathy_agent.index
    │   ├── faiss_empathy_agent_corpus.json
    │   ├── faiss_counsel_user.index
    │   ├── faiss_counsel_user_corpus.json
    │   ├── faiss_counsel_agent.index
    │   └── faiss_counsel_agent_corpus.json
    │
    └── logs/                             # 情感日志
        └── emotion_log.jsonl
```

### 🔧 核心模块说明

| 模块 | 文件 | 职责 |
|------|------|------|
| **情感分析** | `core/emotion_module.py` | 从用户输入中提取情感特征 |
| **Agent 路由** | `core/agent_module.py` | 选择合适的对话角色和风格 |
| **Meta 反馈** | `core/meta_module.py` | 检测用户的间接反馈和意图 |
| **RAG 检索** | `core/rag_module.py` | 使用 FAISS 检索相似的历史对话 |
| **工具函数** | `utils/tools.py` | 文本处理、日志记录等通用工具 |

### 📡 导入方式

**方式 1（推荐）- 直接导入核心模块**
```python
from core import emotion_module, agent_module, rag_module
```

**方式 2 - 通过工具函数**
```python
import utils
from utils import safe_text, safe_batch, log_emotion_entry
```

**方式 3 - 显式导入**
```python
from core.emotion_module import detect_emotion
from utils.tools import safe_text
```

---

## API 接口文档

本服务共暴露三个主要接口：  
- `/api/chat/stream` — 主聊天流式输出（SSE）  
- `/api/emotion_log` — 历史情绪日志读取  ⚠️ 返回所有日志，谨慎调用
- `/api/emotion_stats/today` — 当天情绪分布统计  

---

## ① `/api/chat/stream`

**方法：** `POST`  
**说明：**  
通过 **Server-Sent Events (SSE)** 实时流式返回模型回复。  
每个数据块以 `data:` 开头，最后一条的 `"is_final": true` 表示结束。

### 请求示例
```bash
curl -N -H "Accept: text/event-stream"      -H "Content-Type: application/json"      -X POST http://ip_location:8010/api/chat/stream      --data-raw '{
         "user_input": "tell me a joke",
         "tone": 0.6,
         "agent_override": "funny",
         "session_id": "test-session-2"
     }'
```

### 返回示例
```json
data: {
  "reply_chunk": "Sure, I'd be happy to tell you a joke...",
  "report": "**Emotion:** 😐 neutral (0.46) | **Trend:** stable | **Agent:** <span style='color:#FFD580'>Funny (Generating...)</span> | **Avg Valence:** +0.00",
  "is_final": false
}

data: {
  "reply_chunk": "",
  "report": "**Emotion:** 😐 neutral (0.46) | **Trend:** stable | **Agent:** <span style='color:#FFD580'>Funny (Generating...)</span> | **Avg Valence:** +0.00",
  "is_final": true
}
```

> **字段说明**  
> - `reply_chunk` — 流式输出的分段回复文本  
> - `report` — 当前情绪、趋势与 agent 信息  
> - `is_final` — 是否为最后一条块（`true` 表示结束）  

---

## ② `/api/emotion_log`

**方法：** `GET`  
**说明：**  
读取完整的情绪日志记录（按时间倒序）。

### 请求示例
```bash
curl -s http://ip_location:8010/api/emotion_log 
```

### 返回示例
```json
[
  {
    "timestamp": "2025-10-26T20:45:11.853740",
    "user_input": "thank you",
    "emotion": "neutral",
    "valence": 0.0,
    "trend": "stable",
    "agent_used": "funny",
    "ai_reply": "You're welcome!"
  }
]
```

---

## ③ `/api/emotion_stats/today`

**方法：** `GET`  
**说明：**  
返回当天日志中各情绪出现次数的统计结果。

### 请求示例
```bash
curl -s http://ip_location:8010/api/emotion_stats/today 
```

### 返回示例
```json
{
  "date": "2025-10-26",
  "total_entries": 7,
  "emotion_counts": {
    "neutral": 6,
    "joy": 1
  }
}
```

> **字段说明**  
> - `date` — 当前日期（ISO 格式）  
> - `total_entries` — 今日总对话条数  
> - `emotion_counts` — 情绪分布（键为情绪类型，值为出现次数）  

---

## 🌐 服务信息
- **Host:** `http://ip_location:8010`  
- **Docs:** [http://ip_location:8010/docs](http://ip_location:8010/docs) （Swagger 自动文档）  
- **返回编码:** UTF-8  
- **响应格式:** JSON / SSE（流式）  

---

## 开发指南

### 添加新的 API 端点

**步骤 1: 在 `main.py` 中实现逻辑**
```python
# main.py
async def new_feature_logic(params):
    """实现你的逻辑"""
    result = await do_something(params)
    return result
```

**步骤 2: 在 `app.py` 中添加路由**
```python
# app.py
from main import new_feature_logic

@app.post("/api/new_feature")
async def new_feature_endpoint(request: Request):
    data = await request.json()
    result = await new_feature_logic(data)
    return {"status": "success", "data": result}
```

**步骤 3: 测试**
```bash
curl -X POST http://localhost:8010/api/new_feature \
  -H "Content-Type: application/json" \
  -d '{"param": "value"}'
```

### 修改核心模块

**情感分析改进例**
```python
# src/core/emotion_module.py
def detect_emotion(text: str) -> dict:
    """增强的情感检测"""
    # 你的改动
    result = analyze_sentiment(text)
    return result
```

✅ 修改后**无需重启服务器**（如果使用 `--reload`）

### 添加新的工具函数

**步骤 1: 在 `utils/tools.py` 中添加函数**
```python
# utils/tools.py
def new_utility_function(data: str) -> str:
    """新的工具函数"""
    return data.strip().upper()
```

**步骤 2: 在 `utils/__init__.py` 中导出**
```python
# utils/__init__.py
from .tools import (
    # ... 现有导出
    new_utility_function,  # 新增
)

__all__ = [
    # ... 现有列表
    'new_utility_function',  # 新增
]
```

**步骤 3: 在应用中使用**
```python
# app.py 或其他地方
from utils import new_utility_function
result = new_utility_function("hello world")
```

### 数据文件管理

#### FAISS 索引

- **位置**: `src/data/indexes/`
- **文件格式**: `*.index` （索引）+ `*_corpus.json` （语料库）
- **四个索引**: empathy_user, empathy_agent, counsel_user, counsel_agent

**查看索引状态**
```python
# src/state.py
import state
print("已加载的索引：", state.indexes.keys())
print("empathy_user 向量数：", len(state.indexes['empathy_user']['corpus']))
```

#### 情感日志

- **位置**: `src/data/logs/emotion_log.jsonl`
- **格式**: JSON Lines（每行一条记录）
- **记录结构**:
```json
{
  "timestamp": "2025-10-26T20:45:11.853740",
  "user_input": "tell me a joke",
  "emotion": "neutral",
  "valence": 0.0,
  "trend": "stable",
  "agent_used": "funny",
  "ai_reply": "Why did the chicken cross the road?..."
}
```

### 环境变量配置

在 `src/config.py` 中配置的关键变量：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `NV_API_KEY` | 环境变量 | NVIDIA API 密钥（嵌入模型） |
| `client.base_url` | `http://13.40.57.214:8000/v1` | 本地聊天模型 API |
| `client_embedding.base_url` | NVIDIA 官方 | 嵌入模型 API |

**如何更改配置**
```python
# config.py
# 1. 本地聊天模型
client = OpenAI(
    api_key="dummy-local-key",
    base_url="http://your_server:8000/v1"  # 改这里
)

# 2. 嵌入模型
client_embedding = OpenAI(
    api_key=NV_API_KEY,  # 从环境变量读取
    base_url="https://integrate.api.nvidia.com/v1"
)
```

---

## 常见问题与故障排除

### ❌ 问题: 导入错误 `ModuleNotFoundError: No module named 'core'`

**原因**: Python 的 sys.path 不包含 `src/` 目录

**解决方案**:
```bash
# ✅ 方式 1: 设置 PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:/path/to/backend/src"
python app.py

# ✅ 方式 2: 从后端目录运行
cd backend
python -m uvicorn src.app:app --host 0.0.0.0 --port 8010

# ✅ 方式 3: 使用 src/__init__.py 中的路径设置
cd src
python app.py
```

### ❌ 问题: 找不到数据文件 `FileNotFoundError: [Errno 2] No such file or directory: 'emotion_log.jsonl'`

**原因**: 相对路径引用不正确

**解决方案**:
在 `config.py` 中使用绝对路径：
```python
# config.py
from pathlib import Path
import os

# ✅ 推荐：使用绝对路径
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'
EMOTION_LOG_PATH = DATA_DIR / 'logs' / 'emotion_log.jsonl'

# ✅ 使用
with open(EMOTION_LOG_PATH, 'r') as f:
    logs = f.readlines()
```

### ❌ 问题: FAISS 索引加载失败 `RuntimeError: FAISS library not installed`

**原因**: FAISS 未安装或版本不兼容

**解决方案**:
```bash
# 重新安装依赖
pip install -r requirements.txt

# 或显式安装 FAISS
pip install faiss-cpu  # CPU 版本
# 或
pip install faiss-gpu  # GPU 版本（需要 CUDA）
```

### ❌ 问题: 端口 8010 已占用 `Address already in use`

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :8010

# 终止进程
kill -9 <PID>

# 或使用不同的端口
python -m uvicorn src.app:app --host 0.0.0.0 --port 8011
```

### ❌ 问题: 流式响应无法解析 `JSONDecodeError` 或乱码

**原因**: SSE 流格式问题或编码错误

**调试方法**:
```bash
# 查看原始响应
curl -N -v http://localhost:8010/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"user_input": "hello"}'

# 检查响应头（应包含 Content-Type: text/event-stream）
```

---

## 性能优化建议

### 1. 索引缓存

FAISS 索引在 `state.py` 中全局维护，避免重复加载：
```python
# ✅ 已优化：索引在全局状态中
from state import indexes
emotion_index = indexes['empathy_user']  # 直接使用
```

### 2. 日志优化

避免频繁写磁盘，使用缓冲：
```python
# utils/tools.py
log_buffer = []

def log_emotion_entry_buffered(entry, flush_size=10):
    global log_buffer
    log_buffer.append(entry)
    if len(log_buffer) >= flush_size:
        flush_logs()

def flush_logs():
    # 一次性写入多条记录
    pass
```

### 3. 流式响应优化

使用生成器避免内存溢出：
```python
# app.py
async def generate_stream():
    for chunk in response.iter_lines():
        yield f"data: {chunk}\n\n"

return StreamingResponse(generate_stream(), media_type="text/event-stream")
```

---

## 部署检查清单

- [ ] 依赖已安装: `pip install -r requirements.txt`
- [ ] 环境变量已配置: `NV_API_KEY` 已设置
- [ ] 数据文件就位: `src/data/indexes/` 和 `src/data/logs/` 存在
- [ ] 服务启动正常: `http://localhost:8010/docs` 可访问
- [ ] 三个 API 端点均可访问
- [ ] 情感日志有可读权限: `src/data/logs/emotion_log.jsonl`
- [ ] FAISS 索引可加载: `src/data/indexes/*.index`

---

## 相关文档

- 📄 [MIGRATION_REPORT.md](../MIGRATION_REPORT.md) - 目录迁移详情
- 📄 [STRUCTURE_ANALYSIS.md](../STRUCTURE_ANALYSIS.md) - 结构分析与优化建议
- 📡 [API-REFERENCE.md](../../docs/API-REFERENCE.md) - 前端调用指南

---

*最后更新: 2025-10-31*  
*版本: 2.0 - 包含完整使用指南*

````  
