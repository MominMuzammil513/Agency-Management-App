"use client";

import { ChevronRight, ShieldCheck, Truck } from "lucide-react";
import { Staff } from "./types"; // Import types

interface StaffCardProps {
  staff: Staff;
  onClick: () => void;
}

export default function StaffCard({ staff, onClick }: StaffCardProps) {
  const initials = staff.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      onClick={onClick}
      className="group bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="flex items-center gap-4 relative z-10">
        <div
          className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${
            staff.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-lg truncate">
            {staff.name}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-1 w-fit ${
                staff.role === "salesman"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-orange-50 text-orange-600"
              }`}
            >
              {staff.role === "salesman" ? (
                <ShieldCheck size={12} />
              ) : (
                <Truck size={12} />
              )}
              {staff.role === "salesman" ? "Sales" : "Delivery"}
            </span>

            <div
              className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                staff.isActive
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-slate-50 text-slate-400 border-slate-200"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  staff.isActive
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-slate-400"
                }`}
              ></div>
              {staff.isActive ? "Active" : "Inactive"}
            </div>
          </div>
        </div>

        <div className="h-8 w-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
}