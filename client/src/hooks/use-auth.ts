import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  userRole: string | null;
  loginTime: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userRole: null,
    loginTime: null
  });

  useEffect(() => {
    // Check authentication status on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    const loginTime = localStorage.getItem('loginTime');
    
    setAuthState({
      isAuthenticated,
      userRole,
      loginTime
    });
  };

  const login = (username: string, password: string): boolean => {
    // Fixed credentials: admin / admin123
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('loginTime', new Date().toISOString());
      
      setAuthState({
        isAuthenticated: true,
        userRole: 'admin',
        loginTime: new Date().toISOString()
      });
      
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loginTime');
    
    setAuthState({
      isAuthenticated: false,
      userRole: null,
      loginTime: null
    });
  };

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus
  };
}