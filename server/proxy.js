const http = require("http");
const WebSocket = require("ws");
const url = require("url");
const configs = require("./proxyconfig.json");

let clientSocket = null;

const rateMap = new Map(); // ip -> { count, last }

const MAX_REQ = configs.maxreq
const WINDOW_MS = configs.windowms

function rateLimited(ip) {
    const now = Date.now();
    let entry = rateMap.get(ip);

    if (!entry) {
        entry = { count: 1, last: now };
        rateMap.set(ip, entry);
        return false;
    }

    if (now - entry.last > WINDOW_MS) {
        entry.count = 1;
        entry.last = now;
        return false;
    }

    entry.count++;

    if (entry.count > MAX_REQ) return true;
    return false;
}

const server = http.createServer(function (req, res) {

    const ip = req.socket.remoteAddress || "unknown";
    if (rateLimited(ip)) {
        res.writeHead(429, { "Content-Type": "text/plain" });
        res.end("Too many requests, rate limited by the proxy.");
        return;
    }

    req.setTimeout(10000, () => {
        res.setHeader("Content-Type", "text/plain");
        res.send("Timeout: Request took too long to process.");
        req.destroy();
    });

    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    if (method === "OPTIONS") {
        res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
            "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
        });
        res.end();
        return;
    }

    if (parsedUrl.pathname === "/") {
        if (clientSocket != null){
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("Layer4 active with the client, this tunnel is open source here: https://github.com/bashified/publicRelay");
            return;
        }
    }

    let body = "";
    let chunks = [];

    const ct = req.headers["content-type"] || "";

    req.on("data", function (chunk) {
        if (Number(chunk.length) > 200000000) {
            res.writeHead(413, { "Content-Type": "text/plain" });
            res.end("Payload too large, denied by proxy.");
            return;
        }

        if (ct.startsWith("text/") || ct.includes("json")) {
            body += chunk;
        } else {
            chunks.push(chunk);
        }
    });

    req.on("end", function () {
        let finalBody = body;
        let isBinary = false;

        if (!ct.startsWith("text/") && !ct.includes("json")) {
            finalBody = Buffer.concat(chunks);
            isBinary = true;
        }

        if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {

            const fullRequest = {
                method: req.method,
                url: req.url,
                httpVersion: req.httpVersion,
                headers: req.headers,
                remoteAddress: req.socket.remoteAddress,
                body: isBinary ? finalBody.toString("base64") : finalBody,
                isBinary: isBinary
            };

            clientSocket.send(JSON.stringify(fullRequest));

            clientSocket.once("message", function (response) {
                try {
                    const parsed = JSON.parse(response.toString());

                    if (parsed.isBinary) {
                        const buffer = Buffer.from(parsed.body, "base64");

                        res.writeHead(parsed.status || 200, {
                            ...parsed.headers,
                            "Access-Control-Allow-Origin": "*",
                        });

                        res.end(buffer);
                    } else {
                        res.writeHead(parsed.status || 200, {
                            "Content-Type": parsed.headers["content-type"] || "application/json",
                            "Access-Control-Allow-Origin": "*",
                        });

                        res.end(parsed.body);
                    }
                } catch (e) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Error while parsing the response from the backend. Debug: ", e);
                }
            });

        } else {
            res.writeHead(502, {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
            });

            res.end("Proxy client has lost connection.");
        }
    });
});

const ws = new WebSocket.Server({ server });

ws.on('connection', function connection(client) {

    console.log('New WebSocket connection established.');
    clientSocket = client;

    client.on('message', function incoming(message) {
        console.log('Proxy Client Response: ', message);
    });

    client.on('close', () => {
        console.log('Proxy Client Disconnected');
        clientSocket = null;
    });

});

server.listen(configs.port, function () {
    console.log("[+] Server Online, Websocket + API");
});
