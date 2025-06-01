import websocket
import threading
import requests
import json

machine = "localhost"
localapiport = 4545
PROXY_WS_URL = "ws://217.160.125.127:9516"

def on_message(ws, message):
    try:
        data = json.loads(message)
        method = data["method"]
        path = data["endpoint"]
        ip = data["clientIP"]   # sending this over to localhost using x-forwarded-for
        body = data["body"]
        headers = data.get("headers", {}) + [{"X-Forwarded-For": ip}]

        response = requests.request(
            method,
            f"http://{machine}:{localapiport}{path}",
            data=body,
            headers=headers
        )

        ws.send(response.text)
    except Exception as e:
        print("Error handling message:", e)
        ws.send("Error: " + str(e))
        
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