// components/RealtimeProvider.tsx - Initialize real-time sync and offline sync
"use client";

import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { syncService } from "@/lib/sync-service";
import { useRealtime } from "@/hooks/use-realtime";
import { useRouter } from "next/navigation";
import { toastManager } from "@/lib/toast-manager";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();

  // Initialize auto-sync
  useEffect(() => {
    syncService.startAutoSync();
    return () => {
      syncService.stopAutoSync();
    };
  }, []);

  // Real-time event handler (memoized to prevent reconnections)
  const handleRealtimeEvent = useCallback((event: { type: string; data?: any }) => {
    switch (event.type) {
      case "order:created":
        toastManager.success("New order received! 📦");
        router.refresh();
        break;
      case "order:status-updated":
        toastManager.info("Order status updated");
        router.refresh();
        break;
      case "order:deleted":
        toastManager.info("Order deleted");
        router.refresh();
        break;
      case "stock:updated":
        router.refresh();
        break;
      case "shop:created":
      case "shop:updated":
      case "shop:deleted":
        router.refresh();
        break;
      case "area:created":
      case "area:updated":
      case "area:deleted":
        router.refresh();
        break;
      case "product:created":
      case "product:updated":
      case "product:deleted":
        router.refresh();
        break;
      case "category:created":
      case "category:updated":
      case "category:deleted":
        router.refresh();
        break;
      case "staff:created":
      case "staff:updated":
      case "staff:deleted":
      case "staff:status-updated":
        router.refresh();
        break;
    }
  }, [router]);

  // Subscribe to real-time updates
  useRealtime(handleRealtimeEvent, !!session?.user);

  return <>{children}</>;
}
