import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileIcon, LinkIcon, StickyNote, ArrowLeft, Upload, FileUp, MousePointer2, Link2, Globe, Laptop } from "lucide-react";
import { useCreateFile, useCreateLink, useCreateNote, getListFilesQueryKey, getListLinksQueryKey, getListNotesQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type AddType = 'file' | 'link' | 'note' | null;
type FileSource = 'local' | 'url';

export function AddNewModal({ 
  isOpen, 
  onClose,
  initialType
}: { 
  isOpen: boolean; 
  onClose: () => void;
  initialType?: AddType;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<AddType>(null);
  const [fileSource, setFileSource] = useState<FileSource>('local');
  
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState("application/octet-stream");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  useEffect(() => {
    if (initialType && isOpen) {
      setSelectedType(initialType);
      setStep(2);
    }
  }, [initialType, isOpen]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createFile = useCreateFile();
  const createLink = useCreateLink();
  const createNote = useCreateNote();
  const { user } = useAuth();

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedType(null);
      setFileSource('local');
      setTitle("");
      setUrl("");
      setContent("");
      setFileName("");
      setMimeType("application/octet-stream");
      setSelectedFile(null);
      setIsProcessingFile(false);
    }, 300);
  };

  const handleSelectType = (type: AddType) => {
    setSelectedType(type);
    setStep(2);
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    setTitle(file.name.split('.')[0]);
    setMimeType(file.type || "application/octet-stream");
    toast({ title: "File attached", description: `${file.name} is ready for upload.` });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Paste support
  useEffect(() => {
    if (!isOpen || selectedType !== 'file' || fileSource !== 'local') return;

    const handlePaste = (e: ClipboardEvent) => {
      const file = e.clipboardData?.files?.[0];
      if (file) processFile(file);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, selectedType, fileSource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !title) return;
    
    let finalUrl = url;

    try {
      setIsProcessingFile(true);

      if (selectedType === 'file' && fileSource === 'local' && selectedFile) {
        // 1. Upload to Supabase Storage
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('vault')
          .upload(filePath, selectedFile);

        if (uploadError) {
          // If bucket doesn't exist, this might fail. We should tell user.
          if (uploadError.message.includes('bucket not found')) {
            throw new Error("Storage bucket 'vault' not found. Please create it in your Supabase dashboard.");
          }
          throw uploadError;
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('vault')
          .getPublicUrl(filePath);
          
        finalUrl = publicUrl;
      }

      if (selectedType === 'file') {
        await createFile.mutateAsync({
          data: {
            title,
            fileName: fileName || title,
            mimeType,
            size: selectedFile?.size || Math.floor(Math.random() * 5000000) + 100000,
            url: finalUrl || `https://example.com/vault/${title}`,
          }
        });
        queryClient.invalidateQueries({ queryKey: getListFilesQueryKey() });
      } else if (selectedType === 'link') {
        await createLink.mutateAsync({
          data: { title, url: finalUrl }
        });
        queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
      } else if (selectedType === 'note') {
        await createNote.mutateAsync({
          data: { title, content }
        });
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      }
      
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      toast({ title: "Successfully added to vault" });
      handleClose();
    } catch (error: any) {
      toast({ 
        title: "Error adding item", 
        description: error.message || "An unexpected error occurred",
        variant: "destructive" 
      });
    } finally {
      setIsProcessingFile(false);
    }
  };

  const isPending = createFile.isPending || createLink.isPending || createNote.isPending || isProcessingFile;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl p-0 border-none bg-transparent shadow-none gap-0">
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 ring-1 ring-slate-200/50">
          <DialogHeader className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2 -ml-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 shadow-sm">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="space-y-1">
                  <DialogTitle className="text-xl font-black tracking-tight text-slate-900">
                    {step === 1 ? "Add New Asset" : `Configure ${selectedType?.charAt(0).toUpperCase()}${selectedType?.slice(1)}`}
                  </DialogTitle>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {step === 1 ? "Choose your asset type" : "Complete the details below"}
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid grid-cols-3 gap-6"
                >
                  {[
                    { type: 'file' as AddType, icon: FileIcon, label: 'Upload File', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600' },
                    { type: 'link' as AddType, icon: LinkIcon, label: 'Add Link', color: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600' },
                    { type: 'note' as AddType, icon: StickyNote, label: 'Create Note', color: 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-600' }
                  ].map((option) => (
                    <button 
                      key={option.type}
                      onClick={() => handleSelectType(option.type)}
                      className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/5 group"
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:text-white",
                        option.color.split(' ').slice(0,3).join(' '),
                        option.color.split(' ').pop()
                      )}>
                        <option.icon className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">{option.label}</span>
                    </button>
                  ))}
                </motion.div>
              ) : (
                <motion.form 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                >
                  {selectedType === 'file' && (
                    <div className="space-y-6">
                      <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                        <button 
                          type="button"
                          onClick={() => setFileSource('local')}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            fileSource === 'local' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          <Laptop className="w-3.5 h-3.5" /> From Device
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFileSource('url')}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            fileSource === 'url' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          <Globe className="w-3.5 h-3.5" /> Remote URL
                        </button>
                      </div>

                      {fileSource === 'local' ? (
                        <div 
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            "group relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 transition-all cursor-pointer",
                            isDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
                          )}
                        >
                          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                          <div className={cn(
                            "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
                            isDragging ? "bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200" : "bg-indigo-50 text-indigo-600"
                          )}>
                            {fileName ? <FileUp className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-sm font-black text-slate-900">
                              {fileName ? fileName : "Drag, paste or drop file here"}
                            </p>
                            <p className="text-xs font-medium text-slate-400">
                              {fileName ? "Click to change file" : "or click to browse from device"}
                            </p>
                          </div>
                          {isDragging && (
                            <div className="absolute inset-0 bg-indigo-600/5 backdrop-blur-[1px] flex items-center justify-center rounded-2xl border-2 border-indigo-500">
                              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-indigo-100">
                                <MousePointer2 className="w-4 h-4 text-indigo-600" />
                                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Release to drop</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="file-url" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Direct File URL</Label>
                          <div className="relative">
                            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <Input 
                              id="file-url" 
                              value={url} 
                              onChange={e => setUrl(e.target.value)} 
                              required 
                              className="h-12 pl-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:bg-white focus-visible:ring-indigo-500" 
                              placeholder="https://example.com/document.pdf"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Asset Title</Label>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      required 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:bg-white focus-visible:ring-indigo-500 font-medium" 
                      placeholder="Give it a recognizable name..."
                      autoFocus
                    />
                  </div>

                  {selectedType === 'link' && (
                    <div className="space-y-2">
                      <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">URL Address</Label>
                      <Input 
                        id="url" 
                        type="url"
                        value={url} 
                        onChange={e => setUrl(e.target.value)} 
                        required 
                        className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:bg-white" 
                        placeholder="https://example.com"
                      />
                    </div>
                  )}

                  {selectedType === 'note' && (
                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Note Content</Label>
                      <Textarea 
                        id="content" 
                        value={content} 
                        onChange={e => setContent(e.target.value)} 
                        className="rounded-xl border-slate-200 bg-slate-50 focus-visible:bg-white min-h-[140px] resize-none p-4" 
                        placeholder="Start typing your thoughts..."
                      />
                    </div>
                  )}

                  <div className="pt-4 flex justify-end gap-4">
                    <Button type="button" variant="ghost" onClick={() => setStep(1)} className="h-11 px-6 rounded-xl text-slate-400 hover:text-slate-900 font-bold">
                      Back
                    </Button>
                    <Button type="submit" disabled={isPending} className="h-11 px-8 rounded-xl gradient-button font-black shadow-xl shadow-indigo-500/20 transition-all active:scale-95">
                      {isPending ? "Syncing..." : "Save to Vault"}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
