"use client";

import { createPortal } from "react-dom";
import { Truck, X, Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadSheetProps {
  isOpen: boolean;
  onClose: () => void;
  summary: Record<string, number>;
  areaName: string;
  onDownload: () => void;
  isDownloading: boolean;
  selectedCount: number;
}

export default function LoadSheetModal({
  isOpen,
  onClose,
  summary,
  areaName,
  onDownload,
  isDownloading,
  selectedCount,
}: LoadSheetProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-[2.5rem] p-6 shadow-2xl relative animate-in zoom-in-95 ring-8 ring-white/20">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6 mt-2">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Truck size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Load Maal 📦</h2>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1">
            {selectedCount} Orders from {areaName}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl mb-6 text-xs text-orange-800 font-bold text-center leading-relaxed">
          Is list ke hisab se gadi mein maal load karein. <br /> Total Items:{" "}
          {Object.keys(summary).length}
        </div>

        <div className="space-y-2 mb-6">
          {Object.entries(summary).map(([name, qty]) => (
            <div
              key={name}
              className="p-3 pl-4 flex justify-between items-center bg-slate-50 rounded-2xl border border-slate-100"
            >
              <span className="font-bold text-slate-700 text-sm">{name}</span>
              <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md">
                {qty}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="flex-1 bg-white border-2 border-slate-100 text-slate-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {isDownloading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Download size={18} />
            )}{" "}
            PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-bold active:scale-95 transition-all shadow-lg"
          >
            Done 👍
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
