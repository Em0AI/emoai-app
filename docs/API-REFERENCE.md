# EmoAI 后端 API Reference

**版本**: 1.0.0  
**最后更新**: 2025年10月19日  
**基础路径**: `/api`

---

## 1. 概述

EmoAI 后端提供 2 个核心接口：**流式聊天**和**日记生成**。

### 前后端职责

| 功能 | 前端 | 后端 |
|------|------|------|
| 角色数据 | ✅  | ✅ |
| 聊天历史 | ✅  | ✅ |
| 日记列表 | ✅  | ✅ |
| AI 聊天 | - | ✅ |
| 日记生成 | - | ✅ |

---

## 2. 通用规范

### 响应格式
```typescript
{ code: number, message: string, data?: T, timestamp: number }
```

### 时间格式
- 时间戳：Unix 毫秒 (number)
- 日期：`YYYY-MM-DD` (string)

---

## 3. 聊天接口

### POST /api/chat/stream

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| characterName | string | ✅ | 角色名 (Maya/Atlas/Aurora) |
| message | string | ✅ | 用户消息 |
| conversationHistory | array | ❌ | 会话历史 `[{role, content}, ...]` |

**响应格式**

流式文本，使用 `<<<EMOTION_ANALYSIS>>>` 分隔AI回复和情绪数据：

```
AI回复文本...

<<<EMOTION_ANALYSIS>>>
{情绪分析JSON}
```

**情绪数据字段**

| 字段 | 类型 | 说明 |
|------|------|------|
| primary | string | 主要情绪 |
| secondary | string | 次要情绪（可选） |
| scores | object | 六维度分数 (0-10) |
| keywords | array | 关键词 |
| crisisDetected | boolean | 危机检测 |

六维度：`happy`, `satisfied`, `calm`, `anxious`, `angry`, `sad`

**危机处理**

当 `crisisDetected: true`，前端需：弹窗 → 15秒倒计时 → 拨打热线

---

## 4. 日记接口

### POST /api/diary/generate

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date | string | ✅ | 日期 (YYYY-MM-DD) |
| characterName | string | ✅ | 角色名 |
| conversationMessages | array | ✅ | 聊天记录 `[{role, content, timestamp}, ...]` |
| previousDiary | object | ❌ | 前一天日记（趋势分析用） |

**返回数据**

| 字段 | 说明 |
|------|------|
| id, date, characterName | 基本信息 |
| emotionScores | 六维度分数 (0-10) |
| moodKeywords | 3个关键词（数组） |
| moodSummary | 心情小结 |
| trendAnalysis | 情绪趋势 |
| insights | 小小觉察 |
| practice | 温柔练习 |
| message | 今日寄语 |
| createdAt | 时间戳 |

**关键词选取**

1. 分数降序排序
2. 取前2名
3. 判断是否同类（正向/负向）：
   - 同类 → 第3个从另一类选最高分
   - 不同类 → 直接选第3名

分类：正向 (happy/satisfied/calm) | 负向 (anxious/angry/sad)

---

## 5. 错误码

### HTTP 状态码
200 成功 | 400 参数错误 | 429 请求频繁 | 500 服务器错误

### 业务错误码

| 码 | 说明 |
|----|------|
| 1001 | 消息为空 |
| 1002 | 消息过长(>10000) |
| 1003 | 角色名无效 |
| 2001 | 日记生成失败 |
| 2002 | 日期格式错误 |
| 2003 | 聊天记录为空 |
| 3001-3003 | AI服务/流式/情绪分析 失败 |

---

## 6. 附录

**AI 角色**  
Maya (温柔导师) | Atlas (理性分析师) | Aurora (积极陪伴者)

**情绪类型**  
happy开心 | satisfied满足 | calm平静 | anxious焦虑 | angry愤怒 | sad悲伤

**危机关键词**  
中文：想结束一切、不想活了  
英文：want to end it all、life is meaningless

**紧急热线**  
🇨🇳 110/12320 | 🇬🇧 999/116123 | 🇺🇸 911/988 | 🇯🇵 110

**速率限制**  
聊天 20次/分钟 | 日记 10次/分钟

---

**v1.0.0** (2025-10-19) | [GitHub](https://github.com/neverbiasu/emoai-app)
