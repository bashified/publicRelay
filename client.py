import websocket
import threading
import requests

# host this using nohup, this needs to be on a background thread simply requesting API on port 4545

machine = "localhost"
localapiport = 0000
PROXY_WS_URL = ""

def on_message(ws, message):
    try:
        method, path, body = message.split("||", 2)
        print(f"[Received] {method} {path} with body: {body[:30]}...")

        # Send request to local API
        response = requests.request(method, f"http://{machine}:{localapiport}{path}", data=body)
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

def start_client():
    ws = websocket.WebSocketApp(
        PROXY_WS_URL,
        on_open=on_open,
        on_message=on_message,
        on_close=on_close,
        on_error=on_error
    )

    ws.run_forever()

start_client()
