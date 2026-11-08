import { ThemeMode } from '../types/index.ts';

export const LOCAL_STORAGE_KEY_THEME = 'cropredict_theme';

export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_THEME) as ThemeMode;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'system';
}

export function saveStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_THEME, theme);
  } catch {
    // ignore
  }
}

export function getEffectiveTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function applyThemeToDocument(theme: ThemeMode): 'light' | 'dark' {
  const effective = getEffectiveTheme(theme);
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (effective === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }
  return effective;
}
