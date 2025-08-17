import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  BarChart3, 
  Globe, 
  Archive, 
  Settings, 
  Menu, 
  X 
} from 'lucide-react';

interface NavigationSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function NavigationSidebar({ isOpen, onToggle }: NavigationSidebarProps) {
  const [location, setLocation] = useLocation();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: 'text-blue-600'
    },
    {
      id: 'regulatory-updates',
      label: 'Regulatory Updates',
      icon: FileText,
      path: '/regulatory-updates',
      color: 'text-green-600'
    },
    {
      id: 'knowledge-base',
      label: 'Knowledge Base',
      icon: BookOpen,
      path: '/knowledge-base',
      color: 'text-purple-600'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      color: 'text-orange-600'
    },
    {
      id: 'global-sources',
      label: 'Global Sources',
      icon: Globe,
      path: '/global-sources',
      color: 'text-indigo-600'
    },
    {
      id: 'historical-data',
      label: 'Historical Data',
      icon: Archive,
      path: '/historical-data',
      color: 'text-gray-600'
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      icon: Settings,
      path: '/system-settings',
      color: 'text-red-600'
    }
  ];

  const isCurrentPage = (path: string) => {
    return location === path || (path === '/dashboard' && location === '/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-semibold text-gray-800 dark:text-white">Helix</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Status */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-full justify-center">
            System Online
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = isCurrentPage(item.path);
            
            return (
              <Button
                key={item.id}
                variant={active ? "default" : "ghost"}
                className={`
                  w-full justify-start space-x-3 h-12
                  ${active ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                `}
                onClick={() => {
                  setLocation(item.path);
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
              >
                <IconComponent className={`h-5 w-5 ${active ? 'text-white' : item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <div>Helix Platform v2.0</div>
            <div>Deltaways Technologies</div>
          </div>
        </div>
      </div>
    </>
  );
}

export function NavigationToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="lg:hidden"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}