'use client';

import React, { useEffect } from 'react';
import { Sun, Moon, Eye } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { ThemeMode } from '@/types';

export const ThemeSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const saved = localStorage.getItem('grovia_theme') as ThemeMode;
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'eye-protection')) {
      setTheme(saved);
    }
  }, [setTheme]);

  const modes: Array<{ id: ThemeMode; label: string; icon: React.ReactNode }> = [
    { id: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'eye-protection', label: 'Eye Protection', icon: <Eye className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Display theme selection"
      className="inline-flex items-center p-1 bg-gray-100 dark:bg-slate-800 eye-protection:bg-[#F0EAD6] rounded-xl border border-gray-200 dark:border-slate-700 eye-protection:border-[#E2D7BE] text-xs font-medium"
    >
      {modes.map((m) => {
        const isActive = theme === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(m.id)}
            title={`${m.label} Mode`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-150 ${
              isActive
                ? 'bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] text-[#2E7D32] dark:text-[#4CAF50] shadow-sm font-semibold'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white eye-protection:text-[#787262]'
            }`}
          >
            {m.icon}
            {!compact && <span>{m.label}</span>}
          </button>
        );
      })}
    </div>
  );
};
