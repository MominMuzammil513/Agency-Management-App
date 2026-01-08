"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoveLeft, Plus } from "lucide-react";

import StaffCard from "./StaffCard";
import StaffFormModal from "./StaffFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import StaffDetailsModal from "./StaffDetailsModal";
import { Staff, StaffFormData } from "./types";
import { mapStaffToFormData } from "./mapStaffToFormData";
import Link from "next/link";

interface StaffListProps {
  initialStaff: Staff[];
}

export default function StaffList({ initialStaff }: StaffListProps) {
  const router = useRouter();

  const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 🔹 Create / Update staff
  const onFormSubmit = async (data: StaffFormData) => {
    try {
      const res = await fetch(
        editingStaff ? `/api/auth/staff/${editingStaff.id}` : "/api/auth/staff",
        {
          method: editingStaff ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Action failed");

      toast.success(
        editingStaff
          ? "Staff updated successfully"
          : "Staff created successfully"
      );
      setIsFormOpen(false);
      setEditingStaff(null);
      setSelectedStaff(null);

      // 🔄 refresh server data
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    }
  };

  // 🔹 Soft delete (Deactivate)
  const handleDeactivate = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/auth/staff/${deleteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Deactivate failed");

      toast.success("Staff deactivated successfully");

      setDeleteId(null);
      setSelectedStaff(null);

      // 🔄 refresh server data
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Deactivate failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        {/* <div className="flex items-center gap-x-3">
          <Link
            href="/admin/more"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-700 hover:bg-orange-800 transition"
          >
            <MoveLeft size={18} className="text-white" />
          </Link> */}

          <h2 className="text-2xl font-bold text-slate-900">Manage Staff</h2>
        {/* </div> */}
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
        >
          <Plus size={18} /> Add New
        </button>
      </div>

      {/* Staff List */}
      <div className="space-y-3">
        {staffList.length === 0 ? (
          <p className="text-slate-500 text-sm">No staff found</p>
        ) : (
          staffList.map((staff) => (
            <StaffCard
              key={staff.id}
              staff={staff}
              onClick={() => setSelectedStaff(staff)}
            />
          ))
        )}
      </div>

      {/* Staff Details */}
      {selectedStaff && (
        <StaffDetailsModal
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
          onEdit={() => {
            setEditingStaff(selectedStaff);
            setIsFormOpen(true);
          }}
          onDelete={() => setDeleteId(selectedStaff.id)}
        />
      )}

      {/* Create / Update Modal */}
      {isFormOpen && (
        <StaffFormModal
          isOpen
          isEdit={!!editingStaff}
          initialData={
            editingStaff ? mapStaffToFormData(editingStaff) : undefined
          }
          onClose={() => {
            setIsFormOpen(false);
            setEditingStaff(null);
          }}
          onSubmit={onFormSubmit}
        />
      )}

      {/* Deactivate Confirm */}
      {deleteId && (
        <DeleteConfirmModal
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeactivate}
        />
      )}
    </div>
  );
}
