"use client";

import { createPortal } from "react-dom";
import { X, Mail, Phone, Shield, Power, Trash2, Edit } from "lucide-react";
import { Staff } from "./types";
import { useEffect, useState } from "react";

export default function StaffDetailsModal({
  staff,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  staff: Staff;
  onClose: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95 ring-8 ring-white/20">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mt-2 mb-6">
          <div
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-3xl font-black mb-3 shadow-lg ${
              staff.isActive
                ? "bg-emerald-100 text-emerald-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {staff.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-black text-slate-800">{staff.name}</h2>
          <p
            className={`text-xs font-bold uppercase tracking-widest mt-1 ${
              staff.isActive ? "text-emerald-500" : "text-slate-400"
            }`}
          >
            {staff.isActive ? "● Active Now" : "○ Inactive Account"}
          </p>
        </div>

        {/* Details Box */}
        <div className="bg-slate-50 rounded-2xl p-5 space-y-4 mb-6 border border-slate-100">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="p-2 bg-white rounded-lg text-emerald-500 shadow-sm">
              <Mail size={16} />
            </div>
            <span className="text-sm font-medium">{staff.email}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <div className="p-2 bg-white rounded-lg text-emerald-500 shadow-sm">
              <Phone size={16} />
            </div>
            <span className="text-sm font-medium">{staff.mobile}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <div className="p-2 bg-white rounded-lg text-emerald-500 shadow-sm">
              <Shield size={16} />
            </div>
            <span className="text-sm font-medium capitalize">
              {staff.role.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="flex flex-col justify-center items-center w-full gap-3">
          <button
            onClick={onEdit}
            className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <Edit size={18} /> Edit Profile
          </button>

          <button
            onClick={onToggleStatus}
            className={`py-3.5 w-full rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all text-sm ${
              staff.isActive
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            }`}
          >
            <Power size={18} /> {staff.isActive ? "Deactivate" : "Activate"}
          </button>

          {/* <button
            onClick={onDelete}
            className="bg-red-50 text-red-600 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 active:scale-95 transition-all text-sm"
          >
            <Trash2 size={18} /> Delete
          </button> */}
        </div>
      </div>
    </div>,
    document.body
  );
}
