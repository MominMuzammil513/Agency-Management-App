"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/socket-client";
import StaffCard from "./StaffCard";
import StaffFormModal from "./StaffFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import StaffDetailsModal from "./StaffDetailsModal";
import BackButton from "@/components/ui/BackButton";
import { Staff, StaffFormData } from "./types";
import { mapStaffToFormData } from "./mapStaffToFormData";

interface StaffListProps {
  initialStaff: Staff[];
}

export default function StaffList({ initialStaff }: StaffListProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();

  // Local state for UI
  const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
  
  // Selection States
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Sync with Server Data (Initial Load)
  useEffect(() => {
    setStaffList(initialStaff);
  }, [initialStaff]);

  // 📡 Real-time Socket.io Listeners
  useEffect(() => {
    if (!socket || !isConnected || !session?.user) return;

    // Agency ID check (Session se ya User object se)
    const agencyId = (session.user as any).agencyId; 
    if (!agencyId) return;

    // Join Room
    socket.emit("join-room", `agency:${agencyId}`);

    // 1. Staff Created
    const handleCreated = (newStaff: Staff) => {
      setStaffList((prev) => [newStaff, ...prev]);
      toast.success(`New member joined: ${newStaff.name} 🎉`);
    };

    // 2. Staff Updated (Details)
    const handleUpdated = (updatedStaff: Staff) => {
      setStaffList((prev) =>
        prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
      );
      
      // 🔥 Fix: Agar Modal khula hai, toh usse bhi update karo
      if (selectedStaff?.id === updatedStaff.id) {
        setSelectedStaff(updatedStaff);
      }
    };

    // 3. Staff Deleted
    const handleDeleted = (deletedId: string) => {
      setStaffList((prev) => prev.filter((s) => s.id !== deletedId));
      
      // Agar deleted banda selected tha, toh modal band karo
      if (selectedStaff?.id === deletedId) {
        setSelectedStaff(null);
        setEditingStaff(null);
        setDeleteId(null);
        toast.error("This staff member was removed.");
      }
    };

    // 4. Status Updated (Active/Inactive)
    const handleStatusUpdated = (data: { id: string; isActive: boolean }) => {
      setStaffList((prev) =>
        prev.map((s) => {
          if (s.id === data.id) {
             const updated = { ...s, isActive: data.isActive };
             // 🔥 Fix: Modal Update Live
             if (selectedStaff?.id === data.id) {
                setSelectedStaff(updated);
             }
             return updated;
          }
          return s;
        })
      );
    };

    socket.on("staff:created", handleCreated);
    socket.on("staff:updated", handleUpdated);
    socket.on("staff:deleted", handleDeleted);
    socket.on("staff:status-updated", handleStatusUpdated);

    return () => {
      socket.off("staff:created", handleCreated);
      socket.off("staff:updated", handleUpdated);
      socket.off("staff:deleted", handleDeleted);
      socket.off("staff:status-updated", handleStatusUpdated);
      socket.emit("leave-room", `agency:${agencyId}`);
    };
  }, [socket, isConnected, session, selectedStaff]); // selectedStaff dependency zaroori hai

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
        editingStaff ? "Staff updated ✨" : "Welcome new member! 🎉"
      );
      
      setIsFormOpen(false);
      setEditingStaff(null);
      
      // Note: Hum list update nahi kar rahe kyunki Socket event karega
      // lekin modal close kar rahe hain
      if(!editingStaff) setSelectedStaff(null); 
      
      router.refresh(); 
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  // 🔹 Toggle Active/Inactive Status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;

      // Optimistic UI Update (Turant dikhao)
      const optimisticUpdate = (status: boolean) => {
          setStaffList((prev) =>
            prev.map((s) => {
              if (s.id === id) {
                const updated = { ...s, isActive: status };
                if (selectedStaff?.id === id) setSelectedStaff(updated);
                return updated;
              }
              return s;
            })
          );
      };

      optimisticUpdate(newStatus); // Pehle update kar do

      const res = await fetch(`/api/auth/staff/${id}/status`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Update failed");
        optimisticUpdate(currentStatus); // Error aaya to wapas purana status
      }

      toast.success(
        newStatus ? "Staff Activated 🚀" : "Staff Deactivated 💤"
      );
      
      router.refresh(); // Backup refresh
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  // 🔹 Permanent Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/auth/staff/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");

      // UI update socket se hoga, bas modal band karo
      setDeleteId(null);
      setSelectedStaff(null);
      router.refresh();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* 🌿 Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-5 border-b border-emerald-100 rounded-b-[2.5rem] shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                My Team 👥
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                Manage Access
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-emerald-600 text-white px-4 py-3 rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> <span className="hidden sm:inline">Add Staff</span>
          </button>
        </div>
      </div>

      {/* Staff List Grid */}
      <div className="px-6">
        {staffList.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <div className="bg-white p-5 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-4 shadow-sm">
              <Users size={40} className="text-emerald-300" />
            </div>
            <p className="text-slate-500 font-bold">No staff members yet 🌱</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {staffList.map((staff) => (
              <StaffCard
                key={staff.id}
                staff={staff}
                onClick={() => setSelectedStaff(staff)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedStaff && (
        <StaffDetailsModal
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
          onEdit={() => {
            setEditingStaff(selectedStaff);
            setIsFormOpen(true);
          }}
          onToggleStatus={() =>
            handleToggleStatus(selectedStaff.id, selectedStaff.isActive)
          }
          onDelete={() => setDeleteId(selectedStaff.id)}
        />
      )}

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

      {deleteId && (
        <DeleteConfirmModal
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}