# HTTP Tunnel – Expose Localhost to Public Network


### Overview

This project is an HTTP tunneling solution designed to expose your local server to the public internet. Built using Node.js and Python, it leverages WebSockets (ws), HTTP, and Flask to create a secure tunnel between your local environment and a publicly accessible endpoint. This makes it perfect for local development, remote testing, or quickly sharing your service without port forwarding.

### Features

- Expose Localhost: Tunnel your local services to a public endpoint.
- WebSocket-Based Tunneling: Uses WebSockets for bi-directional real-time communication between client and server.
- Flask API Client: Lightweight Python-based client to forward HTTP traffic from tunnel to local server.
- Node.js Server: Public-facing WebSocket + HTTP listener that relays traffic to the local machine.

### Key Benefits

- No Port Forwarding Needed: Tunnel requests without modifying your router.
- Secure Communication: Easily integrate TLS and other security protocols on the server side.
- Cross-Platform Integration: Works across Node.js and Python, giving you flexibility.

### How It Works

The system sets up a tunnel where:

- The Node.js server listens for HTTP requests and forwards them via WebSocket to a connected Python Flask client running on your local machine.
- The client receives the forwarded requests, processes them locally, and sends back the responses via WebSocket.
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
git clone https://github.com/0xk3sh4v/http-tunnel.git
```

- Install dependencies:
```bash
cd http-tunnel/node
npm install
cd ../python
pip install -r requirements.txt
```
- Run the public WebSocket + HTTP server:
```
// Configure the host, port, and tunnel settings inside proxy.js
// Run only on a machine with a publicly accessible port (e.g., cloud server or forwarded port)
node proxy.js
// Note the public address:port of this server
```

- Start the Python client:

```
# Provide the WebSocket server address from the step above
# This client will create a tunnel between the public server and your local service
# Make sure to set the correct local port (your actual API or service port) in client.py
nohup python client.py -o output.out &
```
- **Ensure your local service is running on the configured port (e.g., localhost:5000)**

### Security Considerations

- This project is to NOT be used to host servers like Web RtC or real time connectivity apps due to its unreliablity in providing good speeds.

- Add SSL/TLS support on the Node.js server for encrypted traffic.

- Consider rate limiting and authentication on the **Node JS proxy** to prevent abuse. 

- Log and monitor tunnel activity to detect anomalies or misuse.

### Future Plans

- ~~Forward the initiator IP address to the localhost for more flexiblity and also to allow other vast project deployments~~
- ~~Add custom error handling and verbose logging.~~
- Implement dynamic routing to support multiple tunnels.- 
- Add support for load balancing and multiple client connections.