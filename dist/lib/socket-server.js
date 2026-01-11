"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocketServer = initializeSocketServer;
exports.getSocketServer = getSocketServer;
exports.emitToRoom = emitToRoom;
exports.emitToAll = emitToAll;
const socket_io_1 = require("socket.io");
function initializeSocketServer(httpServer) {
    // If already initialized globally, return it
    if (global.io) {
        return global.io;
    }
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: function (origin, callback) {
                var _a;
                // Allow requests with no origin (like mobile apps, curl, etc) or localhost
                if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
                    callback(null, true);
                }
                else {
                    // In production, check against allowed origins
                    const allowedOrigins = ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(",")) || [];
                    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
                        callback(null, true);
                    }
                    else {
                        callback(new Error("Not allowed by CORS"));
                    }
                }
            },
            methods: ["GET", "POST"],
            credentials: true,
        },
        path: "/api/socket",
        transports: ["websocket", "polling"],
        allowEIO3: true,
        pingTimeout: 60000,
        pingInterval: 25000,
    });
    io.on("connection", (socket) => {
        console.log(`✅ Client connected: ${socket.id}`);
        socket.on("join-room", (room) => {
            var _a;
            socket.join(room);
            const roomSize = ((_a = io.sockets.adapter.rooms.get(room)) === null || _a === void 0 ? void 0 : _a.size) || 0;
            console.log(`📦 Socket ${socket.id} joined room: ${room} (Total: ${roomSize})`);
        });
        socket.on("leave-room", (room) => {
            socket.leave(room);
            console.log(`📤 Socket ${socket.id} left room: ${room}`);
        });
        socket.on("disconnect", () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });
    // 🔥 CRITICAL: Attach to Global Scope
    global.io = io;
    return io;
}
// 2. Updated Helper to check Global Scope
function getSocketServer() {
    return global.io || null;
}
function emitToRoom(room, event, data) {
    var _a;
    const io = getSocketServer(); // Get from global
    if (!io) {
        console.error(`❌ Socket.io not found in Global Scope! Cannot emit '${event}'`);
        return;
    }
    try {
        const roomSize = ((_a = io.sockets.adapter.rooms.get(room)) === null || _a === void 0 ? void 0 : _a.size) || 0;
        io.to(room).emit(event, data);
        console.log(`📡 Emitted '${event}' to room '${room}' (${roomSize} clients)`);
    }
    catch (error) {
        console.error(`❌ Error emitting '${event}':`, error);
    }
}
function emitToAll(event, data) {
    const io = getSocketServer();
    if (io) {
        io.emit(event, data);
        console.log(`📡 Emitted '${event}' to all clients`);
    }
}
