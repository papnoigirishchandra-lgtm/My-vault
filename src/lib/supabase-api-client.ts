import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

export type File = {
  id: number;
  title: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  isFavorite: boolean;
  folderId?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Link = {
  id: number;
  title: string;
  url: string;
  favicon?: string;
  isFavorite: boolean;
  folderId?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: number;
  title: string;
  content?: string;
  isFavorite: boolean;
  folderId?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Folder = {
  id: number;
  name: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

type QueryOptions<T> = {
  query?: {
    enabled?: boolean;
    queryKey?: readonly unknown[];
  };
};

const getFavicon = (url: string) => {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
  } catch {
    return undefined;
  }
};

// Map database fields to frontend fields if they differ
const mapFile = (f: any): File => ({
  id: f.id,
  title: f.title,
  fileName: f.file_name,
  mimeType: f.mime_type,
  size: f.size,
  url: f.url,
  isFavorite: f.is_favorite,
  folderId: f.folder_id,
  createdAt: f.created_at,
  updatedAt: f.updated_at,
});

const mapLink = (l: any): Link => ({
  id: l.id,
  title: l.title,
  url: l.url,
  favicon: l.favicon,
  isFavorite: l.is_favorite,
  folderId: l.folder_id,
  createdAt: l.created_at,
  updatedAt: l.updated_at,
});

const mapNote = (n: any): Note => ({
  id: n.id,
  title: n.title,
  content: n.content,
  isFavorite: n.is_favorite,
  folderId: n.folder_id,
  createdAt: n.created_at,
  updatedAt: n.updated_at,
});

const mapFolder = (fold: any): Folder => ({
  id: fold.id,
  name: fold.name,
  itemCount: 0, // Will be calculated
  createdAt: fold.created_at,
  updatedAt: fold.updated_at,
});

export const getListFilesQueryKey = () => ["files"] as const;
export const getListLinksQueryKey = () => ["links"] as const;
export const getListNotesQueryKey = () => ["notes"] as const;
export const getListFoldersQueryKey = () => ["folders"] as const;
export const getListFavoritesQueryKey = () => ["favorites"] as const;
export const getGetDashboardQueryKey = () => ["dashboard"] as const;
export const getGetNoteQueryKey = (id: number) => ["note", id] as const;
export const getGetFolderQueryKey = (id: number) => ["folder", id] as const;
export const getSearchQueryKey = ({ q }: { q: string }) => ["search", q] as const;

export const useListFiles = () =>
  useQuery({
    queryKey: getListFilesQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapFile);
    },
  });

export const useListLinks = () =>
  useQuery({
    queryKey: getListLinksQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapLink);
    },
  });

export const useListNotes = () =>
  useQuery({
    queryKey: getListNotesQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapNote);
    },
  });

export const useListFolders = () =>
  useQuery({
    queryKey: getListFoldersQueryKey(),
    queryFn: async () => {
      const { data: folders, error: foldersError } = await supabase
        .from("folders")
        .select("*")
        .order("name");
      if (foldersError) throw foldersError;

      // Get counts for each folder
      const { data: fileCounts } = await supabase.from("files").select("folder_id");
      const { data: linkCounts } = await supabase.from("links").select("folder_id");
      const { data: noteCounts } = await supabase.from("notes").select("folder_id");

      return (folders || []).map((f) => {
        const count =
          (fileCounts?.filter((c) => c.folder_id === f.id).length || 0) +
          (linkCounts?.filter((c) => c.folder_id === f.id).length || 0) +
          (noteCounts?.filter((c) => c.folder_id === f.id).length || 0);
        return { ...mapFolder(f), itemCount: count };
      });
    },
  });

export const useGetDashboard = () =>
  useQuery({
    queryKey: getGetDashboardQueryKey(),
    queryFn: async () => {
      const [{ data: files }, { data: links }, { data: notes }, { data: folders }] = await Promise.all([
        supabase.from("files").select("*").order("updated_at", { ascending: false }).limit(4),
        supabase.from("links").select("*").order("updated_at", { ascending: false }).limit(4),
        supabase.from("notes").select("*").order("updated_at", { ascending: false }).limit(4),
        supabase.from("folders").select("*").order("name"),
      ]);

      const [{ count: filesCount }, { count: linksCount }, { count: notesCount }, { count: foldersCount }] =
        await Promise.all([
          supabase.from("files").select("*", { count: "exact", head: true }),
          supabase.from("links").select("*", { count: "exact", head: true }),
          supabase.from("notes").select("*", { count: "exact", head: true }),
          supabase.from("folders").select("*", { count: "exact", head: true }),
        ]);

      return {
        counts: {
          files: filesCount || 0,
          links: linksCount || 0,
          notes: notesCount || 0,
          folders: foldersCount || 0,
        },
        recentFiles: (files || []).map(mapFile),
        recentLinks: (links || []).map(mapLink),
        recentNotes: (notes || []).map(mapNote),
        folders: (folders || []).map(mapFolder),
      };
    },
  });

export const useListFavorites = () =>
  useQuery({
    queryKey: getListFavoritesQueryKey(),
    queryFn: async () => {
      const [{ data: files }, { data: links }, { data: notes }] = await Promise.all([
        supabase.from("files").select("*").eq("is_favorite", true),
        supabase.from("links").select("*").eq("is_favorite", true),
        supabase.from("notes").select("*").eq("is_favorite", true),
      ]);

      return {
        files: (files || []).map(mapFile),
        links: (links || []).map(mapLink),
        notes: (notes || []).map(mapNote),
      };
    },
  });

export const useGetNote = (id: number, options?: QueryOptions<Note | undefined>) =>
  useQuery({
    queryKey: options?.query?.queryKey ?? getGetNoteQueryKey(id),
    queryFn: async () => {
      const { data, error } = await supabase.from("notes").select("*").eq("id", id).single();
      if (error) return undefined;
      return mapNote(data);
    },
    enabled: options?.query?.enabled ?? true,
  });

export const useGetFolder = (
  id: number,
  options?: QueryOptions<{ folder: Folder; files: File[]; links: Link[]; notes: Note[] } | undefined>,
) =>
  useQuery({
    queryKey: options?.query?.queryKey ?? getGetFolderQueryKey(id),
    queryFn: async () => {
      const { data: folder, error: folderError } = await supabase
        .from("folders")
        .select("*")
        .eq("id", id)
        .single();
      if (folderError || !folder) return undefined;

      const [{ data: files }, { data: links }, { data: notes }] = await Promise.all([
        supabase.from("files").select("*").eq("folder_id", id),
        supabase.from("links").select("*").eq("folder_id", id),
        supabase.from("notes").select("*").eq("folder_id", id),
      ]);

      return {
        folder: mapFolder(folder),
        files: (files || []).map(mapFile),
        links: (links || []).map(mapLink),
        notes: (notes || []).map(mapNote),
      };
    },
    enabled: options?.query?.enabled ?? true,
  });

export const useSearch = ({ q }: { q: string }, options?: QueryOptions<unknown>) =>
  useQuery({
    queryKey: options?.query?.queryKey ?? getSearchQueryKey({ q }),
    queryFn: async () => {
      const term = q.trim();
      if (!term) return { files: [], links: [], notes: [] };

      const [{ data: files }, { data: links }, { data: notes }] = await Promise.all([
        supabase.from("files").select("*").ilike("title", `%${term}%`),
        supabase.from("links").select("*").or(`title.ilike.%${term}%,url.ilike.%${term}%`),
        supabase.from("notes").select("*").or(`title.ilike.%${term}%,content.ilike.%${term}%`),
      ]);

      return {
        files: (files || []).map(mapFile),
        links: (links || []).map(mapLink),
        notes: (notes || []).map(mapNote),
      };
    },
    enabled: options?.query?.enabled ?? true,
  });

export const useCreateFile = () =>
  useMutation({
    mutationFn: async ({
      data,
    }: {
      data: Omit<File, "id" | "createdAt" | "updatedAt" | "isFavorite">;
    }) => {
      const { data: inserted, error } = await supabase
        .from("files")
        .insert({
          title: data.title,
          file_name: data.fileName,
          mime_type: data.mimeType,
          size: data.size,
          url: data.url,
          folder_id: data.folderId,
          is_favorite: false,
        })
        .select()
        .single();

      if (error) throw error;
      return mapFile(inserted);
    },
  });

export const useCreateLink = () =>
  useMutation({
    mutationFn: async ({
      data,
    }: {
      data: { title: string; url: string; folderId?: number | null };
    }) => {
      const { data: inserted, error } = await supabase
        .from("links")
        .insert({
          title: data.title,
          url: data.url,
          favicon: getFavicon(data.url),
          folder_id: data.folderId,
          is_favorite: false,
        })
        .select()
        .single();

      if (error) throw error;
      return mapLink(inserted);
    },
  });

export const useCreateNote = () =>
  useMutation({
    mutationFn: async ({
      data,
    }: {
      data: { title: string; content?: string; folderId?: number | null };
    }) => {
      const { data: inserted, error } = await supabase
        .from("notes")
        .insert({
          title: data.title,
          content: data.content,
          folder_id: data.folderId,
          is_favorite: false,
        })
        .select()
        .single();

      if (error) throw error;
      return mapNote(inserted);
    },
  });

export const useCreateFolder = () =>
  useMutation({
    mutationFn: async ({ data }: { data: { name: string } }) => {
      const { data: inserted, error } = await supabase
        .from("folders")
        .insert({
          name: data.name,
        })
        .select()
        .single();

      if (error) throw error;
      return mapFolder(inserted);
    },
  });

export const useUpdateFile = () =>
  useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<File> }) => {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.isFavorite !== undefined) updateData.is_favorite = data.isFavorite;
      if (data.folderId !== undefined) updateData.folder_id = data.folderId;
      updateData.updated_at = new Date().toISOString();

      const { data: updated, error } = await supabase
        .from("files")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return mapFile(updated);
    },
  });

export const useUpdateLink = () =>
  useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Link> }) => {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.url !== undefined) {
        updateData.url = data.url;
        updateData.favicon = getFavicon(data.url);
      }
      if (data.isFavorite !== undefined) updateData.is_favorite = data.isFavorite;
      if (data.folderId !== undefined) updateData.folder_id = data.folderId;
      updateData.updated_at = new Date().toISOString();

      const { data: updated, error } = await supabase
        .from("links")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return mapLink(updated);
    },
  });

export const useUpdateNote = () =>
  useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Note> }) => {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.isFavorite !== undefined) updateData.is_favorite = data.isFavorite;
      if (data.folderId !== undefined) updateData.folder_id = data.folderId;
      updateData.updated_at = new Date().toISOString();

      const { data: updated, error } = await supabase
        .from("notes")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return mapNote(updated);
    },
  });

export const useDeleteFile = () =>
  useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const { error } = await supabase.from("files").delete().eq("id", id);
      if (error) throw error;
    },
  });

export const useDeleteLink = () =>
  useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const { error } = await supabase.from("links").delete().eq("id", id);
      if (error) throw error;
    },
  });

export const useDeleteNote = () =>
  useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
  });
