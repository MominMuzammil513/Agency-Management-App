// lib/socket-client.tsx - Socket.io Client Context
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Socket.io client - use current origin in browser
    const socketUrl = typeof window !== "undefined" 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
    
    const socketInstance = io(socketUrl, {
      path: "/api/socket",
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      forceNew: false,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket.io connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket.io disconnected:", reason);
      setIsConnected(false);
      // Auto-reconnect is handled by socket.io
      if (reason === "io server disconnect") {
        // Server disconnected, manually reconnect
        socketInstance.connect();
      }
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket.io connection error:", error.message);
      setIsConnected(false);
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Socket.io reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
    });

    socketInstance.on("reconnect_attempt", () => {
      console.log("🔄 Attempting to reconnect...");
    });

    socketInstance.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error);
    });

    socketInstance.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed - manual intervention needed");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.removeAllListeners();
      socketInstance.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
}
