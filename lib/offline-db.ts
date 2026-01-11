// lib/offline-db.ts - IndexedDB for Offline-First Functionality
"use client";

interface PendingOperation {
  id: string;
  method: string;
  url: string;
  body: any;
  timestamp: number;
  retries: number;
}

class OfflineDatabase {
  private dbName = "AgencyAppDB";
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Pending operations queue
        if (!db.objectStoreNames.contains("pendingOps")) {
          const opsStore = db.createObjectStore("pendingOps", { keyPath: "id" });
          opsStore.createIndex("timestamp", "timestamp", { unique: false });
        }

        // Local cache stores
        if (!db.objectStoreNames.contains("orders")) {
          db.createObjectStore("orders", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("shops")) {
          db.createObjectStore("shops", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("areas")) {
          db.createObjectStore("areas", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("stock")) {
          db.createObjectStore("stock", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("products")) {
          db.createObjectStore("products", { keyPath: "id" });
        }
      };
    });
  }

  // Queue operations for sync
  async queueOperation(method: string, url: string, body: any): Promise<string> {
    await this.ensureDB();
    const id = crypto.randomUUID();
    const operation: PendingOperation = {
      id,
      method,
      url,
      body,
      timestamp: Date.now(),
      retries: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["pendingOps"], "readwrite");
      const store = transaction.objectStore("pendingOps");
      const request = store.add(operation);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all pending operations
  async getPendingOperations(): Promise<PendingOperation[]> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["pendingOps"], "readonly");
      const store = transaction.objectStore("pendingOps");
      const index = store.index("timestamp");
      const request = index.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove operation after successful sync
  async removeOperation(id: string): Promise<void> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["pendingOps"], "readwrite");
      const store = transaction.objectStore("pendingOps");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Update retry count
  async incrementRetry(id: string): Promise<void> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["pendingOps"], "readwrite");
      const store = transaction.objectStore("pendingOps");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const op = getRequest.result;
        if (op) {
          op.retries += 1;
          const putRequest = store.put(op);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Cache data locally
  async cacheData(storeName: string, data: any): Promise<void> {
    await this.ensureDB();
    if (!this.db!.objectStoreNames.contains(storeName)) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached data
  async getCachedData(storeName: string, id: string): Promise<any> {
    await this.ensureDB();
    if (!this.db!.objectStoreNames.contains(storeName)) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all cached data
  async getAllCached(storeName: string): Promise<any[]> {
    await this.ensureDB();
    if (!this.db!.objectStoreNames.contains(storeName)) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async ensureDB(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }
}

// Singleton instance
let dbInstance: OfflineDatabase | null = null;

export async function getOfflineDB(): Promise<OfflineDatabase> {
  if (!dbInstance) {
    dbInstance = new OfflineDatabase();
    await dbInstance.init();
  }
  return dbInstance;
}
