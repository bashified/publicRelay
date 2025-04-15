const http = require("http");
const WebSocket = require("ws");
const url = require("url");

let clientSocket = null;
const PORT = 9516;

const server = http.createServer(function (req, res) {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // HANDLING CORS
    if (method === "OPTIONS") {
        res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
            "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
        });
        res.end();
        return;
    }

    // HANDLING REQUESTS ON THE HOME PAGE
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
            
            // FETCH DATA TO SEND TO CLIENT

            const endpoint = parsedUrl.pathname;
            const useragent = req.headers["user-agent"] || "UNKNOWN";
            const forwarded = req.headers["x-forwarded-for"];
            const addrIP = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;  // condition ? T : F
            const clientIP = addrIP.startsWith("::ffff:") ? addrIP.slice(7) : addrIP; // strip the ip

            // payload
            const payload = JSON.stringify({
                method: method,
                endpoint: endpoint,
                userAgent: useragent,
                clientIP: clientIP,
                body: body,
                headers: req.headers
            });

            clientSocket.send(payload);

            // sending back to the initial request initiator (aka my website or some retard)
            clientSocket.once("message", function (response) {
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                });
                res.end(response.toString());
            });

        } else {
            res.writeHead(500, {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
            });
            res.end("Our backend seems offline, contact: contactkeshav@proton.me");
        }
    });
});

const ws = new WebSocket.Server({ server });
ws.on('connection', function connection(client) {

    console.log('New WebSocket connection established.');
    clientSocket = client;

    client.on('message', function incoming(message) {
        console.log('Websock Client Message: ', message);
    });

    client.on('close', () => {
        console.log('WebSocket connection closed.');
        clientSocket = null;
    });

});

server.listen(PORT, function () {
    console.log("[+] HTTP + WebSocket server listening on port " + PORT);
});const http = require("http");
const WebSocket = require("ws");
const url = require("url");

let clientSocket = null;
const PORT = 9516;

const server = http.createServer(function (req, res) {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // HANDLING CORS
    if (method === "OPTIONS") {
        res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
            "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
        });
        res.end();
        return;
    }

    // HANDLING REQUESTS ON THE HOME PAGE
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
            
            // FETCH DATA TO SEND TO CLIENT

            const endpoint = parsedUrl.pathname;
            const useragent = req.headers["user-agent"] || "UNKNOWN";
            const forwarded = req.headers["x-forwarded-for"];
            const addrIP = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;  // condition ? T : F
            const clientIP = addrIP.startsWith("::ffff:") ? addrIP.slice(7) : addrIP; // strip the ip

            // payload
            const payload = JSON.stringify({
                method: method,
                endpoint: endpoint,
                userAgent: useragent,
                clientIP: clientIP,
                body: body,
                headers: req.headers
            });

            clientSocket.send(payload);

            // sending back to the initial request initiator (aka my website or some retard)
            clientSocket.once("message", function (response) {
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                });
                res.end(response.toString());
            });

        } else {
            res.writeHead(500, {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
            });
            res.end("Our backend seems offline, contact: contactkeshav@proton.me");
        }
    });
});

const ws = new WebSocket.Server({ server });
ws.on('connection', function connection(client) {

    console.log('New WebSocket connection established.');
    clientSocket = client;

    client.on('message', function incoming(message) {
        console.log('Websock Client Message: ', message);
    });

    client.on('close', () => {
        console.log('WebSocket connection closed.');
        clientSocket = null;
    });

});

server.listen(PORT, function () {
    console.log("[+] HTTP + WebSocket server listening on port " + PORT);
});
