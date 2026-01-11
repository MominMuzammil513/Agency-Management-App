// app/api/realtime/route.ts - Server-Sent Events for Real-Time Updates
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connections } from "@/lib/realtime-connections";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.agencyId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const agencyId = session.user.agencyId;
  const userId = session.user.id;

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: "connected", message: "Real-time sync active" })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));

      // Store connection (use agencyId only to support multiple tabs/users per agency)
      // Format: agencyId:userId to allow multiple connections per user
      const key = `${agencyId}:${userId}`;
      if (!connections.has(key)) {
        connections.set(key, []);
      }
      connections.get(key)!.push(controller);
      
      if (process.env.NODE_ENV === "development") {
        const totalConnections = Array.from(connections.values()).reduce((sum, arr) => sum + arr.length, 0);
        console.log(`[SSE] Client connected: ${key} (Total: ${totalConnections} connections across ${connections.size} users)`);
      }

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          const heartbeatData = `data: ${JSON.stringify({ type: "heartbeat" })}\n\n`;
          controller.enqueue(new TextEncoder().encode(heartbeatData));
        } catch (e) {
          clearInterval(heartbeat);
        }
      }, 30000); // Every 30 seconds

      // Cleanup on close
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        const conns = connections.get(key);
        if (conns) {
          const index = conns.indexOf(controller);
          if (index > -1) {
            conns.splice(index, 1);
          }
          if (conns.length === 0) {
            connections.delete(key);
          }
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

