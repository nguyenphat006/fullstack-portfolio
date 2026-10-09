import { create } from "zustand";

interface BreadcrumbState {
  labels: Record<string, string>;
  setLabel: (path: string, label: string) => void;
  removeLabel: (path: string) => void;
}

export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  labels: {},
  setLabel: (path, label) =>
    set((state) => ({
      labels: { ...state.labels, [path]: label },
    })),
  removeLabel: (path) =>
    set((state) => {
      const next = { ...state.labels };
      delete next[path];
      return { labels: next };
    }),
}));
