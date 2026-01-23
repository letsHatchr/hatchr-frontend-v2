import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EmailNotificationPreferences } from '../features/profile/types';

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  hatchPoints: number;
  followers: string[];
  following: string[];
  isEmailVerified: boolean;
  emailNotifications?: EmailNotificationPreferences;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false, // Start as false - no loading state needed on init

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => set({ token }),

      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      }),

      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
