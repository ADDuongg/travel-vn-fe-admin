// main.tsx (hoặc index.tsx)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppRouter from './AppRouter';
import AntdThemeProvider from './providers/antd-theme/antd-theme-provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AntdThemeProvider defaultPreference="system" storageKey="vite-ui-theme">
      <AppRouter />
    </AntdThemeProvider>
  </StrictMode>,
);
