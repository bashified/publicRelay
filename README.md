# Reverse Proxy - Expose Localhost to Public Network

## Overview

This project is a reverse proxy solution designed to expose your local server to the public network. Built with Node.js and Python, it combines WebSockets (`ws`), HTTP, and Flask to create a bridge between your local environment and the outside world. Whether you're working on local development or need quick access to private servers, this reverse proxy solution ensures your applications are accessible remotely.

## Features

- **Localhost Exposure**: Exposes local services to the internet.
- **WebSocket Support**: Real-time communication between client and server.
- **Flask Integration**: Python Flask-based API for managing reverse proxy functionality.
- **Node.js**: Handles WebSocket and HTTP requests for seamless communication.

## Key Benefits

- **Access Control**: No need for complex configurations—simply expose a service with minimal setup.
- **Security**: Build on top of Node.js and Flask to easily implement SSL or other security protocols.
- **Cross-Language Integration**: Combines both Node.js and Python to give flexibility in use.

## How It Works

The reverse proxy listens for incoming requests and forwards them to your local services running on a private network or development environment. It uses WebSockets for low-latency connections, while HTTP manages standard requests. Flask provides an API to handle routing, making this a versatile solution for local and public network communication.

## Getting Started

### Prerequisites

- Node.js (for WebSocket functionality)
- Python (for Flask API)
- WebSocket library (`ws`) and Flask module
- Basic knowledge of reverse proxy concepts

### Installation

1. Clone the repository:
```bash
git clone https://github.com/0xk3sh4v/reverse-proxy.git
```

2. Install dependencies:

```md
cd reverse-proxy/node
npm install
cd reverse-proxy/python
pip install -r requirements.txt
```

3. Run the proxy:
```js
// before you start this, make sure to configure the addreess and everything inside the file.
// Also make sure to only run this on the server which has a forwarded port.
node proxy.js
// note down the address:port of the proxy server
```
4. Start the Flask API client:
```py
# For this, paste the address of the above websocket server
# that way, it can send and recv data with the server without configuring your local network
# before running the client, make sure to configure the port on the localhost that you want to forward
nohup python client.py -o output.out
```

5. Run an API on localhost:<port> where the port should be the same as the one you setup in `client.py`


## Security Considerations
- SSL/TLS support for encrypted traffic. All of this depends upon the proxy.

- Rate-limiting and authentication mechanisms should be added for additional security.

- Always monitor the traffic for potential abuse or misuse.

## What's next?
- Implement custom error handling and logging for better debugging.
- Add more advanced configuration options, such as dynamic routing.
- Extend the project to support load balancing or multiple upstream servers.