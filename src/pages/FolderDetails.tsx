import { useGetFolder, getGetFolderQueryKey } from "@workspace/api-client-react";
import { FileCard, LinkCard, NoteCard } from "@/components/ItemCards";
import { Loader2, Folder as FolderIcon, ArrowLeft } from "lucide-react";
import { Link, useParams } from "wouter";

export default function FolderDetails() {
  const params = useParams();
  const folderId = parseInt(params.id || "0", 10);
  
  const { data, isLoading } = useGetFolder(folderId, {
    query: { enabled: !!folderId, queryKey: getGetFolderQueryKey(folderId) }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (!data) return (
    <div className="p-8 text-center text-slate-400 font-medium">Folder not found.</div>
  );

  const isEmpty = data.files.length === 0 && data.links.length === 0 && data.notes.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/folders" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-[#1e293b] transition-colors mb-6 group">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Back to Folders
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-[#1e293b] border border-slate-100">
            <FolderIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">
              {data.folder.name}
            </h1>
            <p className="text-xs font-medium text-slate-400">Created on {new Date(data.folder.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="glass-panel p-16 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center mb-6 text-slate-300 border border-slate-100">
            <FolderIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#1e293b] mb-2">Folder is empty</h3>
          <p className="text-sm font-medium text-slate-500 max-w-xs">There are no items in this directory yet.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {data.files.length > 0 && (
            <section className="space-y-5">
              <h2 className="text-base font-bold tracking-tight text-[#1e293b]">Files</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {data.files.map(file => <FileCard key={file.id} file={file} />)}
              </div>
            </section>
          )}

          {data.links.length > 0 && (
            <section className="space-y-5">
              <h2 className="text-base font-bold tracking-tight text-[#1e293b]">Links</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {data.links.map(link => <LinkCard key={link.id} link={link} />)}
              </div>
            </section>
          )}

          {data.notes.length > 0 && (
            <section className="space-y-5">
              <h2 className="text-base font-bold tracking-tight text-[#1e293b]">Notes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {data.notes.map(note => <NoteCard key={note.id} note={note} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
