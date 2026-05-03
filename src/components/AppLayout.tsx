import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileIcon, 
  LinkIcon, 
  StickyNote, 
  Star, 
  Folder, 
  Settings, 
  Search,
  Plus,
  Loader2,
  File as FileFile,
  Image as ImageIcon,
  Video,
  FileText,
  ArrowRight,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddNewModal } from "./AddNewModal";
import { useState, useEffect, useRef } from "react";
import { useSearch, getSearchQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function Sidebar() {
  const [location] = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/files", label: "Files", icon: FileIcon },
    { href: "/links", label: "Links", icon: LinkIcon },
    { href: "/notes", label: "Notes", icon: StickyNote },
    { href: "/favorites", label: "Favorites", icon: Star },
    { href: "/folders", label: "Folders", icon: Folder },
  ];

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-40 flex h-[100dvh] w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="Vault Logo" className="h-9 w-9" />
          <span className="text-xl font-bold tracking-tight text-[#334155]">Vault</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <button
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
                location === item.href 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", location === item.href ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
              {item.label}
            </button>
          </Link>
        ))}
        
        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <div className="h-[1px] bg-slate-100 w-full" />
            </div>
            <Link href="/settings">
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
                  location === "/settings" 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Settings className={cn("w-5 h-5", location === "/settings" ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
                Settings
              </button>
            </Link>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
            >
              <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-600" />
              Logout
            </button>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 px-2 py-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-white shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-indigo-200/50 border border-white/20">
            {user?.email?.[0]?.toUpperCase() || 'G'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-black text-slate-900 truncate">{user?.email ? 'Girish' : 'Guest User'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
              {isAdmin ? 'Administrator' : 'Viewer Mode'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}


function Topbar() {
  const { user, isAdmin, signOut } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [initialType, setInitialType] = useState<'file' | 'link' | 'note' | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const handleOpenAdd = (type: 'file' | 'link' | 'note') => {
    setInitialType(type);
    setIsAddModalOpen(true);
  };

  const { data: searchResults, isLoading } = useSearch(
    { q: debouncedSearch },
    { query: { enabled: debouncedSearch.length > 0, queryKey: getSearchQueryKey({ q: debouncedSearch }) } }
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (path: string) => {
    setLocation(path);
    setIsSearchFocused(false);
    setSearchQuery("");
  };

  const getMimeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType === 'application/pdf') return FileText;
    return FileFile;
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 shadow-sm">
      <div className="relative w-80" ref={searchContainerRef}>
        <div className="group relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search assets..." 
            className="h-9 rounded-md border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-indigo-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />
        </div>

        {isSearchFocused && debouncedSearch.length > 0 && (
          <div className="absolute left-0 top-full mt-2 max-h-96 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
            {isLoading ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-300" />
              </div>
            ) : searchResults && (searchResults.files.length > 0 || searchResults.links.length > 0 || searchResults.notes.length > 0) ? (
              <div className="space-y-0.5 overflow-y-auto p-1">
                {searchResults.files.length > 0 && (
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Files</div>
                )}
                {searchResults.files.map(file => {
                  const Icon = getMimeIcon(file.mimeType);
                  return (
                    <button key={`file-${file.id}`} onClick={() => handleResultClick('/files')} className="flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-all hover:bg-indigo-50">
                      <Icon className="h-4 w-4 text-indigo-400" />
                      <span className="font-medium text-[#1e293b] truncate">{file.title}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">No results found</div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="h-9 rounded-md gradient-button px-4 text-xs font-bold text-white transition-all active:scale-95 shadow-md shadow-indigo-500/20"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Item
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 bg-white shadow-2xl p-1.5 animate-in zoom-in-95 duration-100">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Select Asset Type</div>
              <DropdownMenuItem onClick={() => handleOpenAdd('file')} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer focus:bg-blue-50 group">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-focus:bg-blue-600 group-focus:text-white transition-colors">
                  <FileFile className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">Upload File</span>
                  <span className="text-[10px] text-slate-400">Documents, images, etc.</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenAdd('link')} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer focus:bg-indigo-50 group mt-1">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-focus:bg-indigo-600 group-focus:text-white transition-colors">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">Add Web Link</span>
                  <span className="text-[10px] text-slate-400">URL, social, bookmarks</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenAdd('note')} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer focus:bg-purple-50 group mt-1">
                <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-focus:bg-purple-600 group-focus:text-white transition-colors">
                  <StickyNote className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">Create Note</span>
                  <span className="text-[10px] text-slate-400">Ideas, drafts, snippets</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {!user && (
          <Button 
            onClick={() => setLocation('/auth')}
            variant="outline"
            className="h-9 rounded-md px-4 text-xs font-bold text-slate-600 border-slate-200 hover:bg-slate-50 transition-all"
          >
            Login
          </Button>
        )}

        <div className="h-6 w-[1px] bg-slate-200" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 transition-all hover:bg-slate-50">
              <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100 uppercase">
                {user?.email?.[0] || 'G'}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-xl border-slate-200 bg-white shadow-2xl p-2 animate-in zoom-in-95 duration-100">
            <div className="flex items-center gap-3 p-3 border-b border-slate-50 mb-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                {user?.email?.[0] || 'G'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-900 truncate">{user?.email || 'Guest User'}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">{isAdmin ? 'Administrator' : 'Viewer'}</span>
              </div>
            </div>
            {user && (
              <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer focus:bg-red-50 text-red-600 group">
                <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-focus:bg-red-600 group-focus:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold">Logout</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AddNewModal 
        isOpen={isAddModalOpen} 
        onClose={() => { setIsAddModalOpen(false); setInitialType(null); }} 
        initialType={initialType}
      />
    </header>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell flex min-h-screen bg-[#f8fafc] font-sans text-[#334155]">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 pt-14 min-h-[calc(100vh-3.5rem)]">
          <div className="mx-auto max-w-7xl p-8 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
