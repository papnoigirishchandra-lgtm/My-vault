import { File, Link as LinkType, Note, Folder as FolderType } from "@workspace/api-client-react";
import { formatBytes, formatDate } from "@/lib/utils";
import { 
  FileIcon, FileText, Image as ImageIcon, Video, 
  LinkIcon, StickyNote, Star, MoreVertical, 
  Folder as FolderIcon, Trash2, ExternalLink, Edit2
} from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateFile, useDeleteFile, useUpdateLink, useDeleteLink, useUpdateNote, useDeleteNote, getListFilesQueryKey, getListLinksQueryKey, getListNotesQueryKey, getListFavoritesQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { EditAssetModal } from "./EditAssetModal";

const getMimeIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return ImageIcon;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType === 'application/pdf') return FileText;
  if (mimeType.includes('word') || mimeType.includes('officedocument.wordprocessingml')) return FileText;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return Video; // Using Video icon as placeholder for PPT if needed, or stick to File
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileText;
  return FileIcon;
};

import { useAuth } from "@/contexts/AuthContext";

function CardActions({ 
  isFavorite, 
  onToggleFavorite, 
  onDeleteRequest,
  onEditRequest,
  type 
}: { 
  isFavorite: boolean; 
  onToggleFavorite: () => void; 
  onDeleteRequest: () => void;
  onEditRequest: () => void;
  type: string;
}) {
  const { isAdmin } = useAuth();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 bg-white shadow-xl p-1.5">
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} className="cursor-pointer focus:bg-slate-50 rounded-lg">
          <Star className={cn("w-4 h-4 mr-2", isFavorite && "fill-yellow-500 text-yellow-500")} />
          {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </DropdownMenuItem>
        
        {isAdmin && (
          <>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditRequest(); }} className="cursor-pointer focus:bg-slate-50 rounded-lg">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Details
            </DropdownMenuItem>
            <div className="h-[1px] bg-slate-100 my-1" />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDeleteRequest(); }} className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer font-semibold rounded-lg">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {type}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FileCard({ file }: { file: File }) {
  const Icon = getMimeIcon(file.mimeType);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateFile = useUpdateFile();
  const deleteFile = useDeleteFile();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleToggleFavorite = async () => {
    try {
      await updateFile.mutateAsync({ id: file.id, data: { isFavorite: !file.isFavorite } });
      queryClient.invalidateQueries({ queryKey: getListFilesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
    } catch (e) {
      toast({ title: "Failed to update favorite", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFile.mutateAsync({ id: file.id });
      queryClient.invalidateQueries({ queryKey: getListFilesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      toast({ title: "File deleted successfully" });
    } catch (e) {
      toast({ title: "Failed to delete file", variant: "destructive" });
    }
  };

  const handleOpen = () => {
    if (!file.url || file.url.includes("example.com/file")) {
      toast({ title: "Mock File Notice", description: "In this demo, local uploads are simulated. Please edit and provide a real URL to open actual files.", variant: "default" });
      return;
    }

    // Identify Office documents (PPT, Word, Excel) for in-browser previewing
    const isOfficeDoc = 
      file.mimeType.includes('presentation') || 
      file.mimeType.includes('powerpoint') || 
      file.mimeType.includes('officedocument') ||
      file.url.match(/\.(pptx?|docx?|xlsx?)$/i);

    if (isOfficeDoc) {
      // Use Microsoft Office Online Viewer for high-end in-browser preview
      const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(file.url)}`;
      window.open(officeViewerUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Natively supported files (PDF, Images, etc.)
      window.open(file.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getFormatLabel = (mime: string) => {
    if (mime.includes('pdf')) return 'PDF Document';
    if (mime.includes('word')) return 'Word Doc';
    if (mime.includes('presentation') || mime.includes('powerpoint')) return 'PPT Presentation';
    if (mime.includes('spreadsheet') || mime.includes('excel')) return 'Excel Sheet';
    if (mime.startsWith('image/')) return 'Image';
    return mime.split('/')[1]?.toUpperCase() || 'File';
  };

  return (
    <>
      <div 
        onClick={handleOpen}
        className="glass-card flex flex-col gap-4 rounded-xl p-5 group transition-all cursor-pointer hover:border-blue-200 hover:shadow-xl active:scale-[0.98]"
      >
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Icon className="h-6 w-6" />
          </div>
          <CardActions 
            isFavorite={file.isFavorite} 
            onToggleFavorite={handleToggleFavorite} 
            onDeleteRequest={() => setIsDeleteModalOpen(true)} 
            onEditRequest={() => setIsEditModalOpen(true)}
            type="file" 
          />
        </div>
        
        <div>
          <h4 className="text-sm font-bold tracking-tight text-slate-900 truncate group-hover:text-blue-600 transition-colors" title={file.title}>{file.title}</h4>
          <p className="mt-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{getFormatLabel(file.mimeType)}</p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4 text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1">
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            {formatBytes(file.size)}
          </span>
          <span>{formatDate(file.createdAt)}</span>
        </div>
      </div>

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDelete}
        title={file.title}
        type="File"
      />

      <EditAssetModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        asset={file} 
        type="file" 
      />
    </>
  );
}

export function LinkCard({ link }: { link: LinkType }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleToggleFavorite = async () => {
    try {
      await updateLink.mutateAsync({ id: link.id, data: { isFavorite: !link.isFavorite } });
      queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
    } catch (e) {
      toast({ title: "Failed to update favorite", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLink.mutateAsync({ id: link.id });
      queryClient.invalidateQueries({ queryKey: getListLinksQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      toast({ title: "Link deleted successfully" });
    } catch (e) {
      toast({ title: "Failed to delete link", variant: "destructive" });
    }
  };

  const handleOpen = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div 
        onClick={handleOpen}
        className="glass-card group block flex flex-col gap-4 rounded-xl p-5 transition-all cursor-pointer hover:border-indigo-200 hover:shadow-xl active:scale-[0.98]"
      >
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-slate-50 text-slate-600 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            {link.favicon ? <img src={link.favicon} alt="" className="h-6 w-6 object-contain group-hover:brightness-0 group-hover:invert" /> : <LinkIcon className="h-6 w-6" />}
          </div>
          <CardActions 
            isFavorite={link.isFavorite} 
            onToggleFavorite={handleToggleFavorite} 
            onDeleteRequest={() => setIsDeleteModalOpen(true)} 
            onEditRequest={() => setIsEditModalOpen(true)}
            type="link" 
          />
        </div>
        
        <div>
          <h4 className="text-sm font-bold tracking-tight text-slate-900 truncate group-hover:text-indigo-600 transition-colors" title={link.title}>{link.title}</h4>
          <p className="mt-1 text-[10px] font-semibold text-blue-600 truncate block">
            {new URL(link.url).hostname}
            <ExternalLink className="inline h-2 w-2 ml-1" />
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4 text-[10px] font-bold text-slate-400">
          <span>Link</span>
          <span>{formatDate(link.createdAt)}</span>
        </div>
      </div>

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDelete}
        title={link.title}
        type="Link"
      />

      <EditAssetModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        asset={link} 
        type="link" 
      />
    </>
  );
}

export function NoteCard({ note }: { note: Note }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleToggleFavorite = async () => {
    try {
      await updateNote.mutateAsync({ id: note.id, data: { isFavorite: !note.isFavorite } });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
    } catch (e) {
      toast({ title: "Failed to update favorite", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote.mutateAsync({ id: note.id });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      toast({ title: "Note deleted successfully" });
    } catch (e) {
      toast({ title: "Failed to delete note", variant: "destructive" });
    }
  };

  return (
    <>
      <Link href={`/notes/${note.id}`} className="glass-card group block flex flex-col gap-4 rounded-xl p-5 transition-all">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
            <StickyNote className="h-6 w-6" />
          </div>
          <CardActions 
            isFavorite={note.isFavorite} 
            onToggleFavorite={handleToggleFavorite} 
            onDeleteRequest={() => setIsDeleteModalOpen(true)} 
            onEditRequest={() => {}} // Notes have their own editor page
            type="note" 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold tracking-tight text-slate-900 truncate mb-1" title={note.title}>{note.title}</h4>
          <p className="line-clamp-3 text-xs font-medium leading-relaxed text-slate-500">{note.content || "No content"}</p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4 text-[10px] font-bold text-slate-400">
          <span>Note</span>
          <span>{formatDate(note.createdAt)}</span>
        </div>
      </Link>

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDelete}
        title={note.title}
        type="Note"
      />
    </>
  );
}


export function FolderCard({ folder }: { folder: FolderType }) {
  return (
    <Link href={`/folders/${folder.id}`} className="glass-card group flex items-center gap-4 rounded-xl p-4 transition-all hover:bg-slate-50">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
        <FolderIcon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold tracking-tight text-slate-900 truncate">{folder.name}</h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Directory</p>
      </div>
      <div className="text-[10px] font-black text-slate-400 uppercase">
        Folder
      </div>
    </Link>
  );
}
