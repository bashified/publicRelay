const http = require("http");
const WebSocket = require("ws");
const url = require("url");
const configs = require("./proxyconfig.json");

let clientSocket = null;

const server = http.createServer(function (req, res) {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // HANDLING CORS // uncommented this for needs
        
    if (method === "OPTIONS") {
        res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
            "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
        });
        res.end();
        return;
    }

    // home page
    if (parsedUrl.pathname === "/") {
        
        if (clientSocket != null){
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("Layer4 active with the client, this tunnel is open source here: https://github.com/bashified/publicRelay");
            return;
        }
    
    }

    let body = "";

    // Binary chunks for incoming media, might find a way to decode and encode this in some later updates but for now this works
    let chunks = [];  

    req.on("data", function (chunk) {
        
        // Handle suspicious connections

        if (Number(chunk.length) > 200000000) {   // 200MB limit for now, can be adjusted later i found this to be the most suitable for my use case
            res.writeHead(413, { "Content-Type": "text/plain" });
            res.end("Payload too large, denied by proxy.");
            return;
        }

        const ct = req.headers["content-type"] || "";
        
        if (ct.startsWith("text/") || ct.includes("json")) {    // for now, we are only taking care of json and text and media files.
            body += chunk;
        } 

        else {
            chunks.push(chunk);
        }
    });

    req.on("end", function () {
        let finalBody = body;
        let isBinary = false;

        // Merge the binary chunks

        if (!(req.headers["content-type"] && req.headers["content-type"].startsWith("text/"))) {
            finalBody = Buffer.concat(chunks);
            isBinary = true;
        }

        if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {

            // FETCH DATA TO SEND TO CLIENT
            // Instead of manually extracting parts unlike my previous version, send the entire request object

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

            // sending back the response

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
                    } 
                    
                    else {
                    
                        res.writeHead(parsed.status || 200, {
                            "Content-Type": parsed.headers["content-type"] || "application/json",
                            "Access-Control-Allow-Origin": "*",
                        });
                    
                        res.end(parsed.body);
                    }
                } 
                
                catch (e) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Error while parsing the response from the backend. Debug: ", e);
                }
            });

        } 
        
        else {
        
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