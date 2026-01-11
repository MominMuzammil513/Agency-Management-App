"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts - Custom Next.js Server with Socket.io
const http_1 = require("http");
const url_1 = require("url");
const next_1 = __importDefault(require("next"));
const socket_server_1 = require("./lib/socket-server");
const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = (0, next_1.default)({ dev, hostname, port });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const httpServer = (0, http_1.createServer)(async (req, res) => {
        try {
            const parsedUrl = (0, url_1.parse)(req.url, true);
            await handle(req, res, parsedUrl);
        }
        catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    });
    // Initialize Socket.io server
    (0, socket_server_1.initializeSocketServer)(httpServer);
    httpServer
        .once("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.error(`Port ${port} is already in use.`);
            process.exit(1);
        }
    })
        .listen(port, () => {
        console.log(`> 🚀 Ready on http://${hostname}:${port}`);
        console.log(`> 📡 Socket.io server initialized`);
    });
});
