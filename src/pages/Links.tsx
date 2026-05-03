import { useListLinks } from "@workspace/api-client-react";
import { LinkCard } from "@/components/ItemCards";
import { Loader2, LinkIcon } from "lucide-react";

export default function Links() {
  const { data: links, isLoading } = useListLinks();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-[#1e293b] border border-slate-100">
          <LinkIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">Links</h1>
          <p className="text-sm font-medium text-slate-500">Your collection of curated web resources.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : !links || links.length === 0 ? (
        <div className="glass-panel p-16 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center mb-6 text-slate-300 border border-slate-100">
            <LinkIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#1e293b] mb-2">No links found</h3>
          <p className="text-sm font-medium text-slate-500 max-w-xs">Save your first bookmark to keep track of important web content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {links.map(link => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      )}
    </div>
  );
}
