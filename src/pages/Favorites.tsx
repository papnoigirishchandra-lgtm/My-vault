import { useListFavorites } from "@workspace/api-client-react";
import { FileCard, LinkCard, NoteCard } from "@/components/ItemCards";
import { Loader2, Star } from "lucide-react";

export default function Favorites() {
  const { data: favorites, isLoading } = useListFavorites();

  const hasItems = favorites && (favorites.files.length > 0 || favorites.links.length > 0 || favorites.notes.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-yellow-500 border border-slate-100">
          <Star className="w-6 h-6 fill-yellow-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">Favorites</h1>
          <p className="text-sm font-medium text-slate-500">Your curated collection of important items.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : !hasItems ? (
        <div className="glass-panel p-16 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center mb-6 text-slate-300 border border-slate-100">
            <Star className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#1e293b] mb-2">No favorites yet</h3>
          <p className="text-sm font-medium text-slate-500 max-w-xs">Star items throughout your vault to collect them here for quick access.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {favorites.files.length > 0 && (
            <section className="space-y-5">
              <h2 className="text-base font-bold tracking-tight text-[#1e293b]">Files</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {favorites.files.map(file => <FileCard key={file.id} file={file} />)}
              </div>
            </section>
          )}

          {favorites.links.length > 0 && (
            <section className="space-y-5">
              <h2 className="text-base font-bold tracking-tight text-[#1e293b]">Links</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {favorites.links.map(link => <LinkCard key={link.id} link={link} />)}
              </div>
            </section>
          )}

          {favorites.notes.length > 0 && (
            <section className="space-y-5">
              <h2 className="text-base font-bold tracking-tight text-[#1e293b]">Notes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {favorites.notes.map(note => <NoteCard key={note.id} note={note} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
