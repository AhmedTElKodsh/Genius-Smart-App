import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  const updateFavicon = (isDark: boolean) => {
    const favicon = document.querySelector('link[rel="icon"]');
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    const shortcutIcon = document.querySelector('link[rel="shortcut icon"]');
    
    const faviconPath = isDark ? '/light-logo-page.png' : '/logo-page.png';
    
    if (favicon) {
      (favicon as HTMLLinkElement).href = faviconPath;
    }
    if (appleTouchIcon) {
      (appleTouchIcon as HTMLLinkElement).href = faviconPath;
    }
    if (shortcutIcon) {
      (shortcutIcon as HTMLLinkElement).href = faviconPath;
    }
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    updateFavicon(newTheme === 'dark');
  };

  // Initialize theme attribute and favicon on mount
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    updateFavicon(theme === 'dark');
  }, [theme]);

  const isDarkMode = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}; 