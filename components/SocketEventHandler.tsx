"use client";

import { useEffect } from "react";
import { useSocket } from "@/lib/socket-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SocketEventHandler() {
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Helper to handle updates
    const handleUpdate = (message: string) => {
      console.log(`⚡ Socket Event: ${message}`);
      // 1. Toast Notification dikhao
      toast.info(message, {
        position: "top-right",
        duration: 4000,
        icon: "⚡",
      });
      // 2. Data Refresh karo (Magic Line 🪄)
      router.refresh();
    };

    // --- 📦 ORDERS ---
    const onOrderCreated = (data: any) => handleUpdate(`New Order Received! (#${data.orderId.slice(0, 5)})`);
    const onOrderStatus = (data: any) => handleUpdate(`Order Status Updated: ${data.status}`);
    const onOrderDeleted = () => handleUpdate("An Order was deleted");

    // --- 📉 STOCK ---
    const onStockUpdated = (data: any) => {
        // Sirf generic msg mat dikhao, action batao
        const action = data.action === 'add' ? 'Added' : data.action === 'deduct' ? 'Deducted' : 'Updated';
        handleUpdate(`Stock ${action} Successfully`);
    };

    // --- 🏪 SHOPS ---
    const onShopCreated = (data: any) => handleUpdate(`New Shop: ${data.name}`);
    const onShopUpdated = (data: any) => handleUpdate(`Shop Updated: ${data.name}`);

    // --- 📦 PRODUCTS/CATEGORIES ---
    const onProductUpdate = () => handleUpdate("Inventory Updated");
    
    // Listeners Attach karo
    socket.on("order:created", onOrderCreated);
    socket.on("order:status-updated", onOrderStatus);
    socket.on("order:deleted", onOrderDeleted);
    
    socket.on("stock:updated", onStockUpdated);
    
    socket.on("shop:created", onShopCreated);
    socket.on("shop:updated", onShopUpdated);
    
    socket.on("product:created", onProductUpdate);
    socket.on("product:updated", onProductUpdate);

    // Cleanup (Jab component hatega to listeners bhi hata do)
    return () => {
      socket.off("order:created", onOrderCreated);
      socket.off("order:status-updated", onOrderStatus);
      socket.off("order:deleted", onOrderDeleted);
      socket.off("stock:updated", onStockUpdated);
      socket.off("shop:created", onShopCreated);
      socket.off("shop:updated", onShopUpdated);
      socket.off("product:created", onProductUpdate);
      socket.off("product:updated", onProductUpdate);
    };
  }, [socket, isConnected, router]);

  return null; // UI pe kuch nahi dikhana
}