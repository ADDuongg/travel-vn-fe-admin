// src/theme.ts
import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

const { defaultAlgorithm, darkAlgorithm } = theme;

export const lightTheme: ThemeConfig = {
  cssVar: true, // bật CSS variables (khuyên dùng)
  algorithm: defaultAlgorithm,
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 8,
    // tuỳ ý: fontFamily, motion=false, breakpoints (screenSM, screenMD...)
  },
  components: {
    Button: { controlHeight: 40, borderRadius: 10 },
  },
};

export const darkTheme: ThemeConfig = {
  cssVar: true,
  algorithm: darkAlgorithm,
  token: {
    colorPrimary: '#4e9eff',
    borderRadius: 8,
  },
};
