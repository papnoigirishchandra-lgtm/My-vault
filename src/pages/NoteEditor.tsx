import { useState, useEffect, useRef } from "react";
import { useGetNote, useUpdateNote, getGetNoteQueryKey, getListNotesQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Loader2, ArrowLeft, Save, Edit2, Check, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";

export default function NoteEditor() {
  const { isAdmin } = useAuth();
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const { data: note, isLoading } = useGetNote(id, {
    query: { enabled: !!id, queryKey: getGetNoteQueryKey(id) }
  });

  const updateNote = useUpdateNote();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const initializedForId = useRef<number | null>(null);

  // Init
  useEffect(() => {
    if (note && initializedForId.current !== id) {
      initializedForId.current = id;
      setTitle(note.title);
      setContent(note.content || "");
    }
  }, [note, id]);

  const handleSave = async () => {
    if (!id || !isAdmin) return;
    
    setIsSaving(true);
    try {
      await updateNote.mutateAsync({ id, data: { title, content } });
      
      // Update cache
      queryClient.invalidateQueries({ queryKey: getGetNoteQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      
      setIsSaving(false);
      setIsEditing(false);
      toast({ title: "Note saved successfully" });
    } catch (e) {
      setIsSaving(false);
      toast({ title: "Failed to save note", variant: "destructive" });
    }
  };

  const handleCancel = () => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || "");
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
          <X className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Note not found</h3>
          <p className="text-sm text-slate-400 max-w-xs">The note you're looking for might have been moved or deleted.</p>
        </div>
        <Link href="/notes">
          <Button variant="outline" className="rounded-xl border-slate-200">Go back to Notes</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-10rem)] flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50"
    >
      {/* Header */}
      <div className="h-20 border-b border-slate-100 bg-white flex items-center justify-between px-8">
        <div className="flex items-center gap-6 flex-1">
          <Link href="/notes" className="text-slate-400 hover:text-indigo-600 transition-all p-2 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.h1 
                key="title-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-xl font-black tracking-tight text-slate-900 truncate flex-1"
              >
                {title || "Untitled Note"}
              </motion.h1>
            ) : (
              <motion.div 
                key="title-edit"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 max-w-2xl"
              >
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 rounded-xl text-lg font-bold bg-slate-50 border-slate-100 focus-visible:bg-white focus-visible:ring-indigo-500"
                  placeholder="Give your note a title..."
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="h-11 px-6 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100 transition-all font-bold group"
                >
                  <Edit2 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Edit Note
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={handleCancel}
                    className="h-11 px-6 rounded-xl text-slate-400 hover:text-slate-900 font-bold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-11 px-6 rounded-xl gradient-button font-black shadow-lg shadow-indigo-500/20"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Note
                      </>
                    )}
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Editor/Viewer */}
      <div className="flex-1 relative bg-slate-50/20">
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
          {!isEditing ? (
            <div className="p-12 prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 font-medium leading-relaxed text-lg min-h-full">
                {content || <span className="text-slate-300 italic">No content yet.</span>}
              </div>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your thoughts, ideas, or documentation..."
              className="w-full h-full bg-transparent text-slate-800 p-12 resize-none focus:outline-none placeholder:text-slate-300 font-medium leading-relaxed text-lg min-h-full"
              autoFocus
            />
          )}
        </div>
      </div>
      
      {/* Footer bar */}
      <div className="h-12 border-t border-slate-100 bg-white flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {note.isFavorite ? "Personal Favorite" : "Draft Asset"}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Last updated {new Date(note.updatedAt).toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}
