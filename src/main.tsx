// main.tsx (or index.tsx)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppRouter from './AppRouter';
import AntdThemeProvider from './providers/antd-theme/antd-theme-provider';
import QueryProvider from './providers/query.provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <AntdThemeProvider defaultPreference="system" storageKey="vite-ui-theme">
        <AppRouter />
      </AntdThemeProvider>
    </QueryProvider>
  </StrictMode>,
);
