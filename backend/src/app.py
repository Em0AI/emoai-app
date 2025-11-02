# app.py
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import json
import uvicorn
from main import chat_fn      
import utils
import state
import uuid
from datetime import datetime, date, timedelta
from config import client
app = FastAPI(title="EmoAI API")
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 流式输出接口
# app.py

# ... (你的 import 保持不变) ...

# 流式输出接口
from datetime import date, timedelta
from config import client
import utils

# 流式输出接口
@app.post("/api/chat/stream")
async def chat_stream(request: Request):
    data = await request.json()
    user_input = data.get("user_input", "")
    tone = data.get("tone", data.get("tone_level", 0.6))
    
    # --- 1. 在函数*顶部*读取所有可选参数 ---
    agent_override = data.get("agent_override", None)
    
    # --- 2. 直接获取固定会话的历史记录 ---
    try:
        chat_history_session = state.session_conversations[state.FIXED_SESSION_ID]
        emotion_history_session = state.session_emotion_history[state.FIXED_SESSION_ID]
    except KeyError:
        # 预防万一, 如果 state.py 没初始化成功, 就在这里初始化
        state.session_conversations[state.FIXED_SESSION_ID] = []
        state.session_emotion_history[state.FIXED_SESSION_ID] = []
        chat_history_session = state.session_conversations[state.FIXED_SESSION_ID]
        emotion_history_session = state.session_emotion_history[state.FIXED_SESSION_ID]
    
    # --- 3. 在这里安全地获取两个列表 ---
    #chat_history_session = state.session_conversations[session_id]
    #emotion_history_session = state.session_emotion_history[session_id]

    async def event_stream():
        try:
            final_report = "Streaming..."
            
            # --- 4. 把所有参数传给 chat_fn ---
            for partial_data in chat_fn(user_input, 
                                        chat_history_session, 
                                        tone, 
                                        agent_override=agent_override, 
                                        emotion_history=emotion_history_session):
                
                current_chat_history, report, img_obj, _ = partial_data
                
                assistant_reply = ""
                if current_chat_history and current_chat_history[-1]["role"] == "assistant":
                    assistant_reply = current_chat_history[-1]["content"]

                output = {
                    "reply_chunk": assistant_reply,
                    "report": report,
                    "is_final": False
                }
                final_report = report 
                
                yield f"data: {json.dumps(output)}\n\n"
            
            # --- 5. 在最终回复中包含 session_id (这部分你是对的) ---
            output = {
                "reply_chunk": "",
                "report": final_report,
                "is_final": True
            }
            yield f"data: {json.dumps(output)}\n\n"

        except Exception as e:
            print(f"[FastAPI Error] {e}")
            error_output = {
                "error": str(e),
                "report": "An error occurred on the server.",
                "is_final": True
            }
            yield f"data: {json.dumps(error_output)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

# 日志接口
@app.get("/api/emotion_log")
async def get_emotion_log():
    """
    获取所有已保存的情绪日志条目。
    """
    log_data = utils.read_emotion_log()
    
    # 按时间倒序返回 (最新的在最前面)，方便前端显示
    return sorted(log_data, key=lambda x: x.get("timestamp", ""), reverse=True)


@app.get("/api/emotion_stats/today")
async def get_today_emotion_stats():
    """
    返回当天情绪统计 + 与昨日对比（如有） + 自动生成结构化情绪日报
    """
    log_data = utils.read_emotion_log()
    today = date.today()
    today_str = today.isoformat()
    yesterday_str = (today - timedelta(days=1)).isoformat()

    # --- 筛选日志 ---
    today_logs = [e for e in log_data if e.get("timestamp", "").startswith(today_str)]
    yesterday_logs = [e for e in log_data if e.get("timestamp", "").startswith(yesterday_str)]

    # --- 统计函数 ---
    def count_emotions(entries):
        stats = {}
        for entry in entries:
            emo = entry.get("emotion", "unknown")
            stats[emo] = stats.get(emo, 0) + 1
        return stats

    today_stats = count_emotions(today_logs)
    yesterday_stats = count_emotions(yesterday_logs)

    # --- 判断是否存在昨日数据 ---
    if yesterday_logs:
        diff = {}
        all_keys = set(today_stats.keys()) | set(yesterday_stats.keys())
        for k in all_keys:
            diff[k] = today_stats.get(k, 0) - yesterday_stats.get(k, 0)
        diff_text = ", ".join([f"{k} {'+' if v>=0 else ''}{v}" for k, v in diff.items()])
        compare_text = f"Yesterday's emotion counts: {', '.join([f'{k}: {v}' for k, v in yesterday_stats.items()])}\nChange summary: {diff_text}"
    else:
        compare_text = "No emotion data is available for yesterday; please analyze today's data only."

    # --- Prompt 构建 ---
    emotion_summary_text = ", ".join([f"{k}: {v}" for k, v in today_stats.items()]) or "no data"

    prompt = f"""
Today is {today_str}.
Today's emotion counts: {emotion_summary_text}
{compare_text}

Write a structured emotional daily report in the following format:

YYYY/MM/DD
Today's Mood Keywords
<3–5 emotion keywords derived from today's dominant emotions>

Emotion Trend
<describe changes if yesterday's data is available; 
if yesterday is missing, acknowledge that and focus on today's emotions>

Emotional Summary
<brief description of today's emotional pattern>

AI Observation
<1–2 sentences interpreting what today's emotions suggest about the user's mindset>

Healing Exercise
<one small, gentle self-care suggestion>

AI's Message
<2–3 sentences written like a kind, human message, no signature>

Tone: warm, natural, and empathetic.
Write in English.
Keep each section under 3 sentences.
"""

    ai_report = ""
    try:
        resp = client.chat.completions.create(
            model="nvidia/llama-3.1-nemotron-nano-8b-v1",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=420
        )
        ai_report = resp.choices[0].message.content.strip()
    except Exception as e:
        ai_report = f"[Error generating report: {e}]"

    return {
        "date": today_str,
        "total_entries": len(today_logs),
        "emotion_counts": today_stats,
        "yesterday_counts": yesterday_stats,
        "ai_daily_report": ai_report
    }

# 启动服务器的指令 (保持不变)
if __name__ == "__main__":
    print("启动 FastAPI 服务器")
    print("访问 http://127.0.0.1:8010/docs 查看 API 文档")
    # 注意：在 main.py 加载 RAG 索引可能需要几秒钟
    # 确保在 uvicorn.run 之前，main.py 中的 rag_module.load_and_init_indexes() 已经执行完毕
    # (因为 app.py 导入了 main.py, main.py 顶层的代码会先执行, 所以这是OK的)
    uvicorn.run(app, host="0.0.0.0", port=8010)
