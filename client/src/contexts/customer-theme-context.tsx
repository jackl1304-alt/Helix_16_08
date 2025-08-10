import React, { createContext, useContext, useState, useEffect } from 'react';

export type CustomerTheme = 'blue' | 'purple' | 'green';

interface CustomerThemeSettings {
  theme: CustomerTheme;
  companyLogo?: string;
  companyName: string;
}

interface CustomerThemeContextType {
  themeSettings: CustomerThemeSettings;
  setTheme: (theme: CustomerTheme) => void;
  setCompanyLogo: (logo: string) => void;
  setCompanyName: (name: string) => void;
  getThemeColors: () => ThemeColors;
}

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  sidebar: string;
  sidebarHover: string;
  cardBg: string;
  background: string;
  textPrimary: string;
  textSecondary: string;
}

const themeConfig: Record<CustomerTheme, ThemeColors> = {
  blue: {
    primary: 'from-blue-500 via-blue-600 to-blue-700',
    secondary: 'bg-blue-50 dark:bg-blue-900/20',
    accent: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 via-cyan-600 to-blue-700',
    sidebar: 'bg-gradient-to-b from-blue-900 to-blue-800',
    sidebarHover: 'hover:bg-blue-700/50',
    cardBg: 'bg-white dark:bg-blue-900/10',
    background: 'bg-blue-50 dark:bg-blue-900',
    textPrimary: 'text-blue-900 dark:text-blue-100',
    textSecondary: 'text-blue-600 dark:text-blue-300'
  },
  purple: {
    primary: 'from-purple-500 via-purple-600 to-purple-700',
    secondary: 'bg-purple-50 dark:bg-purple-900/20',
    accent: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500 via-pink-600 to-purple-700',
    sidebar: 'bg-gradient-to-b from-purple-900 to-purple-800',
    sidebarHover: 'hover:bg-purple-700/50',
    cardBg: 'bg-white dark:bg-purple-900/10',
    background: 'bg-purple-50 dark:bg-purple-900',
    textPrimary: 'text-purple-900 dark:text-purple-100',
    textSecondary: 'text-purple-600 dark:text-purple-300'
  },
  green: {
    primary: 'from-green-500 via-green-600 to-green-700',
    secondary: 'bg-green-50 dark:bg-green-900/20',
    accent: 'text-green-600 dark:text-green-400',
    gradient: 'from-green-500 via-emerald-600 to-green-700',
    sidebar: 'bg-gradient-to-b from-green-900 to-green-800',
    sidebarHover: 'hover:bg-green-700/50',
    cardBg: 'bg-white dark:bg-green-900/10',
    background: 'bg-green-50 dark:bg-green-900',
    textPrimary: 'text-green-900 dark:text-green-100',
    textSecondary: 'text-green-600 dark:text-green-300'
  }
};

const CustomerThemeContext = createContext<CustomerThemeContextType | undefined>(undefined);

export function CustomerThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeSettings, setThemeSettings] = useState<CustomerThemeSettings>({
    theme: 'blue',
    companyName: 'Helix Customer Portal'
  });

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('customer-theme-settings');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        setThemeSettings(parsed);
      } catch (error) {
        console.error('Failed to parse saved theme settings:', error);
      }
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('customer-theme-settings', JSON.stringify(themeSettings));
  }, [themeSettings]);

  const setTheme = (theme: CustomerTheme) => {
    setThemeSettings(prev => ({ ...prev, theme }));
  };

  const setCompanyLogo = (logo: string) => {
    setThemeSettings(prev => ({ ...prev, companyLogo: logo }));
  };

  const setCompanyName = (name: string) => {
    setThemeSettings(prev => ({ ...prev, companyName: name }));
  };

  const getThemeColors = () => {
    return themeConfig[themeSettings.theme];
  };

  return (
    <CustomerThemeContext.Provider value={{
      themeSettings,
      setTheme,
      setCompanyLogo,
      setCompanyName,
      getThemeColors
    }}>
      {children}
    </CustomerThemeContext.Provider>
  );
}

export function useCustomerTheme() {
  const context = useContext(CustomerThemeContext);
  if (context === undefined) {
    throw new Error('useCustomerTheme must be used within a CustomerThemeProvider');
  }
  return context;
}