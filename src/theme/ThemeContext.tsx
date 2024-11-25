'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';
import { classicTheme, modernDarkTheme, professionalLightTheme } from './themes';

export type ThemeName = 'classic' | 'modernDark' | 'professionalLight';

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  theme: any; // MUI theme object
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes = {
  classic: classicTheme,
  modernDark: modernDarkTheme,
  professionalLight: professionalLightTheme,
};

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('classic');
  const [theme, setThemeObject] = useState(() => createTheme(themes.classic));

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeName;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
      setThemeObject(createTheme(themes[savedTheme]));
    }
  }, []);

  const setTheme = (newTheme: ThemeName) => {
    setCurrentTheme(newTheme);
    setThemeObject(createTheme(themes[newTheme]));
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
}
