import Dexie, { Table } from "dexie";

// Define types
export interface PendingOrder {
  id?: number; // Auto-increment
  shopId: string;
  items: { productId: string; quantity: number }[];
  totalAmount: number;
  timestamp: number;
}

class OfflineDatabase extends Dexie {
  pendingOrders!: Table<PendingOrder>;

  constructor() {
    super("SalesAppDB");
    this.version(1).stores({
      pendingOrders: "++id, shopId, timestamp", // Schema
    });
  }
}

export const db = new OfflineDatabase();
