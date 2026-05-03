import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { File, Link as LinkType } from "@workspace/api-client-react";
import { useUpdateFile, useUpdateLink, getListFilesQueryKey, getListLinksQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Settings, FileEdit, Link2 } from "lucide-react";

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: File | LinkType | null;
  type: 'file' | 'link';
}

export function EditAssetModal({ isOpen, onClose, asset, type }: EditAssetModalProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateFile = useUpdateFile();
  const updateLink = useUpdateLink();

  useEffect(() => {
    if (asset) {
      setTitle(asset.title);
      setUrl(asset.url);
    }
  }, [asset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;

    try {
      if (type === 'file') {
        await updateFile.mutateAsync({ id: asset.id, data: { title, url } });
        queryClient.invalidateQueries({ queryKey: getListFilesQueryKey() });
      } else {
        await updateLink.mutateAsync({ id: asset.id, data: { title, url } });
        queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
      }
      
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      toast({ title: "Updated successfully" });
      onClose();
    } catch (error) {
      toast({ title: "Error updating", variant: "destructive" });
    }
  };

  const isPending = updateFile.isPending || updateLink.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-md p-0 border-none bg-transparent shadow-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-[2rem] sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-100 ring-1 ring-slate-200/50"
        >
          <DialogHeader className="px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                {type === 'file' ? <FileEdit className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-lg font-black tracking-tight text-slate-900">
                  Edit {type === 'file' ? 'File' : 'Link'}
                </DialogTitle>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Modify asset properties</p>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Display Title</Label>
              <Input 
                id="edit-title" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                className="h-12 rounded-xl border-slate-100 bg-slate-50 focus-visible:bg-white focus-visible:ring-indigo-500 font-bold text-slate-900" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-url" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                {type === 'file' ? 'Storage URL' : 'Link Destination'}
              </Label>
              <Input 
                id="edit-url" 
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                required 
                className="h-12 rounded-xl border-slate-100 bg-slate-50 focus-visible:bg-white focus-visible:ring-indigo-500 font-medium text-slate-600" 
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-2xl text-slate-500 font-bold bg-slate-50 hover:bg-slate-100 transition-all">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1 h-12 rounded-2xl gradient-button font-black shadow-xl shadow-indigo-500/20 transition-all active:scale-95">
                {isPending ? "Syncing..." : "Update Vault"}
              </Button>
            </div>
          </form>

          <div className="flex items-center justify-center gap-2 bg-slate-50 py-4 border-t border-slate-100">
            <Settings className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Asset Configuration</span>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
