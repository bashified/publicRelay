const http = require("http");
const WebSocket = require("ws");
const url = require("url");

let clientSocket = null;
const PORT = 4516;

const server = http.createServer(function(req, res) {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === "GET" && parsedUrl.pathname === "/") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Server is up. For issues, contact: contactkeshav@proton.me");
        return;
    }

    let body = "";
    req.on("data", function(chunk) {
        body += chunk;
    });

    req.on("end", function() {
        if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
            const endpoint = parsedUrl.pathname;
            const method = req.method;

            const forwarded = req.headers['x-forwarded-for'];
            const addrIP = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
            const clientIP = addrIP.startsWith("::ffff:") ? addrIP.slice(7) : addrIP;
            // console.log(clientIP); // debug


            const message = method + "||" + endpoint + "||" + clientIP + "||" + body;
            clientSocket.send(message);

            clientSocket.once("message", function(response) {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end(response.toString());
            });
        } else {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Backend has lost connection to the proxy, contact: contactkeshav@proton.me");
        }
    });
});

const wss = new WebSocket.Server({ server });

wss.on("connection", function(ws, req) {
    if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
        console.log("[-] Rejected extra WebSocket connection");
        ws.close(403, "Only one tunnel client allowed");
        return;
    }

    console.log("[+] Tunnel client connected via WebSocket");
    clientSocket = ws;

    ws.on("close", function() {
        console.log("[-] Tunnel client disconnected");
        clientSocket = null;
    });

    ws.on("message", function(msg) {
        console.log("[WS] Message from client:", msg.toString());
    });
});

server.listen(PORT, function() {
    console.log("[+] HTTP + WebSocket server listening on port " + PORT);
});
