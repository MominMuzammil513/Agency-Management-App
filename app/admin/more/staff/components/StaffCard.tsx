// components/staff/StaffCard.tsx
"use client";

import { ChevronRight } from "lucide-react";
import { Staff } from "./types";

interface StaffCardProps {
  staff: Staff;
  onClick: () => void;
}

export default function StaffCard({ staff, onClick }: StaffCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-slate-50 transition-colors flex justify-between items-center"
    >
      <div>
        <h3 className="font-semibold text-slate-900">{staff.name}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            staff.role === "salesman"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {staff.role === "salesman" ? "Sales Person" : "Delivery Boy"}
        </span>
      </div>
      <ChevronRight size={20} className="text-slate-400" />
    </div>
  );
}
