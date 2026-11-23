'use client';

import { useEffect } from 'react';
import { applyThemeToDocument } from '@/store/themeStore';
import { ThemeMode } from '@/types';

export const ThemeInitializer = () => {
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('grovia_theme') as ThemeMode;
      if (storedTheme && ['light', 'dark', 'eye-protection'].includes(storedTheme)) {
        applyThemeToDocument(storedTheme);
      } else {
        applyThemeToDocument('light');
      }
    } catch {
      // noop
    }
  }, []);

  return null;
};
