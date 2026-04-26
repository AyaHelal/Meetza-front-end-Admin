import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user, setUser } = useAuth();
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  // 1. Sync theme with user.theme from JWT when user logs in or changes
  useEffect(() => {
    if (user?.theme && user.theme !== theme) {
      setThemeState(user.theme);
    }
  }, [user?.theme]);

  // 2. Apply theme to document and localStorage
  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    
    // 3. Update theme on server if user is logged in
    if (user?.id) {
      try {
        await api.patch(`/user/${user.id}`, { theme: newTheme });
        // Update local user state to reflect the new theme (prevents sync useEffect from reverting it)
        if (setUser) {
          setUser(prev => prev ? { ...prev, theme: newTheme } : prev);
        }
      } catch (error) {
        console.error('Failed to update theme on server:', error);
      }
    }
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
