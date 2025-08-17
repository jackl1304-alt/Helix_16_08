// Simplified JSON-based Auth - no complex state management
export const jsonAuth = {
  login: (username: string, password: string): boolean => {
    // Fixed credentials: admin / admin123
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('loginTime', new Date().toISOString());
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loginTime');
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem('isAuthenticated') === 'true';
  },

  getUserData: () => {
    return {
      isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
      userRole: localStorage.getItem('userRole'),
      loginTime: localStorage.getItem('loginTime')
    };
  }
};

// Legacy hook for compatibility - simplified
export function useAuth() {
  const userData = jsonAuth.getUserData();
  
  return {
    ...userData,
    login: jsonAuth.login,
    logout: jsonAuth.logout
  };
}