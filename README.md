# publicRelay — Expose Local Services to the Internet via WebSocket Tunneling

> Lightweight, self‑hosted HTTP reverse tunnel to expose `localhost` to the public internet using a Node.js relay and a Python client.

---

## About

`publicRelay` (formerly *HTTP Tunnel / Http Proxy*) is an open‑source tunneling system that lets you publish a local web service without port‑forwarding or ISP NAT configuration. A public Node.js relay server accepts HTTP traffic and forwards it over a persistent WebSocket connection to a Python client running beside your local app. Responses are streamed back through the tunnel to the original requester.

This project is built for developers who want a simple, inspectable alternative to commercial tunnels ideal for local development, demos, webhook testing, or temporary sharing.

> ⚠️ This project is experimental and actively evolving. If you hit issues or have improvements, please open an issue or PR.

---

## Features

* **Zero port forwarding** - Works behind NAT / CGNAT.
* **Bi‑directional streaming** - Full request/response relay over WebSocket.
* **Binary-safe** - Handles JSON, text, and media via base64 for non‑text payloads.
* **Header preservation** - Forwards request headers end‑to‑end.
* **Real client IP** - Injects `X-Forwarded-For` with the original remote address.
* **Self‑hosted** - Run on your own VPS (AWS/Linode/DO/etc.).
* **Hackable** - Simple codebase, easy to extend.

---

## Architecture

```
[ Internet Client ]
        │
        ▼
[ Node.js Relay (Public IP) ]
        │   WebSocket (JSON / Base64)
        ▼
[ Python Client (Private) ] ──► [ Local App (127.0.0.1:PORT) ]
```

---

## How It Works

1. Public Relay (Node.js) listens for HTTP requests and an incoming WebSocket connection.
2. When a request arrives, the relay serializes the request (method, path, headers, body).
3. The serialized request is sent over WebSocket to the Python client.
4. The client replays the request locally using `requests`.
5. The response is sent back over WebSocket.
6. The relay converts it into a real HTTP response for the original requester.

The original visitor never talks directly to your private network.

---

## Getting Started

### Requirements

* Public VPS with a reachable port
* Node.js ≥ 16
* Python ≥ 3.8
* `ws`, `requests`, `websocket-client`

---

## Installation

### 1. Clone

```bash
git clone https://github.com/bashified/publicRelay
cd publicRelay
```

---

### 2. Server Setup (Public Machine)

```bash
cd server
npm install
```

Edit `server/proxyconfig.json` to point to the open port

```json
{
  "port": 8080
}
```

Run the relay:

```bash
node proxy.js
```

---

### 3. Client Setup (Local Machine)

```bash
cd client
pip install -r requirements.txt
```

Edit `client/clientconfig.json`:

```json
{
  "proxy-ip": "YOUR_VPS_IP",
  "proxy-port": 8080,
  "localApplicationIP": "127.0.0.1",
  "localApplicationPort": 5000
}
```

Run the client:

```bash
python client.py
```

or in background:

```bash
nohup python client.py > client.log &
```

Make sure your local app is listening on `localhost:5000` or the address that u configured on the proxy.

---

## Testing

In command prompt

```
curl http://YOUR_VPS_IP:8080/
```

If correctly connected:

```
Tunnel is alive
```

Try forwarding requests to your local server:

```
http://YOUR_VPS_IP:8080/api
```

---

## Reading the Forwarded IP

The server sends the initiator ip under the `"X-Forwarded-For"` header and this can be like this :

```python
# python
request.headers.get("X-Forwarded-For")
```
This should be used instead of `req.ip` to avoid getting "localhost"

---

## Security Notes

* No authentication is currently implemented.
* Anyone hitting your relay can reach your local app.
* Recommended protections:

  * IP filtering
  * Auth tokens
  * Rate limiting
  * Getting an SSL cert to allow traffic and responses in HTTP/S

> Do NOT use this for banking, auth flows, or sensitive production workloads.

---

## Known Limitations

* Single active client connection
* Not suitable for WebRTC or long‑lived streams
* Adds latency due to request relay

---

## Roadmap

[ * ] ~~Forward initiator IP~~
[ * ] ~~Binary payload support~~
[ * ] ~~Header passthrough~~
[ ? ] Implementing a configurable firewall
[ ? ] Blacklist feature for potential DDoS detection
[ ? ] Multi‑tunnel support
[ ? ] Authentication layer
[ ? ] Access logging dashboard
[ ? ] Traffic statistics

---

## Contributing

Pull requests welcome.

If you add a feature, **document it.**

---

If you break it — fix it.
If you improve it — PR it.
If you love it — star it.