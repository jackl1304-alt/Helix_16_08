import { useState, useEffect } from 'react';

// React Hook für Authentifizierung
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole');
    setIsAuthenticated(authStatus);
    setUserRole(role);
    setIsLoading(false);
  }, []);

  const login = (username?: string, password?: string): boolean => {
    // Demo credentials: admin / admin123
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('loginTime', new Date().toISOString());
      setIsAuthenticated(true);
      setUserRole('admin');
      return true;
    }
    // Falls keine Credentials übergeben werden (für Demo)
    if (!username && !password) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'demo');
      localStorage.setItem('loginTime', new Date().toISOString());
      setIsAuthenticated(true);
      setUserRole('demo');
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loginTime');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return {
    isAuthenticated,
    isLoading,
    userRole,
    login,
    logout
  };
}