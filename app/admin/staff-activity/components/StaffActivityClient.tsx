"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ShoppingCart, Truck, CheckSquare, FileText } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

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
}

export default function StaffActivityClient({
  salesmen,
  deliveryBoys,
  agencyId,
}: StaffActivityClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"salesman" | "delivery_boy">("salesman");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  const currentStaffList = activeTab === "salesman" ? salesmen : deliveryBoys;

  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleViewStaff = (staffId: string) => {
    router.push(`/admin/staff-activity/${activeTab}/${staffId}`);
  };

  const handleMaalLoad = () => {
    if (selectedStaffIds.length === 0) return;
    const staffIdsParam = selectedStaffIds.join(",");
    router.push(
      `/admin/staff-activity/${activeTab}/maal-load?staffIds=${staffIdsParam}`
    );
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

      {/* Selected Staff Actions */}
      {selectedStaffIds.length > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-emerald-700">
            {selectedStaffIds.length} staff selected
          </span>
          <button
            onClick={handleMaalLoad}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-colors"
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
                    : "border-slate-100 hover:border-slate-200"
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
                    <h3 className="font-bold text-slate-800 text-sm">{staff.name}</h3>
                    <p className="text-xs text-slate-500">{staff.mobile}</p>
                  </div>

                  {/* View Button */}
                  <button
                    onClick={() => handleViewStaff(staff.id)}
                    className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
