import { create } from 'zustand';
import { ThemeMode } from '@/types';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  setTheme: (theme: ThemeMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('grovia_theme', theme);
      applyThemeToDocument(theme);
    }
    set({ theme });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next: ThemeMode = current === 'light' ? 'dark' : current === 'dark' ? 'eye-protection' : 'light';
    get().setTheme(next);
  },
}));

export function applyThemeToDocument(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark', 'eye-protection');
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'eye-protection') {
    root.classList.add('eye-protection');
  }
}
