import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// 1. Declare the global type so TypeScript knows about 'global.io'
declare global {
  var io: SocketIOServer | undefined;
}

export function initializeSocketServer(httpServer: HTTPServer) {
  // If already initialized globally, return it
  if (global.io) {
    return global.io;
  }

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc) or localhost
        if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
          callback(null, true);
        } else {
          // In production, check against allowed origins
          const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
          if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
            callback(null, true);
          } else {
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

    socket.on("join-room", (room: string) => {
      socket.join(room);
      const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
      console.log(`📦 Socket ${socket.id} joined room: ${room} (Total: ${roomSize})`);
    });

    socket.on("leave-room", (room: string) => {
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
export function getSocketServer(): SocketIOServer | null {
  return global.io || null;
}

export function emitToRoom(room: string, event: string, data: any) {
  const io = getSocketServer(); // Get from global

  if (!io) {
    console.error(`❌ Socket.io not found in Global Scope! Cannot emit '${event}'`);
    return;
  }
  
  try {
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
    io.to(room).emit(event, data);
    console.log(`📡 Emitted '${event}' to room '${room}' (${roomSize} clients)`);
  } catch (error) {
    console.error(`❌ Error emitting '${event}':`, error);
  }
}

export function emitToAll(event: string, data: any) {
  const io = getSocketServer();
  if (io) {
    io.emit(event, data);
    console.log(`📡 Emitted '${event}' to all clients`);
  }
}