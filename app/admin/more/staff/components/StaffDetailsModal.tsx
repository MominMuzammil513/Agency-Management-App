"use client";

import { X } from "lucide-react";
import { Staff } from "./types";

export default function StaffDetailsModal({
  staff,
  onClose,
  onEdit,
  onDelete,
}: {
  staff: Staff;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">Staff Details</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p>
          <b>Name:</b> {staff.name}
        </p>
        <p>
          <b>Email:</b> {staff.email}
        </p>
        <p>
          <b>Mobile:</b> {staff.mobile}
        </p>
        {staff.altMobile && (
          <p>
            <b>Alt:</b> {staff.altMobile}
          </p>
        )}
        <p>
          <b>Role:</b> {staff.role}
        </p>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onEdit}
            className="flex-1 bg-orange-600 text-white py-2 rounded-lg"
          >
            Update
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
