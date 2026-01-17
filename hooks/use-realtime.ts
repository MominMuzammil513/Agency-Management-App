// hooks/use-realtime.ts - Hook for Server-Sent Events
"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

export interface RealtimeEvent {
  type: string;
  data?: any;
  message?: string;
}

export function useRealtime(
  onEvent: (event: RealtimeEvent) => void,
  enabled: boolean = true
) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);

  // Update callback ref without causing reconnection
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled || !session?.user) {
      // Close connection if disabled or no session
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // For super_admin, realtime might not be needed, but we'll allow connection
    // For other roles, agencyId is required
    if (session.user.role !== "super_admin" && !session.user.agencyId) {
      // Skip realtime connection if no agencyId (except for super_admin)
      return;
    }

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Create SSE connection - Use absolute URL for network access
    const apiUrl = typeof window !== "undefined" 
      ? `${window.location.origin}/api/realtime`
      : "/api/realtime";
    const eventSource = new EventSource(apiUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("✅ Real-time sync connected");
    };

    eventSource.onmessage = (e) => {
      try {
        const event: RealtimeEvent = JSON.parse(e.data);
        
        // Ignore heartbeat
        if (event.type === "heartbeat") return;

        if (event.type === "connected") {
          console.log("✅ Real-time sync connected");
        } else {
          // Use ref to call latest callback
          onEventRef.current(event);
        }
      } catch (err) {
        console.error("Error parsing SSE event:", err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      setIsConnected(false);
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [enabled, session?.user?.id]); // Only depend on session user ID, not the callback

  return { isConnected };
}
