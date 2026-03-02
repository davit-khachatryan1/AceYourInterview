'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@/types/interview';

export type ThemePreference = 'system' | 'dark' | 'light';
export type ResolvedTheme = 'dark' | 'light';

interface UIState {
  language: Language;
  activeTopicId: string | null;
  sidebarCollapsed: boolean;
  searchOpen: boolean;
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setLanguage: (language: Language) => void;
  setActiveTopicId: (topicId: string | null) => void;
  setSearchOpen: (open: boolean) => void;
  setTheme: (theme: ThemePreference) => void;
  setResolvedTheme: (resolvedTheme: ResolvedTheme) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'en',
      activeTopicId: null,
      sidebarCollapsed: false,
      searchOpen: false,
      theme: 'system',
      resolvedTheme: 'dark',
      setLanguage: (language) => set({ language }),
      setActiveTopicId: (activeTopicId) => set({ activeTopicId }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setTheme: (theme) => set({ theme }),
      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'ace-your-interview-ui',
      partialize: (state) => ({
        language: state.language,
        activeTopicId: state.activeTopicId,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    },
  ),
);
