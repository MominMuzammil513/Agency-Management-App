// lib/sync-service.ts - Sync offline operations when online
"use client";

import { getOfflineDB } from "./offline-db";
import { toast } from "sonner";

export class SyncService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  async startAutoSync() {
    // Check every 5 seconds if online and sync
    this.syncInterval = setInterval(async () => {
      if (navigator.onLine && !this.isSyncing) {
        await this.sync();
      }
    }, 5000);

    // Also sync immediately when coming online
    window.addEventListener("online", () => {
      this.sync();
    });
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async sync(): Promise<void> {
    if (!navigator.onLine || this.isSyncing) return;

    this.isSyncing = true;
    const db = await getOfflineDB();
    const pendingOps = await db.getPendingOperations();

    if (pendingOps.length === 0) {
      this.isSyncing = false;
      return;
    }

    let synced = 0;
    let failed = 0;

    for (const op of pendingOps) {
      // Skip if too many retries
      if (op.retries >= 5) {
        await db.removeOperation(op.id);
        failed++;
        continue;
      }

      try {
        const response = await fetch(op.url, {
          method: op.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(op.body),
        });

        if (response.ok) {
          await db.removeOperation(op.id);
          synced++;
        } else {
          await db.incrementRetry(op.id);
          failed++;
        }
      } catch (error) {
        await db.incrementRetry(op.id);
        failed++;
      }
    }

    if (synced > 0) {
      toast.success(`${synced} operation(s) synced! 🚀`);
    }

    this.isSyncing = false;
  }

  async queueOperation(method: string, url: string, body: any): Promise<string> {
    const db = await getOfflineDB();
    return await db.queueOperation(method, url, body);
  }
}

// Singleton instance
export const syncService = new SyncService();
