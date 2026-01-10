// components/staff/DeleteConfirmModal.tsx
"use client";

import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Confirm Delete</h3>
        </div>

        {/* Message */}
        <p className="text-slate-600 mb-8">
          Are you sure you want to delete this staff member? This action cannot
          be undone.
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
