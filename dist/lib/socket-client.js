"use strict";
// lib/socket-client.tsx - Socket.io Client Context
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketProvider = SocketProvider;
exports.useSocket = useSocket;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const socket_io_client_1 = require("socket.io-client");
const SocketContext = (0, react_1.createContext)({
    socket: null,
    isConnected: false,
});
function SocketProvider({ children }) {
    const [socket, setSocket] = (0, react_1.useState)(null);
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Initialize Socket.io client - use current origin in browser
        const socketUrl = typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
        const socketInstance = (0, socket_io_client_1.io)(socketUrl, {
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
    return ((0, jsx_runtime_1.jsx)(SocketContext.Provider, { value: { socket, isConnected }, children: children }));
}
function useSocket() {
    const context = (0, react_1.useContext)(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within SocketProvider");
    }
    return context;
}
