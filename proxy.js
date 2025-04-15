const http = require("http");
const WebSocket = require("ws");
const url = require("url");

let clientSocket = null;
const PORT = 9516;

const server = http.createServer(function (req, res) {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    if (method === "OPTIONS") {
        // ✅ Proper CORS headers for preflight request
        res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
        });
        res.end();
        return;
    }

    if (method === "GET" && parsedUrl.pathname === "/") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Server is up. For issues, contact: contactkeshav@proton.me");
        return;
    }

    let body = "";
    req.on("data", function (chunk) {
        body += chunk;
    });

    req.on("end", function () {
        if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
            const endpoint = parsedUrl.pathname;

            const forwarded = req.headers["x-forwarded-for"];
            const addrIP = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
            const clientIP = addrIP.startsWith("::ffff:") ? addrIP.slice(7) : addrIP;

            const message = method + "||" + endpoint + "||" + clientIP + "||" + body;
            clientSocket.send(message);

            clientSocket.once("message", function (response) {
                res.writeHead(200, {
                    "Content-Type": "text/plain",
                    "Access-Control-Allow-Origin": "*",
                });
                res.end(response.toString());
            });
        } else {
            res.writeHead(500, {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
            });
            res.end("Backend has lost connection to the proxy, contact: contactkeshav@proton.me");
        }
    });
});

const ws = new WebSocket.Server({ server });

ws.on('connection', function connection(client) {
    client.on('message', function incoming(msg) {
      // Not needed for incoming messages here
    });
  
    server.on('request', (req, res) => {
      const { method, url, headers, connection } = req;
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', () => {
        const ip = connection.remoteAddress;
  
        const payload = JSON.stringify({
          method,
          path: url,
          ip,
          headers,
          body
        });
  
        client.send(payload);
  
        client.once('message', response => {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(response);
        });
      });
    });
  });

server.listen(PORT, function () {
    console.log("[+] HTTP + WebSocket server listening on port " + PORT);
});
