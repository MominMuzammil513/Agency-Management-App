"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Minus,
  CheckCircle2,
  Package,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/offline-db";
import { useOnline } from "@/hooks/use-online";

interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  imageUrl: string | null;
  stock: number;
}

interface OrderPageProps {
  shop: { id: string; name: string };
  categories: { id: string; name: string }[];
  initialProducts: Product[];
}

export default function OrderPageClient({
  shop,
  categories,
  initialProducts,
}: OrderPageProps) {
  const router = useRouter();
  const isOnline = useOnline();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // 🔄 1. RESTORE CART LOGIC (For Edit Feature) ✏️
  useEffect(() => {
    const editData = sessionStorage.getItem("edit_cart_data");

    if (editData) {
      try {
        const { shopId, items } = JSON.parse(editData);

        // Agar shop ID match hoti hai (Security check)
        if (shopId === shop.id) {
          const restoredCart: Record<string, number> = {};

          items.forEach((item: any) => {
            // Product Name se ID dhoondh rahe hain
            const product = initialProducts.find(
              (p) => p.name === item.productName
            );
            if (product) {
              restoredCart[product.id] = item.quantity;
            }
          });

          setCart(restoredCart);

          if (Object.keys(restoredCart).length > 0) {
            toast.info("Previous order loaded for editing ✏️");
          }
        }
        // Cleanup
        sessionStorage.removeItem("edit_cart_data");
      } catch (e) {
        console.error("Failed to restore cart", e);
      }
    }
  }, [shop.id, initialProducts]);

  // 🔄 2. OFFLINE SYNC LOGIC
  useEffect(() => {
    const checkPending = async () => {
      const count = await db.pendingOrders.count();
      setPendingCount(count);
    };
    checkPending();
  }, []);

  useEffect(() => {
    const syncOrders = async () => {
      if (isOnline && pendingCount > 0) {
        const orders = await db.pendingOrders.toArray();
        let synced = 0;

        for (const order of orders) {
          try {
            const res = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                shopId: order.shopId,
                items: order.items,
              }),
            });

            if (res.ok) {
              await db.pendingOrders.delete(order.id!);
              synced++;
            }
          } catch (e) {
            console.error("Sync failed for order", order.id);
          }
        }

        if (synced > 0) {
          toast.success(`${synced} offline orders synced! 🚀`);
          setPendingCount(await db.pendingOrders.count());
        }
      }
    };

    syncOrders();
  }, [isOnline, pendingCount]);

  // --- FILTERS ---
  const filteredProducts = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    return initialProducts.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(lower);
      const matchesCat =
        selectedCategory === "All" ||
        categories.find((c) => c.id === p.categoryId)?.name ===
          selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory, initialProducts, categories]);

  // --- CALCULATIONS ---
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [pid, qty]) => {
    const product = initialProducts.find((p) => p.id === pid);
    return sum + (product ? product.price * qty : 0);
  }, 0);

  // --- HANDLERS ---
  const addToCart = (productId: string, maxStock: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      if (current >= maxStock) {
        toast.error("Max stock reached!");
        return prev;
      }
      return { ...prev, [productId]: current + 1 };
    });
  };

  const decreaseFromCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setCart((prev) => {
      const current = prev[productId] || 0;
      if (current <= 0) return prev;
      if (current === 1) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: current - 1 };
    });
  };

  const handlePlaceOrder = async () => {
    if (totalItems === 0) return;
    if (!confirm(`Confirm order of ₹${totalPrice}?`)) return;

    setLoading(true);
    const items = Object.entries(cart).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    try {
      if (isOnline) {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shopId: shop.id, items }),
        });

        if (!res.ok) throw new Error("Failed");
        toast.success("Order Placed! 🎉");
      } else {
        await db.pendingOrders.add({
          shopId: shop.id,
          items,
          totalAmount: totalPrice,
          timestamp: Date.now(),
        });
        toast.warning("Saved Offline! 📡");
        setPendingCount((prev) => prev + 1);
      }

      router.push("/sales");
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/60 font-sans pb-32">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md pt-5 pb-3 sticky top-0 z-30 border-b border-emerald-100/50 rounded-b-[2rem] shadow-sm">
        <div className="px-5 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-emerald-600 font-bold text-[10px] tracking-widest uppercase">
                {isOnline ? "Online 🟢" : "Offline 🔴"}
              </p>
              <h1 className="text-lg font-black text-slate-800 truncate max-w-[150px]">
                {shop.name}
              </h1>
            </div>
          </div>
          {pendingCount > 0 && (
            <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              {pendingCount} Pending Sync
            </div>
          )}
        </div>

        {/* Search */}
        <div className="px-5 relative mb-3">
          <Search
            className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-400"
            size={18}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all font-medium"
          />
        </div>

        {/* Categories */}
        <div className="pl-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              selectedCategory === "All"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-200"
                : "bg-white text-slate-500 border-slate-200"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                selectedCategory === cat.name
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-200"
                  : "bg-white text-slate-500 border-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {filteredProducts.map((product) => {
          const qty = cart[product.id] || 0;
          const isOOS = product.stock <= 0;

          return (
            <div
              key={product.id}
              onClick={() => !isOOS && addToCart(product.id, product.stock)}
              className={`relative bg-white p-2 rounded-2xl shadow-sm border-2 border-transparent transition-all active:scale-95 duration-100 ${
                isOOS
                  ? "opacity-60 grayscale cursor-not-allowed"
                  : "cursor-pointer hover:border-emerald-200 active:border-emerald-400"
              } ${qty > 0 ? "border-emerald-500 bg-emerald-50/30" : ""}`}
            >
              {/* Green Qty Badge */}
              {qty > 0 && (
                <div className="absolute top-2 right-2 bg-emerald-600 text-white h-6 w-6 flex items-center justify-center rounded-full font-bold text-xs shadow-md z-10 animate-in zoom-in">
                  {qty}
                </div>
              )}

              {/* Image Container */}
              <div className="relative h-36 w-full mb-1 overflow-hidden flex items-center justify-center rounded-lg">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                ) : (
                  <Package className="text-emerald-200" size={40} />
                )}
              </div>

              {/* Info */}
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-1 mb-1">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between">
                  <span className="text-emerald-600 font-black text-sm">
                    ₹{product.price}
                  </span>

                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                        isOOS
                          ? "bg-red-100 text-red-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isOOS ? "No Stock" : `${product.stock} Left`}
                    </span>

                    {qty > 0 && (
                      <button
                        onClick={(e) => decreaseFromCart(e, product.id)}
                        className="h-6 w-6 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all"
                      >
                        <Minus size={14} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className={`w-full p-2 rounded-[1.5rem] shadow-2xl flex items-center justify-between pr-6 pl-2 group overflow-hidden relative ${
              isOnline
                ? "bg-slate-800 text-white shadow-slate-400/50"
                : "bg-orange-600 text-white shadow-orange-400/50"
            }`}
          >
            {loading && (
              <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="bg-white text-slate-900 h-12 w-12 rounded-full flex flex-col items-center justify-center font-bold text-xs shadow-inner">
                <span>{totalItems}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] opacity-80 font-bold uppercase tracking-wider">
                  {isOnline ? "Total" : "Offline"}
                </span>
                <span className="text-lg font-black">₹{totalPrice}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-bold group-hover:translate-x-1 transition-transform">
              {isOnline ? "Place Order" : "Save"}
              <CheckCircle2
                size={22}
                fill="currentColor"
                className={isOnline ? "text-emerald-500" : "text-white"}
              />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
