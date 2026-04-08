// src/theme.ts
import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

const { defaultAlgorithm, darkAlgorithm } = theme;

export const lightTheme: ThemeConfig = {
  cssVar: true, // enable CSS variables
  algorithm: defaultAlgorithm,
  token: {
    colorPrimary: '#1E40AF',
    colorInfo: '#3B82F6',
    colorSuccess: '#16A34A',
    colorWarning: '#F59E0B',
    colorError: '#DC2626',
    borderRadius: 10,
    fontFamily:
      "Fira Sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
    fontFamilyCode:
      "Fira Code, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  components: {
    Button: { controlHeight: 40, borderRadius: 10 },
    Card: { borderRadiusLG: 12 },
  },
};

export const darkTheme: ThemeConfig = {
  cssVar: true,
  algorithm: darkAlgorithm,
  token: {
    colorPrimary: '#3B82F6',
    colorInfo: '#60A5FA',
    colorSuccess: '#22C55E',
    colorWarning: '#FBBF24',
    colorError: '#F87171',
    borderRadius: 10,
    fontFamily:
      "Fira Sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
    fontFamilyCode:
      "Fira Code, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
};
