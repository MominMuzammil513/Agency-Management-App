"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Users, ShoppingCart, Truck, CheckSquare, FileText, Calendar, Download, Package, X, Loader2 } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { generatePDF } from "@/lib/generate-pdf";
import { toastManager } from "@/lib/toast-manager";

interface Staff {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  isActive: boolean;
}

interface StaffActivityClientProps {
  salesmen: Staff[];
  deliveryBoys: Staff[];
  agencyId: string;
  ownerAdminId: string;
}

export default function StaffActivityClient({
  salesmen,
  deliveryBoys,
  agencyId,
  ownerAdminId,
}: StaffActivityClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"salesman" | "delivery_boy">("salesman");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [showLoadSheet, setShowLoadSheet] = useState(false);
  const [loadSheetDate, setLoadSheetDate] = useState<string>(
    new Date().toISOString().split("T")[0] // Today by default
  );
  const [loadSheetData, setLoadSheetData] = useState<any>(null);
  const [loadingLoadSheet, setLoadingLoadSheet] = useState(false);
  const [loadingStaffId, setLoadingStaffId] = useState<string | null>(null);

  const currentStaffList = activeTab === "salesman" ? salesmen : deliveryBoys;

  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleViewStaff = (staffId: string) => {
    setLoadingStaffId(staffId);
    router.push(`/admin/staff-activity/${activeTab}/${staffId}`);
  };

  const handleMaalLoad = () => {
    if (selectedStaffIds.length === 0) return;
    const staffIdsParam = selectedStaffIds.join(",");
    router.push(
      `/admin/staff-activity/${activeTab}/maal-load?staffIds=${staffIdsParam}`
    );
  };

  // Fetch pending orders loadsheet with date filter
  const handleLoadSheetWithFilter = async () => {
    if (!loadSheetDate) return;
    setLoadingLoadSheet(true);
    try {
      const selectedDate = new Date(loadSheetDate);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999)).toISOString();
      
      // Fetch pending orders up to selected date (not delivered yet)
      const response = await fetch(
        `/api/admin/pending-orders-loadsheet?date=${loadSheetDate}&status=pending,confirmed`
      );
      const data = await response.json();
      setLoadSheetData(data);
      setShowLoadSheet(true);
    } catch (error) {
      console.error("Failed to load sheet:", error);
    } finally {
      setLoadingLoadSheet(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="px-5 py-4 flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-black text-slate-800">Staff Activity</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100">
        <div className="flex">
          <button
            onClick={() => {
              setActiveTab("salesman");
              setSelectedStaffIds([]);
            }}
            className={`flex-1 py-4 text-center font-bold transition-colors ${
              activeTab === "salesman"
                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                : "text-slate-400"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart size={18} />
              <span>Salesman ({salesmen.length})</span>
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab("delivery_boy");
              setSelectedStaffIds([]);
            }}
            className={`flex-1 py-4 text-center font-bold transition-colors ${
              activeTab === "delivery_boy"
                ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50"
                : "text-slate-400"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Truck size={18} />
              <span>Delivery Boy ({deliveryBoys.length})</span>
            </div>
          </button>
        </div>
      </div>

      {/* Pending Orders Loadsheet Section */}
      <div className="bg-orange-50 border-b border-orange-200 px-5 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="text-orange-600" size={20} />
          <h2 className="font-bold text-slate-800 text-sm">Pending Orders Loadsheet</h2>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={loadSheetDate}
            onChange={(e) => setLoadSheetDate(e.target.value)}
            className="flex-1 px-3 py-2 border border-orange-200 rounded-xl text-sm font-medium bg-white"
          />
          <button
            onClick={handleLoadSheetWithFilter}
            disabled={loadingLoadSheet}
            className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loadingLoadSheet ? (
              <Package className="animate-spin" size={16} />
            ) : (
              <FileText size={16} />
            )}
            Load Sheet
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2">
          View pending/confirmed orders up to selected date for delivery planning
        </p>
      </div>

      {/* Selected Staff Actions */}
      {selectedStaffIds.length > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-emerald-700">
            {selectedStaffIds.length} staff selected
          </span>
          <button
            onClick={handleMaalLoad}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
          >
            <FileText size={16} />
            Maal Load
          </button>
        </div>
      )}

      {/* Staff List */}
      <div className="px-5 py-4 space-y-3">
        {currentStaffList.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users size={48} className="mx-auto mb-3 opacity-50" />
            <p className="font-bold">No {activeTab === "salesman" ? "salesmen" : "delivery boys"} found</p>
          </div>
        ) : (
          currentStaffList.map((staff) => {
            const isSelected = selectedStaffIds.includes(staff.id);
            return (
              <div
                key={staff.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleStaffSelection(staff.id)}
                    className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600"
                        : "border-slate-300"
                    }`}
                  >
                    {isSelected && <CheckSquare size={16} className="text-white" />}
                  </button>

                  {/* Staff Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-sm">{staff.name}</h3>
                      {staff.id === ownerAdminId && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{staff.mobile}</p>
                  </div>

                  {/* View Button */}
                  <button
                    onClick={() => handleViewStaff(staff.id)}
                    disabled={loadingStaffId === staff.id}
                    className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
                  >
                    {loadingStaffId === staff.id ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      "View"
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Loadsheet Modal */}
      {showLoadSheet && loadSheetData && typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-[2.5rem] p-6 shadow-2xl relative animate-in zoom-in-95 ring-8 ring-white/30">
              <button
                onClick={() => {
                  setShowLoadSheet(false);
                  setLoadSheetData(null);
                }}
                className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6 mt-2">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-800">Load Sheet</h2>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                  Pending Orders till {loadSheetData.date ? new Date(loadSheetData.date).toLocaleDateString() : ""}
                </p>
                <p className="text-xs text-orange-600 font-bold mt-1">
                  {loadSheetData.orders?.length || 0} Orders
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl mb-6 text-xs text-orange-800 font-bold text-center leading-relaxed">
                Yaha se peechle pending orders ka maal load karna hai. 📦
              </div>

              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                {Object.entries(loadSheetData.summary || {}).length === 0 ? (
                  <p className="text-center text-slate-400 py-4">No pending orders</p>
                ) : (
                  Object.entries(loadSheetData.summary || {}).map(([key, quantity]: [string, any]) => {
                    const productName = key.split(':').slice(1).join(':');
                    const item = loadSheetData.items?.find((i: any) => `${i.categoryId || 'uncategorized'}:${i.productName}` === key);
                    const categoryName = item?.categoryName || 'Uncategorized';
                    return (
                      <div
                        key={key}
                        className="p-3 pl-4 flex justify-between items-center bg-slate-50 rounded-2xl border border-slate-100"
                      >
                        <div>
                          <span className="font-bold text-slate-700 text-sm block">
                            {productName}
                          </span>
                          <span className="text-xs text-slate-400 font-bold uppercase">
                            {categoryName}
                          </span>
                        </div>
                        <span className="bg-slate-800 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md shadow-slate-200">
                          {quantity}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowLoadSheet(false);
                    setLoadSheetData(null);
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-2xl font-bold shadow-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    try {
                      const ordersWithItems = (loadSheetData.orders || []).map((order: any) => {
                        const orderItems = (loadSheetData.items || []).filter((item: any) => item.orderId === order.id);
                        return {
                          ...order,
                          areaName: order.areaName || "",
                          items: orderItems.map((item: any) => ({
                            productName: item.productName,
                            quantity: item.quantity,
                            price: item.price,
                          })),
                          totalAmount: orderItems.reduce((sum: number, item: any) => sum + (item.price || 0), 0),
                        };
                      });
                      generatePDF(ordersWithItems, `Pending_LoadSheet_${loadSheetData.date || new Date().toISOString().split("T")[0]}`);
                      toastManager.success("PDF Downloaded! 📄");
                    } catch (error) {
                      console.error("PDF Error:", error);
                      toastManager.error("Download failed 😢");
                    }
                  }}
                  className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-bold shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  PDF
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
