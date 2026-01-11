// lib/toast-manager.ts - Prevent duplicate toast messages
import { toast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";
type ToastKey = string;

class ToastManager {
  private activeToasts = new Map<ToastKey, number>();
  private readonly DEBOUNCE_MS = 2000; // 2 seconds debounce

  private getKey(type: ToastType, message: string): ToastKey {
    return `${type}:${message}`;
  }

  show(type: ToastType, message: string, options?: { duration?: number }) {
    const key = this.getKey(type, message);
    const now = Date.now();
    const lastShown = this.activeToasts.get(key);

    // If shown recently, skip
    if (lastShown && now - lastShown < this.DEBOUNCE_MS) {
      return;
    }

    // Mark as shown
    this.activeToasts.set(key, now);

    // Show toast
    toast[type](message, {
      duration: options?.duration || 4000,
      id: key, // Use same ID to replace if called again
    });

    // Cleanup after debounce period
    setTimeout(() => {
      this.activeToasts.delete(key);
    }, this.DEBOUNCE_MS);
  }

  success(message: string, options?: { duration?: number }) {
    this.show("success", message, options);
  }

  error(message: string, options?: { duration?: number }) {
    this.show("error", message, options);
  }

  info(message: string, options?: { duration?: number }) {
    this.show("info", message, options);
  }

  warning(message: string, options?: { duration?: number }) {
    this.show("warning", message, options);
  }
}

export const toastManager = new ToastManager();
