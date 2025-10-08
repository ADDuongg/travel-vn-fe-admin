import { useEffect, useMemo, useState } from 'react';
import { ConfigProvider, App as AntApp } from 'antd';
import { darkTheme, lightTheme } from '@/theme';
import { ThemeContext, type Preference } from './context';

function getSystemDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export default function AntdThemeProvider({
  children,
  defaultPreference = 'system',
  storageKey = 'vite-ui-theme',
}: {
  children: React.ReactNode;
  defaultPreference?: Preference;
  storageKey?: string;
}) {
  const [preference, setPreference] = useState<Preference>(() => {
    if (typeof window === 'undefined') return defaultPreference;
    const saved = window.localStorage.getItem(storageKey) as Preference | null;
    return saved ?? defaultPreference;
  });

  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>(() => {
    if (preference === 'dark') return 'dark';
    if (preference === 'light') return 'light';
    return getSystemDark() ? 'dark' : 'light';
  });

  useEffect(() => {
  if (typeof window === 'undefined') return;
  if (preference !== 'system') {
    setResolvedMode(preference);
    return;
  }

  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const update = () => setResolvedMode(mql.matches ? 'dark' : 'light');
  update();

  mql.onchange = update as any;
  return () => {
    mql.onchange = null;
  };
}, [preference]);


  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, preference);
  }, [preference, storageKey]);

  const antdTheme = useMemo(
    () => (resolvedMode === 'dark' ? darkTheme : lightTheme),
    [resolvedMode],
  );

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', resolvedMode);
    }
  }, [resolvedMode]);

  return (
    <ThemeContext.Provider value={{ preference, setPreference, resolvedMode }}>
      <ConfigProvider theme={antdTheme}>
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
