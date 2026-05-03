import { useListFolders, useCreateFolder, getListFoldersQueryKey } from "@workspace/api-client-react";
import { FolderCard } from "@/components/ItemCards";
import { Loader2, Folder as FolderIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Folders() {
  const { data: folders, isLoading } = useListFolders();
  const createFolder = useCreateFolder();
  const [newFolderName, setNewFolderName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    try {
      await createFolder.mutateAsync({ data: { name: newFolderName } });
      queryClient.invalidateQueries({ queryKey: getListFoldersQueryKey() });
      setIsOpen(false);
      setNewFolderName("");
      toast({ title: "Folder created" });
    } catch (e) {
      toast({ title: "Failed to create folder", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">Folders</h1>
          <p className="text-sm font-medium text-slate-500">Organize your items into directories.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 rounded-md bg-[#334155] px-5 text-sm font-bold text-white transition-all hover:bg-[#1e293b] active:scale-95 shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-xl border-slate-200 bg-white shadow-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#1e293b]">Create New Folder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Folder Name</label>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter name..."
                  className="h-10 rounded-md border-slate-200 bg-slate-50 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-slate-300"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="text-sm font-bold text-slate-500">
                  Cancel
                </Button>
                <Button type="submit" disabled={createFolder.isPending} className="h-10 rounded-md bg-[#334155] px-6 text-sm font-bold text-white hover:bg-[#1e293b]">
                  {createFolder.isPending ? "Creating..." : "Create Folder"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : !folders || folders.length === 0 ? (
        <div className="glass-panel p-16 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center mb-6 text-slate-300 border border-slate-100">
            <FolderIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#1e293b] mb-2">No folders found</h3>
          <p className="text-sm font-medium text-slate-500 max-w-xs">Start organizing your workspace by creating your first directory.</p>
          <Button onClick={() => setIsOpen(true)} variant="link" className="mt-4 text-blue-600 font-bold">Create one now</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {folders.map(folder => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
        </div>
      )}
    </div>
  );
}
