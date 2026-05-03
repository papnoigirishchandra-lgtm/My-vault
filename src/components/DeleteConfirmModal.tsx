import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  type: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, type }: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 ring-1 ring-slate-200/50"
        >
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-sm">
              <Trash2 className="h-10 w-10" />
            </div>
            
            <h3 className="mb-2 text-xl font-black tracking-tight text-slate-900">Delete {type}?</h3>
            <p className="text-sm font-medium leading-relaxed text-slate-500">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{title}"</span>? This action cannot be undone and the file will be removed from your vault forever.
            </p>
          </div>

          <div className="flex gap-4 p-8 pt-0">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl text-slate-500 hover:text-slate-900 font-bold bg-slate-50 hover:bg-slate-100 transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xl shadow-red-500/20 transition-all active:scale-95"
            >
              Delete Permanently
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-2 bg-slate-50 py-4 border-t border-slate-100">
            <AlertCircle className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Security Confirmation</span>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
