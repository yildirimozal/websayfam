'use client';

import React, { createContext, useContext, useState } from 'react';
import { createTheme } from '@mui/material/styles';
import { classicTheme, modernDarkTheme, professionalLightTheme } from './themes';

export type ThemeName = 'classic' | 'modernDark' | 'professionalLight';

interface ThemeContextType {
  currentTheme: ThemeName;
  theme: any; // MUI theme object
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes = {
  classic: classicTheme,
  modernDark: modernDarkTheme,
  professionalLight: professionalLightTheme,
};

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme] = useState<ThemeName>('professionalLight');
  const [theme] = useState(() => createTheme(themes.professionalLight));

  return (
    <ThemeContext.Provider value={{ currentTheme, theme }}>
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
