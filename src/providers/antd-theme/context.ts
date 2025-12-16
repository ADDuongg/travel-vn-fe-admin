import { createContext, useContext } from 'react';

export type Preference = 'light' | 'dark' | 'system';

export type ThemeCtx = {
  preference: Preference;
  setPreference: (p: Preference) => void;
  resolvedMode: 'light' | 'dark';
};

export const ThemeContext = createContext<ThemeCtx | null>(null);

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error('useThemeMode must be used within AntdThemeProvider');
  return ctx;
}
