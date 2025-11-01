# sse_client_httpx.py
import json
import httpx
import asyncio

API = "http://localhost:8010/api/chat/stream"

async def send_and_stream(user_input: str):
    payload = {"user_input": user_input}
    headers = {"Content-Type": "application/json", "Accept": "text/event-stream"}

    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream("POST", API, json=payload, headers=headers) as r:
            prev = ""
            print("AI：", end="", flush=True)
            async for chunk in r.aiter_text():
                for line in chunk.splitlines():
                    if not line.startswith("data:"):
                        continue
                    raw = line[len("data:"):].strip()
                    try:
                        evt = json.loads(raw)
                    except json.JSONDecodeError:
                        continue
                    reply = evt.get("reply_chunk", "")
                    if len(reply) > len(prev):
                        print(reply[len(prev):], end="", flush=True)
                        prev = reply
                    if evt.get("is_final"):
                        print("\n\n[report]", evt.get("report", ""))
                        print("-" * 60)
                        return

async def main():
    print("连接到 /api/chat/stream (httpx 真·流式客户端)")
    while True:
        try:
            msg = input("\n你：").strip()
            if msg:
                await send_and_stream(msg)
        except KeyboardInterrupt:
            print("\n退出。")
            break

if __name__ == "__main__":
    asyncio.run(main())
