"use client";

import { useState, useMemo, useEffect } from "react";
import { Toaster } from "sonner";
import { toastManager } from "@/lib/toast-manager";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { generatePDF } from "@/lib/generate-pdf";
import { Order } from "./types";
import AreaGridView from "./dashboard/AreaGridView";
import OrderListView from "./dashboard/OrderListView";
import LoadSheetModal from "./dashboard/LoadSheetModal";
import ViewBillModal from "./dashboard/ViewBillModal";

interface DeliveryStats {
  totalDelivered: number;
  totalAmount: number;
}

export default function DeliveryDashboard({ 
  orders: initialOrders,
  stats = { totalDelivered: 0, totalAmount: 0 }
}: { 
  orders: Order[];
  stats?: DeliveryStats;
}) {
  // State
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [view, setView] = useState<"AREAS" | "ORDERS">("AREAS");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  // Sync initial data when props change (from router.refresh())
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Modals
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [showLoadSheet, setShowLoadSheet] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // --- 1. Area Grouping Logic (For Screen 1) ---
  const areaStats = useMemo(() => {
    const stats: Record<string, { count: number; amount: number }> = {};
    orders.forEach((o) => {
      const area = o.areaName || "Unknown";
      if (!stats[area]) stats[area] = { count: 0, amount: 0 };
      stats[area].count += 1;
      stats[area].amount += o.totalAmount;
    });
    return stats;
  }, [orders]);

  // --- 2. Filter Orders for Screen 2 (with search) ---
  const currentAreaOrders = useMemo(() => {
    if (!selectedArea) return [];
    const areaFiltered = orders.filter((o) => (o.areaName || "Unknown") === selectedArea);
    if (!searchQuery.trim()) return areaFiltered;
    const query = searchQuery.toLowerCase();
    return areaFiltered.filter((o) =>
      o.shopName.toLowerCase().includes(query) ||
      (o.shopMobile && o.shopMobile.includes(query))
    );
  }, [orders, selectedArea, searchQuery]);

  // --- 3. Load Sheet Logic (Based on Selection) ---
  const loadSummary = useMemo(() => {
    const targetOrders = currentAreaOrders.filter((o) =>
      selectedOrderIds.includes(o.id)
    );
    const summary: Record<string, number> = {};
    targetOrders.forEach((order) => {
      order.items.forEach((item) => {
        summary[item.productName] =
          (summary[item.productName] || 0) + item.quantity;
      });
    });
    return summary;
  }, [currentAreaOrders, selectedOrderIds]);

  // --- Handlers ---
  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    setView("ORDERS");
    setSelectedOrderIds([]); // Reset selection when entering new area
  };

  const handleBack = () => {
    setView("AREAS");
    setSelectedArea(null);
    setSelectedOrderIds([]);
  };

  const handlePDF = () => {
    const targetOrders = currentAreaOrders.filter((o) =>
      selectedOrderIds.includes(o.id)
    );
    if (targetOrders.length === 0) return;

    setLoadingAction("pdf");
    try {
      // Fix for Type Error (Ensure areaName is string)
      const safeOrders = targetOrders.map((o) => ({
        ...o,
        areaName: o.areaName || "",
      }));
      generatePDF(safeOrders, `Load_${selectedArea}`);
      toastManager.success("PDF Downloaded! 📄");
    } catch {
      toastManager.error("PDF Failed");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/60 pb-32 font-sans relative">
      {/* SCREEN 1: AREA GRID */}
      {view === "AREAS" && (
        <AreaGridView
          areaStats={areaStats}
          totalPending={orders.length}
          onSelectArea={handleAreaSelect}
          deliveryStats={stats}
        />
      )}

      {/* SCREEN 2: ORDER LIST */}
      {view === "ORDERS" && selectedArea && (
        <OrderListView
          areaName={selectedArea}
          orders={currentAreaOrders}
          selectedIds={selectedOrderIds}
          setSelectedIds={setSelectedOrderIds}
          onBack={handleBack}
          onViewBill={setViewOrder}
          onOpenLoadSheet={() => setShowLoadSheet(true)}
          onDownloadPDF={handlePDF}
          loadingAction={loadingAction}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* MODALS */}
      <LoadSheetModal
        isOpen={showLoadSheet}
        onClose={() => setShowLoadSheet(false)}
        summary={loadSummary}
        areaName={selectedArea || ""}
        onDownload={handlePDF}
        isDownloading={loadingAction === "pdf"}
        selectedCount={selectedOrderIds.length}
      />

      <ViewBillModal order={viewOrder} onClose={() => setViewOrder(null)} />
    </div>
  );
}
