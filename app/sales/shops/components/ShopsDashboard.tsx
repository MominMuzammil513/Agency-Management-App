"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Store,
  User,
  Phone,
  ShoppingBag,
  ArrowLeft,
  Trash2,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useSocket } from "@/lib/socket-client";
import AddShop from "./AddShop";
import EditShop from "./EditShop";

interface Shop {
  id: string;
  name: string;
  ownerName: string | null;
  mobile: string | null;
  areaId?: string; // For filtering real-time updates
}

interface ShopsDashboardProps {
  areaId: string;
  areaName: string;
  initialShops: Shop[];
}

export default function ShopsDashboard({
  areaId,
  areaName,
  initialShops,
}: ShopsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [shops, setShops] = useState<Shop[]>(initialShops);
  const [isValidating, setIsValidating] = useState(false);
  const { socket, isConnected } = useSocket();
  
  // Debug: Log connection status
  useEffect(() => {
    console.log("🔌 ShopsDashboard Socket Status:", { 
      hasSocket: !!socket, 
      isConnected, 
      areaId,
      socketId: socket?.id 
    });
  }, [socket, isConnected, areaId]);

  // 📡 Real-time Socket.io listeners
  useEffect(() => {
    if (!socket) {
      console.log("⚠️ Socket not available yet");
      return;
    }

    if (!isConnected) {
      console.log("⏳ Socket not connected yet, waiting...");
      // Wait for connection
      const checkConnection = setInterval(() => {
        if (socket.connected) {
          clearInterval(checkConnection);
          // Re-run this effect when connected
          console.log("✅ Socket connected, setting up listeners");
        }
      }, 100);
      
      return () => clearInterval(checkConnection);
    }

    console.log("✅ Setting up Socket.io listeners for area:", areaId);
    
    // Join area room for real-time shop updates
    socket.emit("join-room", `area:${areaId}`);
    console.log("📦 Emitted join-room for area:", areaId);

    // Listen for shop updates
    const handleShopCreated = (newShop: any) => {
      console.log("🔔 Received shop:created event", { 
        newShop, 
        newShopAreaId: newShop?.areaId, 
        currentAreaId: areaId,
        matches: newShop?.areaId === areaId
      });
      
      // Check if shop belongs to current area
      if (newShop && newShop.id) {
        // Convert both to strings for comparison (in case of type mismatch)
        const shopAreaId = String(newShop.areaId || "");
        const currentArea = String(areaId || "");
        
        // If areaId matches OR if areaId is not provided (fallback), add it
        if (shopAreaId === currentArea || !shopAreaId) {
          setShops((prev) => {
            // Only add if shop doesn't already exist
            if (prev.find(s => s.id === newShop.id)) {
              console.log("⚠️ Shop already exists in list, skipping duplicate");
              return prev;
            }
            console.log("✅ Adding new shop to list:", newShop);
            const shopToAdd: Shop = {
              id: newShop.id,
              name: newShop.name,
              ownerName: newShop.ownerName || null,
              mobile: newShop.mobile || null,
              areaId: shopAreaId || areaId,
            };
            toast.success(`New shop added: ${shopToAdd.name} 🏪`);
            return [...prev, shopToAdd];
          });
        } else {
          console.log("❌ Shop areaId doesn't match - ignoring:", {
            shopAreaId,
            currentArea,
            shop: newShop.name
          });
        }
      } else {
        console.error("❌ Invalid shop data received:", newShop);
      }
    };

    socket.on("shop:created", handleShopCreated);

    socket.on("shop:updated", (updatedShop: Shop) => {
      console.log("Received shop:updated event", { updatedShop, currentAreaId: areaId });
      if (updatedShop && updatedShop.id) {
        if (updatedShop.areaId === areaId || !updatedShop.areaId) {
          // Update if shop belongs to this area
          setShops((prev) =>
            prev.map((s) => (s.id === updatedShop.id ? updatedShop : s))
          );
          toast.success("Shop updated ✏️");
        } else {
          // If shop moved to different area, remove it from this list
          setShops((prev) => prev.filter((s) => s.id !== updatedShop.id));
        }
      }
    });

    socket.on("shop:deleted", (deletedId: string) => {
      console.log("Received shop:deleted event", deletedId);
      setShops((prev) => prev.filter((s) => s.id !== deletedId));
    });

    // Listen for full shop list refresh
    socket.on("shops:refresh", (newShops: Shop[]) => {
      setShops(newShops);
    });

    return () => {
      socket.off("shop:created", handleShopCreated);
      socket.off("shop:updated");
      socket.off("shop:deleted");
      socket.off("shops:refresh");
      socket.emit("leave-room", `area:${areaId}`);
    };
  }, [socket, areaId, isConnected]);

  // Only sync initial data - Socket.io handles all updates
  useEffect(() => {
    setShops(initialShops);
  }, [initialShops]);

  // Search Filter
  const filteredShops = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    return shops.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.ownerName?.toLowerCase().includes(lower) ||
        s.mobile?.includes(searchQuery)
    );
  }, [searchQuery, shops]);

  // Delete Logic - Socket.io will handle real-time updates
  const handleDelete = async (id: string) => {
    if (!confirm("Remove this shop?")) return;

    try {
      const res = await fetch(`/api/shops/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Shop removed");
      // Socket.io event will automatically update the UI
    } catch {
      toast.error("Could not delete shop");
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/60 font-sans pb-24">
      {/* 🌿 Header (Sticky & Blurry) */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-emerald-100/50 rounded-b-4xl shadow-sm px-5 pt-6 pb-6">
        {/* Navigation & Title */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/sales"
            className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-emerald-100 hover:text-emerald-600 transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <p className="text-emerald-600 font-bold text-[10px] tracking-widest uppercase">
              Current Area
            </p>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
              {areaName}
            </h1>
          </div>
        </div>

        {/* Search & Add Row */}
        <div className="flex gap-3">
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-400 shadow-emerald-100/50 p-2 flex items-center flex-1">
            <div className="pl-3 text-emerald-300">
              {isValidating ? (
                <RefreshCcw size={18} className="animate-spin" />
              ) : (
                <Search size={20} />
              )}
            </div>
            <input
              type="text"
              placeholder="Find shop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-4 py-2.5 bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none font-medium"
            />
          </div>

          {/* Add Shop Component - Socket.io will handle real-time updates */}
          <AddShop areaId={areaId} onSuccess={(shop) => {
            // Immediate optimistic update - add shop right away
            console.log("🎯 AddShop onSuccess - Adding shop immediately:", shop);
            
            if (shop && shop.id) {
              const shopWithArea: Shop = {
                id: shop.id,
                name: shop.name,
                ownerName: shop.ownerName || null,
                mobile: shop.mobile || null,
                areaId: shop.areaId || areaId, // Ensure areaId is set
              };
              
              // Add shop immediately (socket event handler will prevent duplicates)
              setShops((prev) => {
                // Check for duplicates before adding
                if (prev.find(s => s.id === shopWithArea.id)) {
                  console.log("⚠️ Shop already in list (socket event may have fired first)");
                  return prev;
                }
                console.log("✅ Adding shop to list via onSuccess:", shopWithArea);
                return [...prev, shopWithArea];
              });
              
              // Toast is already shown in AddShop component
            }
          }} />
        </div>
      </div>

      {/* 🏪 Shops List */}
      <div className="p-4 space-y-4">
        {filteredShops.length === 0 ? (
          <div className="text-center py-16 opacity-60 bg-white/40 rounded-3xl border border-dashed border-emerald-200">
            <Store size={48} className="mx-auto text-emerald-300 mb-3" />
            <p className="text-slate-500 font-medium">
              No shops found here.
              <br />
              Add one to start selling! 🚀
            </p>
          </div>
        ) : (
          filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="group bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)] border border-white hover:border-emerald-200 transition-all duration-300 relative overflow-hidden"
            >
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 z-0 opacity-50 pointer-events-none"></div>

              <div className="relative z-10">
                {/* Shop Name & Info */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-800 leading-tight mb-1">
                      {shop.name}
                    </h2>
                    {(shop.ownerName || shop.mobile) && (
                      <div className="flex flex-col gap-1 mt-2">
                        {shop.ownerName && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                            <User size={12} className="text-emerald-400" />
                            {shop.ownerName}
                          </div>
                        )}
                        {shop.mobile && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                            <Phone size={12} className="text-emerald-400" />
                            {shop.mobile}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions (Edit/Delete) */}
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <EditShop shop={shop} onSuccess={() => {}} />
                    <div className="w-px h-3 bg-slate-200"></div>
                    <button
                      onClick={() => handleDelete(shop.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* 🔥 MAIN ACTION: ORDER BUTTON */}
                <Link
                  href={`/sales/order?shopId=${shop.id}`}
                  className="w-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all"
                >
                  <ShoppingBag size={20} />
                  Take Order
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
