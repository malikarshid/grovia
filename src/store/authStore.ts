import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSession } from '@/types';

interface AuthStore {
  user: UserSession | null;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  setUser: (user: UserSession | null) => void;
  setOnboardingCompleted: (val: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      onboardingCompleted: false,

      setUser: (user: UserSession | null) =>
        set({ user, isAuthenticated: !!user }),

      setOnboardingCompleted: (val: boolean) =>
        set({ onboardingCompleted: val }),

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
          // ignore network failure on logout
        }
        set({ user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      },
    }),
    {
      name: 'grovia_auth_storage',
    }
  )
);
