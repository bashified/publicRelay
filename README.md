# HTTP Tunnel – Expose Localhost to Public Network

- Before you begin using this project, I would like to state that this project is NOT picture perfect. I spend my time polishing this and adding more updates every now and then. This has been one of my dream projects and I am always excited to work on it any time that I can. So please if you decide to use this and find any issues, make sure to make a [pull request](https://github.com/0xk3sh4v/http-tunnel/pulls) or open an [issue](https://github.com/0xk3sh4v/http-tunnel/issues). Thank you.

- This project was previously called "Http Proxy" which was misleading since this does not provide any IP spoofing, it's a simple tunnel that connects your localhost to the World Wide Web with no need to manage API keys and code integrations, all you ever need is a minimum specification hardware server on AWS, Linode or any Cloud Providing Service and you're ready to launch your project of any size on the internet!

### Overview

This project is an HTTP tunneling solution designed to expose your local server to the public internet. Built using Node.js and Python, it leverages WebSockets (ws), HTTP, and Flask to create a simple and persistent tunnel between your local environment and a publicly accessible endpoint. This makes it perfect for local development, remote testing, or quickly sharing your service without port forwarding to some limited users.

### Features

- Open source: The code can be modified as per user needs to add more logging, monitoring or simply run it with no mods.
- Expose Localhost: Tunnel your local services to a public endpoint.
- WebSocket-Based Tunneling: Uses WebSockets for bi-directional real-time communication between client and server.
- Flask API Client: Lightweight Python-based client to forward HTTP traffic from tunnel to local server.
- Node.js Server: Public-facing WebSocket + HTTP listener that relays traffic to the local machine.
- Remote Address Transfer: Unlike most traditional http tunnels that lose the initial remote address of the request initiator, I use the `"X-Forwarded-For"` header to transfer the initial IP address. 

```py
print("Remote Address:", request.headers.get("X-Forwarded-For"))

"""
Using this, the initial IP address of the initiator 
can be found and be used for m
onitoring, logging, moderating or cooldown purposes. 
"""
```

### Key Benefits

- No Port Forwarding Needed: Tunnel requests without modifying your router.
- Lossless Data Transfer: Using websockets, the request body and headers are transfered without any loss to the client and the response is fetched to the server.
- Secure Communication: Easily integrate TLS, WSS and other security protocols on the server side to ensure no man in the middle threats.
- Cross-Platform Integration: Works across Node.js and Python, giving you flexibility.

### How It Works

The system sets up a tunnel where:

- The Node.js server listens for HTTP requests and forwards them via WebSocket to a connected Python Flask client running on your local machine.
- The client receives the forwarded requests, processes them locally, and sends back the responses via WebSocket where they are sent back to the visitor via the Node.js server.
- From the outside, your service appears publicly hosted, even though it's running privately.

This tunneling approach avoids the need for direct access to your local IP or router configuration.

### Getting Started

Prerequisites

- Node.js (WebSocket + HTTP server)
- Python (for the tunneling client)
- Basic understanding of HTTP tunneling
- WebSocket library (ws) and Flask module

### Installation

- Clone the repository:
```bash
git clone https://github.com/0xk3sh4v/http-tunnel
```

- Install dependencies:
```bash
cd http-tunnel/server
npm install
cd ..
pip install -r requirements.txt
```

- Configure the server and client addresses in `server/proxyconfig.json` and `client/clientconfig.json` respectively. Make sure to put the right address for the public endpoint and the private endpoint.

- Run the public WebSocket + HTTP server on the public endpoint:
```bash
// Run only on a machine with a publicly accessible port (e.g., cloud server or forwarded port)
node proxy.js
```

- Start the Python client on the machine that you have an application running on local host:

```bash
# This client will create a tunnel between the public server and your local service
nohup python client.py -o output.out &
```
- **Ensure your local service is running on the configured port (e.g., localhost:5000)**

### Security Considerations

- This project is to NOT be used to host servers like Web RtC or real time connectivity apps due to its unreliablity in providing good speeds due to the response relying on 2 server responses instead of just one.

- Add WSS and SSL certificate for HTTPS support on the Node.js server for encrypted traffic.

- Consider rate limiting and authentication on the **Node JS proxy** to prevent abuse, I have not implemented this because i was already handling the ratelimiting on the localhost app and did not see the need to install another potential firewall

### Future Plans

- ~~Forward the initiator IP address to the localhost for more flexiblity and also to allow other vast project deployments~~
- ~~Add custom error handling and verbose logging.~~
- ~~Add updates for media sharing aswell using binary or changing the encoding~~
- Implement more paths to introduce multiple tunnels. 
- Add better logging for easier breakdown of activity on the proxy.