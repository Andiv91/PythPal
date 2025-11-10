import React, { createContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

export const ThemeContext = createContext({ darkMode: false, setDarkMode: () => {} });

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      ...(darkMode ? {
        background: {
          default: '#232323',
          paper: '#181818',
        },
        text: {
          primary: '#e0e0e0',
          secondary: '#bdbdbd',
        },
      } : {
        background: {
          default: '#f5f6fa',
          paper: '#fff',
        },
        text: {
          primary: '#232323',
          secondary: '#555',
        },
      })
    },
  }), [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
} 