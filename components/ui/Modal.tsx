import { X } from "lucide-react";

// --- MODAL ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full md:w-120 md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0 bg-white sticky top-0">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
