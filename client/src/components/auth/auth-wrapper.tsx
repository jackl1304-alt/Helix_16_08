import React, { useState, useEffect } from 'react';
import Login from '@/pages/login';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      try {
        const authStatus = localStorage.getItem('isAuthenticated') === 'true';
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Helix wird geladen...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  // Show main app if authenticated
  return <>{children}</>;
}