import websocket
import threading
import requests
import json
import base64

machine = "localhost"
localapiport = 
PROXY_WS_URL = "ws://ip:port"

def on_message(ws, message):
    try:
        data = json.loads(message)
        method = data["method"]
        path = data["url"]
        body = data["body"]
        is_binary = data.get("isBinary", False)

        headers = data.get("headers", {})
        headers.update({"X-Forwarded-For": data.get("remoteAddress", "UNKNOWN")})

        if is_binary:
            body = base64.b64decode(body)

        response = requests.request(
            method,
            f"http://{machine}:{localapiport}{path}",
            data=body,
            headers=headers
        )

        # Detect if backend response is binary (media, etc.)
        content_type = response.headers.get("Content-Type", "")
        is_response_binary = not content_type.startswith("text/") and "json" not in content_type

        payload = {
            "status": response.status_code,
            "headers": dict(response.headers),
            "isBinary": is_response_binary,
            "body": base64.b64encode(response.content).decode() if is_response_binary else response.text
        }

        ws.send(json.dumps(payload))
    except Exception as e:
        print("Error handling message:", e)
        ws.send(json.dumps({
            "status": 500,
            "headers": {"Content-Type": "text/plain"},
            "isBinary": False,
            "body": "Error: " + str(e)
        }))

def on_open(ws):
    print("[+] Connected to proxy WebSocket")

def on_close(ws, close_status_code, close_msg):
    print("[-] Disconnected from proxy:", close_status_code, close_msg)

def on_error(ws, error):
    print("[!] WebSocket error:", error)

def run():
    while True:
        try:
            ws = websocket.WebSocketApp(
                PROXY_WS_URL,
                on_open=on_open,
                on_message=on_message,
                on_close=on_close,
                on_error=on_error
            )
            ws.run_forever()
        except Exception as e:
            print("retrying connection in 5 seconds due to error:", e)
            import time
            time.sleep(5)

run()
