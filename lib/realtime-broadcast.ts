// lib/realtime-broadcast.ts - Helper to broadcast SSE events
import { connections } from "@/lib/realtime-connections";
import { db } from "@/db/db";
import { areas } from "@/db/schemas";
import { eq } from "drizzle-orm";

// Broadcast to all connections in an agency
export async function broadcastToAgency(agencyId: string, event: string, data: any) {
  const agencyConnections: ReadableStreamDefaultController[] = [];
  
  // Find all connections for this agency
  for (const [key, controllers] of connections.entries()) {
    if (key.startsWith(`${agencyId}:`)) {
      agencyConnections.push(...controllers);
    }
  }

  if (agencyConnections.length === 0) {
    // No connections - this is normal, just means no clients are connected
    if (process.env.NODE_ENV === "development") {
      console.log(`[SSE] No connections for agency ${agencyId}, skipping broadcast "${event}"`);
    }
    return;
  }

  const message = `data: ${JSON.stringify({ type: event, data })}\n\n`;
  const encoded = new TextEncoder().encode(message);

  let sentCount = 0;
  for (const controller of agencyConnections) {
    try {
      controller.enqueue(encoded);
      sentCount++;
    } catch (e) {
      // Connection closed, will be cleaned up on next heartbeat
      if (process.env.NODE_ENV === "development") {
        console.error(`[SSE] Failed to send to connection:`, e);
      }
    }
  }
  
  if (process.env.NODE_ENV === "development") {
    console.log(`[SSE] Broadcast "${event}" to ${sentCount}/${agencyConnections.length} connections for agency ${agencyId}`);
  }
}

// Broadcast to all connections in an area's agency
export async function broadcastToArea(areaId: string, event: string, data: any) {
  try {
    // Get area's agency
    const areaData = await db
      .select({ agencyId: areas.agencyId })
      .from(areas)
      .where(eq(areas.id, areaId))
      .limit(1);

    if (areaData.length > 0) {
      await broadcastToAgency(areaData[0].agencyId, event, data);
    }
  } catch (error) {
    console.error("Error broadcasting to area:", error);
  }
}

export async function broadcastOrderCreated(agencyId: string, orderData: any) {
  await broadcastToAgency(agencyId, "order:created", orderData);
}

export async function broadcastOrderUpdated(agencyId: string, orderData: any) {
  await broadcastToAgency(agencyId, "order:status-updated", orderData);
}

export async function broadcastOrderDeleted(agencyId: string, orderId: string) {
  await broadcastToAgency(agencyId, "order:deleted", { orderId });
}

export async function broadcastStockUpdated(agencyId: string, stockData: any) {
  await broadcastToAgency(agencyId, "stock:updated", stockData);
}

export async function broadcastShopCreated(areaId: string, shopData: any) {
  await broadcastToArea(areaId, "shop:created", shopData);
}

export async function broadcastShopUpdated(areaId: string, shopData: any) {
  await broadcastToArea(areaId, "shop:updated", shopData);
}

export async function broadcastShopDeleted(areaId: string, shopId: string) {
  await broadcastToArea(areaId, "shop:deleted", { shopId });
}

export async function broadcastAreaCreated(agencyId: string, areaData: any) {
  await broadcastToAgency(agencyId, "area:created", areaData);
}

export async function broadcastAreaUpdated(agencyId: string, areaData: any) {
  await broadcastToAgency(agencyId, "area:updated", areaData);
}

export async function broadcastAreaDeleted(agencyId: string, areaId: string) {
  await broadcastToAgency(agencyId, "area:deleted", { areaId });
}

export async function broadcastProductCreated(agencyId: string, productData: any) {
  await broadcastToAgency(agencyId, "product:created", productData);
}

export async function broadcastProductUpdated(agencyId: string, productData: any) {
  await broadcastToAgency(agencyId, "product:updated", productData);
}

export async function broadcastProductDeleted(agencyId: string, productId: string) {
  await broadcastToAgency(agencyId, "product:deleted", { productId });
}

export async function broadcastCategoryCreated(agencyId: string, categoryData: any) {
  await broadcastToAgency(agencyId, "category:created", categoryData);
}

export async function broadcastCategoryUpdated(agencyId: string, categoryData: any) {
  await broadcastToAgency(agencyId, "category:updated", categoryData);
}

export async function broadcastCategoryDeleted(agencyId: string, categoryId: string) {
  await broadcastToAgency(agencyId, "category:deleted", { categoryId });
}

export async function broadcastStaffCreated(agencyId: string, staffData: any) {
  await broadcastToAgency(agencyId, "staff:created", staffData);
}

export async function broadcastStaffUpdated(agencyId: string, staffData: any) {
  await broadcastToAgency(agencyId, "staff:updated", staffData);
}

export async function broadcastStaffDeleted(agencyId: string, staffId: string) {
  await broadcastToAgency(agencyId, "staff:deleted", { staffId });
}

export async function broadcastStaffStatusUpdated(agencyId: string, statusData: any) {
  await broadcastToAgency(agencyId, "staff:status-updated", statusData);
}
