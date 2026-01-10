"use client";

import { useState, useMemo } from "react";
import { Toaster, toast } from "sonner";
import { generatePDF } from "@/lib/generate-pdf";
import { Order } from "./types";
import AreaGridView from "./dashboard/AreaGridView";
import OrderListView from "./dashboard/OrderListView";
import LoadSheetModal from "./dashboard/LoadSheetModal";
import ViewBillModal from "./dashboard/ViewBillModal";

export default function DeliveryDashboard({ orders }: { orders: Order[] }) {
  // State
  const [view, setView] = useState<"AREAS" | "ORDERS">("AREAS");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

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

  // --- 2. Filter Orders for Screen 2 ---
  const currentAreaOrders = useMemo(() => {
    if (!selectedArea) return [];
    return orders.filter((o) => (o.areaName || "Unknown") === selectedArea);
  }, [orders, selectedArea]);

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
      toast.success("PDF Downloaded! 📄");
    } catch {
      toast.error("PDF Failed");
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
