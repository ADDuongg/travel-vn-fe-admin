import { createContext, useContext } from 'react';

export type Preference = 'light' | 'dark' | 'system';

export type ThemeCtx = {
  preference: Preference;
  setPreference: (p: Preference) => void;
  resolvedMode: 'light' | 'dark';
};

// Context KHÔNG nằm chung file với component để tránh cảnh báo
export const ThemeContext = createContext<ThemeCtx | null>(null);

// Hook này export ở file riêng (không có component nào ở đây)
export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within AntdThemeProvider');
  return ctx;
}
