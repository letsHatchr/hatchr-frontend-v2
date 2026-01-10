import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light' | 'system';

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'dark', // Default to dark mode

            setTheme: (theme) => {
                const root = window.document.documentElement;
                root.classList.remove('light', 'dark');

                if (theme === 'system') {
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                        ? 'dark'
                        : 'light';
                    root.classList.add(systemTheme);
                } else {
                    root.classList.add(theme);
                }

                set({ theme });
            },
        }),
        {
            name: 'theme-storage',
        }
    )
);

// Initialize theme on app load
export const initializeTheme = () => {
    const stored = localStorage.getItem('theme-storage');
    if (stored) {
        const { state } = JSON.parse(stored);
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (state.theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(state.theme);
        }
    }
};
