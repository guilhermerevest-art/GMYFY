'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_THEME } from './themes';

interface ThemeContextValue {
  theme: string;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: DEFAULT_THEME, setTheme: () => {} });

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme?: string }) {
  const [theme, setThemeState] = useState(initialTheme ?? DEFAULT_THEME);

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  function setTheme(id: string) {
    setThemeState(id);
    document.documentElement.className = `theme-${id}`;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
