/**
 * Digital Ecosystem
 */
import { useGetDashboard } from "@workspace/api-client-react";
import { FileCard, LinkCard, NoteCard } from "@/components/ItemCards";
import { ArrowUpRight, Folder as FolderIcon, FileIcon, LinkIcon, Loader2, StickyNote, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const stats = [
  {
    href: "/files",
    label: "Files",
    key: "files",
    icon: FileIcon,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    hoverColor: "group-hover:bg-blue-600",
  },
  {
    href: "/links",
    label: "Links",
    key: "links",
    icon: LinkIcon,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    hoverColor: "group-hover:bg-indigo-600",
  },
  {
    href: "/notes",
    label: "Notes",
    key: "notes",
    icon: StickyNote,
    color: "bg-purple-50 text-purple-600 border-purple-100",
    hoverColor: "group-hover:bg-purple-600",
  },
  {
    href: "/folders",
    label: "Folders",
    key: "folders",
    icon: FolderIcon,
    color: "bg-slate-50 text-slate-600 border-slate-100",
    hoverColor: "group-hover:bg-slate-600",
  },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const { data, isLoading } = useGetDashboard();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      <motion.div variants={item} className="glass-panel rounded-2xl p-10 border border-slate-200 bg-white shadow-xl shadow-slate-200/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <TrendingUp className="w-32 h-32 text-indigo-600" />
        </div>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Workspace Active</p>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              {user ? (
                <>Hello, <span className="gradient-text">Girish</span></>
              ) : (
                <>Hello, <span className="gradient-text">How are you?</span></>
              )}
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-lg leading-relaxed">
              {user 
                ? "Your personal vault is synchronized and secure. Here's a quick look at your digital ecosystem today."
                : "Welcome to this professional digital vault. Browse the curated collection of assets and insights below."}
            </p>
          </div>
          <div className="flex items-center gap-12 rounded-2xl bg-indigo-50/30 p-8 border border-indigo-100/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-3xl font-black text-indigo-600">{data.counts.files + data.counts.links + data.counts.notes}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mt-1">Total Assets</div>
            </div>
            <div className="h-12 w-[1px] bg-indigo-200/50" />
            <div className="text-center">
              <div className="text-3xl font-black text-indigo-600">{data.counts.folders}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mt-1">Directories</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const count = data.counts[stat.key as keyof typeof data.counts] ?? 0;
          return (
            <motion.div key={stat.href} variants={item}>
              <Link
                href={stat.href}
                className="glass-card group flex items-center justify-between rounded-2xl p-7 transition-all hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 bg-white border border-slate-100"
              >
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
                    stat.color,
                    stat.hoverColor,
                    "group-hover:text-white group-hover:shadow-lg group-hover:scale-110"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-800">{count}</div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</div>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                  <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="space-y-16">
        {data.recentFiles.length > 0 && (
          <motion.section variants={item} className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-blue-500" />
                <h2 className="text-lg font-black tracking-tight text-slate-900">Recent Files</h2>
              </div>
              <Link href="/files" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">View Collection</Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.recentFiles.map(file => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          </motion.section>
        )}

        {data.recentLinks.length > 0 && (
          <motion.section variants={item} className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-indigo-500" />
                <h2 className="text-lg font-black tracking-tight text-slate-900">Recent Links</h2>
              </div>
              <Link href="/links" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">View Collection</Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.recentLinks.map(link => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>
          </motion.section>
        )}

        {data.recentNotes.length > 0 && (
          <motion.section variants={item} className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-purple-500" />
                <h2 className="text-lg font-black tracking-tight text-slate-900">Recent Notes</h2>
              </div>
              <Link href="/notes" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">View Collection</Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.recentNotes.map(note => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </motion.div>
  );
}
