import { useListNotes } from "@workspace/api-client-react";
import { NoteCard } from "@/components/ItemCards";
import { Loader2, StickyNote } from "lucide-react";

export default function Notes() {
  const { data: notes, isLoading } = useListNotes();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-[#1e293b] border border-slate-100">
          <StickyNote className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">Notes</h1>
          <p className="text-sm font-medium text-slate-500">Capture and organize your thoughts and documentation.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : !notes || notes.length === 0 ? (
        <div className="glass-panel p-16 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center mb-6 text-slate-300 border border-slate-100">
            <StickyNote className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#1e293b] mb-2">No notes found</h3>
          <p className="text-sm font-medium text-slate-500 max-w-xs">Create your first note to start documenting your ideas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {notes.map(note => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
