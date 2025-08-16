import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Users, LogIn } from 'lucide-react';
import { useLocation } from 'wouter';

interface NavigationHeaderProps {
  showTenantLinks?: boolean;
  currentView?: 'admin' | 'tenant' | 'public';
}

export function NavigationHeader({ showTenantLinks = true, currentView = 'admin' }: NavigationHeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="flex justify-between items-center mb-6 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Deltaways Brand */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="text-xl font-semibold text-gray-800 dark:text-white">Deltaways</span>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Helix Platform
        </Badge>
      </div>

      {/* Navigation Links */}
      {showTenantLinks && (
        <div className="flex items-center space-x-3">
          {currentView === 'admin' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/tenant/auth')}
                className="flex items-center space-x-2 text-sm"
                data-testid="button-goto-tenant-auth"
              >
                <LogIn className="h-4 w-4" />
                <span>Tenant Login</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/tenant/dashboard')}
                className="flex items-center space-x-2 text-sm"
                data-testid="button-goto-tenant-dashboard"
              >
                <Users className="h-4 w-4" />
                <span>Customer Area</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </>
          )}
          
          {currentView === 'tenant' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/')}
              className="flex items-center space-x-2 text-sm"
              data-testid="button-goto-admin"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Admin Area</span>
            </Button>
          )}

          {currentView === 'public' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setLocation('/tenant/auth')}
              className="flex items-center space-x-2 text-sm bg-blue-600 hover:bg-blue-700"
              data-testid="button-tenant-login"
            >
              <LogIn className="h-4 w-4" />
              <span>Tenant Login</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}