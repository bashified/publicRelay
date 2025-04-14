const http = require("http");
const WebSocket = require("ws");
const url = require("url");

let clientSocket = null;
const PORT = 9516;

const server = http.createServer(function (req, res) {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const endpoint = parsedUrl.pathname + (parsedUrl.search || "");

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
            const forwarded = req.headers["x-forwarded-for"];
            const addrIP = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
            const clientIP = addrIP.startsWith("::ffff:") ? addrIP.slice(7) : addrIP;

            const message = method + "||" + endpoint + "||" + clientIP + "||" + (body || "");
            console.log("[Proxy -> Client] " + message);

            clientSocket.send(message);

            clientSocket.once("message", function (response) {
                try {
                    const parsed = JSON.parse(response);
                    res.writeHead(parsed.status, parsed.headers);
                    res.end(parsed.body);
                } catch (e) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Invalid JSON from tunnel client.");
                }
            });
        } else {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Backend has lost connection to the proxy, contact: contactkeshav@proton.me");
        }
    });
});

const wss = new WebSocket.Server({ server });

wss.on("connection", function (ws, req) {
    if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
        console.log("[-] Rejected extra WebSocket connection");
        ws.close(403, "Only one tunnel client allowed");
        return;
    }

    console.log("[+] Tunnel client connected via WebSocket");
    clientSocket = ws;

    ws.on("close", function () {
        console.log("[-] Tunnel client disconnected");
        clientSocket = null;
    });

    ws.on("message", function (msg) {
        console.log("[WS] Message from client:", msg.toString());
    });
});

server.listen(PORT, function () {
    console.log("[+] HTTP + WebSocket proxy listening on port " + PORT);
});
