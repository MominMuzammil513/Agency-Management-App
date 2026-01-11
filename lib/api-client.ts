// lib/api-client.ts - Offline-first API client
"use client";

import { syncService } from "./sync-service";
import { getOfflineDB } from "./offline-db";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export class ApiClient {
  async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const method = options.method || "GET";
    const body = options.body;

    // If online, try direct request
    if (navigator.onLine) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
        });

        const data = await response.json();

        if (response.ok) {
          return { success: true, data };
        } else {
          // If failed and it's a write operation, queue it
          if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
            await syncService.queueOperation(method, url, body ? JSON.parse(body as string) : {});
            return {
              success: false,
              message: "Request failed. Queued for sync when online.",
            };
          }
          return { success: false, message: data.message || "Request failed" };
        }
      } catch (error) {
        // Network error - queue if write operation
        if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
          await syncService.queueOperation(method, url, body ? JSON.parse(body as string) : {});
          return {
            success: false,
            message: "Network error. Queued for sync when online.",
          };
        }
        return { success: false, message: "Network error" };
      }
    } else {
      // Offline - queue write operations
      if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        await syncService.queueOperation(method, url, body ? JSON.parse(body as string) : {});
        return {
          success: false,
          message: "Offline. Operation queued for sync.",
        };
      } else {
        // Read operations - try cache
        const db = await getOfflineDB();
        const cacheKey = url.split("/").pop() || "";
        const cached = await db.getCachedData("cache", cacheKey);
        if (cached) {
          return { success: true, data: cached };
        }
        return { success: false, message: "Offline and no cached data" };
      }
    }
  }

  async get<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: "GET" });
  }

  async post<T = any>(url: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(url: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch<T = any>(url: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
