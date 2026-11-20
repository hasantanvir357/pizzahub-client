'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeProviderProps {
  children: ReactNode;
  /** How the active theme is exposed on <html>. Mirrors the next-themes API. */
  attribute?: 'class' | 'data-theme';
  defaultTheme?: Theme;
  enableSystem?: boolean;
  storageKey?: string;
}

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  /** False until localStorage / system preference have been read on the client. */
  mounted: boolean;
}

const DEFAULT_STORAGE_KEY = 'pizzahub_theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(storageKey: string): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(storageKey);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : null;
  } catch {
    return null;
  }
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Lightweight, dependency-free ThemeProvider with the same configuration
 * surface as next-themes (`attribute`, `defaultTheme`, `enableSystem`).
 * It writes the resolved theme onto <html> so Tailwind's `.dark` variant and
 * the semantic CSS variables in globals.css both respond to the toggle.
 */
export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'light',
  enableSystem = true,
  storageKey = DEFAULT_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemDark, setSystemDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydrate from storage / OS preference after mount (never during SSR).
  useEffect(() => {
    const hydrate = () => {
      setThemeState(readStoredTheme(storageKey) ?? defaultTheme);
      setSystemDark(systemPrefersDark());
      setMounted(true);
    };
    hydrate();

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) setThemeState(readStoredTheme(storageKey) ?? defaultTheme);
    };
    media.addEventListener('change', onSystemChange);
    window.addEventListener('storage', onStorage);
    return () => {
      media.removeEventListener('change', onSystemChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [defaultTheme, storageKey]);

  const resolvedTheme: ResolvedTheme =
    theme === 'system' && enableSystem
      ? systemDark
        ? 'dark'
        : 'light'
      : theme === 'dark'
        ? 'dark'
        : 'light';

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
    } else {
      root.setAttribute(attribute, resolvedTheme);
    }
  }, [attribute, mounted, resolvedTheme]);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        // localStorage may be unavailable — the in-memory theme still works.
      }
    },
    [storageKey]
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme, mounted }),
    [mounted, resolvedTheme, setTheme, theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
