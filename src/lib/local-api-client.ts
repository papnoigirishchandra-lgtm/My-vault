import { useMutation, useQuery } from "@tanstack/react-query";

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

type Store = {
  files: File[];
  links: Link[];
  notes: Note[];
  folders: Folder[];
};

type QueryOptions<T> = {
  query?: {
    enabled?: boolean;
    queryKey?: readonly unknown[];
  };
};

const STORAGE_KEY = "vault-dashboard-data";

const now = () => new Date().toISOString();

const createInitialStore = (): Store => {
  const timestamp = now();
  return {
    files: [
      {
        id: 1,
        title: "Project Brief",
        fileName: "project-brief.pdf",
        mimeType: "application/pdf",
        size: 845_120,
        url: "https://example.com/project-brief.pdf",
        isFavorite: true,
        folderId: 1,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    links: [
      {
        id: 1,
        title: "React Documentation",
        url: "https://react.dev",
        favicon: "https://www.google.com/s2/favicons?domain=react.dev&sz=64",
        isFavorite: false,
        folderId: 1,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    notes: [
      {
        id: 1,
        title: "Launch Ideas",
        content: "Collect dashboard polish ideas, onboarding copy, and follow-up tasks here.",
        isFavorite: true,
        folderId: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    folders: [
      {
        id: 1,
        name: "Workspace",
        itemCount: 2,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  };
};

const readStore = (): Store => {
  if (typeof window === "undefined") return createInitialStore();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = createInitialStore();
    writeStore(initial);
    return initial;
  }

  try {
    return JSON.parse(raw) as Store;
  } catch {
    const initial = createInitialStore();
    writeStore(initial);
    return initial;
  }
};

const writeStore = (store: Store) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withFolderCounts(store)));
  }
};

const withFolderCounts = (store: Store): Store => ({
  ...store,
  folders: store.folders.map((folder) => ({
    ...folder,
    itemCount:
      store.files.filter((item) => item.folderId === folder.id).length +
      store.links.filter((item) => item.folderId === folder.id).length +
      store.notes.filter((item) => item.folderId === folder.id).length,
  })),
});

const nextId = (items: { id: number }[]) =>
  items.length === 0 ? 1 : Math.max(...items.map((item) => item.id)) + 1;

const mutateStore = <T>(updater: (store: Store) => [Store, T]): T => {
  const [updated, result] = updater(readStore());
  writeStore(updated);
  return result;
};

const getFavicon = (url: string) => {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
  } catch {
    return undefined;
  }
};

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
  useQuery({ queryKey: getListFilesQueryKey(), queryFn: () => readStore().files });

export const useListLinks = () =>
  useQuery({ queryKey: getListLinksQueryKey(), queryFn: () => readStore().links });

export const useListNotes = () =>
  useQuery({ queryKey: getListNotesQueryKey(), queryFn: () => readStore().notes });

export const useListFolders = () =>
  useQuery({ queryKey: getListFoldersQueryKey(), queryFn: () => readStore().folders });

export const useGetDashboard = () =>
  useQuery({
    queryKey: getGetDashboardQueryKey(),
    queryFn: () => {
      const store = readStore();
      const byUpdated = <T extends { updatedAt: string }>(items: T[]) =>
        [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);

      return {
        counts: {
          files: store.files.length,
          links: store.links.length,
          notes: store.notes.length,
          folders: store.folders.length,
        },
        recentFiles: byUpdated(store.files),
        recentLinks: byUpdated(store.links),
        recentNotes: byUpdated(store.notes),
        folders: store.folders,
      };
    },
  });

export const useListFavorites = () =>
  useQuery({
    queryKey: getListFavoritesQueryKey(),
    queryFn: () => {
      const store = readStore();
      return {
        files: store.files.filter((item) => item.isFavorite),
        links: store.links.filter((item) => item.isFavorite),
        notes: store.notes.filter((item) => item.isFavorite),
      };
    },
  });

export const useGetNote = (id: number, options?: QueryOptions<Note | undefined>) =>
  useQuery({
    queryKey: options?.query?.queryKey ?? getGetNoteQueryKey(id),
    queryFn: () => readStore().notes.find((note) => note.id === id),
    enabled: options?.query?.enabled ?? true,
  });

export const useGetFolder = (
  id: number,
  options?: QueryOptions<{ folder: Folder; files: File[]; links: Link[]; notes: Note[] } | undefined>,
) =>
  useQuery({
    queryKey: options?.query?.queryKey ?? getGetFolderQueryKey(id),
    queryFn: () => {
      const store = readStore();
      const folder = store.folders.find((item) => item.id === id);
      if (!folder) return undefined;
      return {
        folder,
        files: store.files.filter((item) => item.folderId === id),
        links: store.links.filter((item) => item.folderId === id),
        notes: store.notes.filter((item) => item.folderId === id),
      };
    },
    enabled: options?.query?.enabled ?? true,
  });

export const useSearch = ({ q }: { q: string }, options?: QueryOptions<unknown>) =>
  useQuery({
    queryKey: options?.query?.queryKey ?? getSearchQueryKey({ q }),
    queryFn: () => {
      const term = q.trim().toLowerCase();
      const store = readStore();
      if (!term) return { files: [], links: [], notes: [] };
      return {
        files: store.files.filter((item) => `${item.title} ${item.fileName}`.toLowerCase().includes(term)),
        links: store.links.filter((item) => `${item.title} ${item.url}`.toLowerCase().includes(term)),
        notes: store.notes.filter((item) => `${item.title} ${item.content ?? ""}`.toLowerCase().includes(term)),
      };
    },
    enabled: options?.query?.enabled ?? true,
  });

export const useCreateFile = () =>
  useMutation({
    mutationFn: async ({ data }: { data: Omit<File, "id" | "createdAt" | "updatedAt" | "isFavorite"> }) =>
      mutateStore((store) => {
        const timestamp = now();
        const file: File = {
          ...data,
          id: nextId(store.files),
          isFavorite: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        return [{ ...store, files: [file, ...store.files] }, file];
      }),
  });

export const useCreateLink = () =>
  useMutation({
    mutationFn: async ({ data }: { data: { title: string; url: string; folderId?: number | null } }) =>
      mutateStore((store) => {
        const timestamp = now();
        const link: Link = {
          ...data,
          id: nextId(store.links),
          favicon: getFavicon(data.url),
          isFavorite: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        return [{ ...store, links: [link, ...store.links] }, link];
      }),
  });

export const useCreateNote = () =>
  useMutation({
    mutationFn: async ({ data }: { data: { title: string; content?: string; folderId?: number | null } }) =>
      mutateStore((store) => {
        const timestamp = now();
        const note: Note = {
          ...data,
          id: nextId(store.notes),
          isFavorite: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        return [{ ...store, notes: [note, ...store.notes] }, note];
      }),
  });

export const useCreateFolder = () =>
  useMutation({
    mutationFn: async ({ data }: { data: { name: string } }) =>
      mutateStore((store) => {
        const timestamp = now();
        const folder: Folder = {
          id: nextId(store.folders),
          name: data.name,
          itemCount: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        return [{ ...store, folders: [folder, ...store.folders] }, folder];
      }),
  });

export const useUpdateFile = () =>
  useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<File> }) =>
      mutateStore((store) => {
        const files = store.files.map((item) =>
          item.id === id ? { ...item, ...data, updatedAt: now() } : item,
        );
        return [{ ...store, files }, files.find((item) => item.id === id)];
      }),
  });

export const useUpdateLink = () =>
  useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Link> }) =>
      mutateStore((store) => {
        const links = store.links.map((item) =>
          item.id === id ? { ...item, ...data, updatedAt: now() } : item,
        );
        return [{ ...store, links }, links.find((item) => item.id === id)];
      }),
  });

export const useUpdateNote = () =>
  useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Note> }) =>
      mutateStore((store) => {
        const notes = store.notes.map((item) =>
          item.id === id ? { ...item, ...data, updatedAt: now() } : item,
        );
        return [{ ...store, notes }, notes.find((item) => item.id === id)];
      }),
  });

export const useDeleteFile = () =>
  useMutation({
    mutationFn: async ({ id }: { id: number }) =>
      mutateStore((store) => [{ ...store, files: store.files.filter((item) => item.id !== id) }, undefined]),
  });

export const useDeleteLink = () =>
  useMutation({
    mutationFn: async ({ id }: { id: number }) =>
      mutateStore((store) => [{ ...store, links: store.links.filter((item) => item.id !== id) }, undefined]),
  });

export const useDeleteNote = () =>
  useMutation({
    mutationFn: async ({ id }: { id: number }) =>
      mutateStore((store) => [{ ...store, notes: store.notes.filter((item) => item.id !== id) }, undefined]),
  });
