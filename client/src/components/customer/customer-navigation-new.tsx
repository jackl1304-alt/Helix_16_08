import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  MessageCircle,
  Shield
} from "lucide-react";

// JSON-basierte Customer Permissions
interface CustomerPermissions {
  dashboard: boolean;
  regulatoryUpdates: boolean;
  legalCases: boolean;
  knowledgeBase: boolean;
  newsletters: boolean;
  analytics: boolean;
  reports: boolean;
  dataCollection: boolean;
  globalSources: boolean;
  historicalData: boolean;
  administration: boolean;
  userManagement: boolean;
  systemSettings: boolean;
  auditLogs: boolean;
  aiInsights: boolean;
  advancedAnalytics: boolean;
}

// JSON Navigation Schema
interface NavigationConfig {
  items: Array<{
    id: string;
    label: string;
    href: string;
    icon: string;
    permission: keyof CustomerPermissions;
    description?: string;
  }>;
}

// JSON Navigation Data
const NAVIGATION_CONFIG: NavigationConfig = {
  items: [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "dashboard",
      icon: "LayoutDashboard",
      permission: "dashboard",
      description: "Übersicht und aktuelle Statistiken"
    },
    {
      id: "regulatory-updates", 
      label: "Regulatorische Updates",
      href: "regulatory-updates",
      icon: "FileText",
      permission: "regulatoryUpdates",
      description: "Aktuelle regulatorische Änderungen"
    },
    {
      id: "knowledge-base",
      label: "Wissensdatenbank", 
      href: "knowledge-base",
      icon: "BookOpen",
      permission: "knowledgeBase",
      description: "Wissensdatenbank und Artikel"
    },
    {
      id: "newsletters",
      label: "Newsletter",
      href: "newsletters", 
      icon: "Mail",
      permission: "newsletters",
      description: "Newsletter-Verwaltung"
    }
  ]
};

// Icon mapping
const ICON_MAP = {
  LayoutDashboard,
  FileText,
  BookOpen,
  Mail,
  BarChart3,
  Settings,
  Shield
};

interface Props {
  permissions: CustomerPermissions | null;
  tenantName?: string;
}

export default function CustomerNavigationNew({ permissions, tenantName }: Props) {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const { logout } = useAuth();
  
  // Get tenant ID from URL params
  const tenantId = params.tenantId || '030d3e01-32c4-4f95-8d54-98be948e8d4b';
  
  // Build tenant-specific URL
  const buildTenantUrl = (path: string): string => {
    return `/tenant/${tenantId}/${path}`;
  };
  
  // Filter allowed navigation items based on permissions
  const allowedItems = NAVIGATION_CONFIG.items.filter(item => 
    permissions && permissions[item.permission]
  );
  
  // Handle navigation click
  const handleNavigation = (href: string) => {
    const fullUrl = buildTenantUrl(href);
    console.log(`[CUSTOMER NAV] Navigating to: ${fullUrl}`);
    setLocation(fullUrl);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    setLocation('/login');
  };
  
  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {tenantName?.charAt(0) || 'C'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {tenantName || "Customer Portal"}
            </h2>
            <p className="text-sm text-gray-500">Regulatory Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {allowedItems.length > 0 ? (
          <div className="space-y-2">
            {allowedItems.map((item) => {
              const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP] || Shield;
              const fullUrl = buildTenantUrl(item.href);
              const isActive = location === fullUrl || location.includes(item.href);
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "w-full justify-start h-auto py-3 transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  <IconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium">{item.label}</span>
                    {item.description && (
                      <span className="text-xs opacity-75 mt-0.5">
                        {item.description}
                      </span>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-500">Keine Navigation verfügbar</p>
            <p className="text-xs text-gray-400 mt-2">Berechtigungen werden geladen...</p>
          </div>
        )}
      </nav>

      {/* Footer with Chat and Logout */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => handleNavigation('chat-support')}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Support Chat
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Abmelden
        </Button>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          Powered by Helix Platform
        </p>
      </div>
    </div>
  );
}

export type { CustomerPermissions };