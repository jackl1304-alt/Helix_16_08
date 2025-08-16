import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  FileText,
  Scale,
  BookOpen,
  Mail,
  BarChart3,
  Settings,
  Building,
  Activity,
  Globe,
  Database,
  Users,
  Shield,
  Clipboard,
  Search,
  Brain,
  LogOut,
  MessageCircle
} from "lucide-react";

// Customer permissions interface
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

// Navigation item interface
interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  permission: keyof CustomerPermissions;
  description?: string;
}

// All possible navigation items with German names
const ALL_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "dashboard",
    icon: LayoutDashboard,
    permission: "dashboard",
    description: "Übersicht und aktuelle Statistiken"
  },
  {
    name: "Regulatorische Updates",
    href: "regulatory-updates",
    icon: FileText,
    permission: "regulatoryUpdates",
    description: "Aktuelle regulatorische Änderungen"
  },
  {
    name: "Rechtsprechung",
    href: "legal-cases",
    icon: Scale,
    permission: "legalCases",
    description: "Rechtsprechung und Präzedenzfälle"
  },
  {
    name: "Wissensdatenbank",
    href: "knowledge-base",
    icon: BookOpen,
    permission: "knowledgeBase",
    description: "Wissensdatenbank und Artikel"
  },
  {
    name: "Newsletter",
    href: "newsletters",
    icon: Mail,
    permission: "newsletters",
    description: "Newsletter-Verwaltung"
  },
  {
    name: "Analytics",
    href: "analytics",
    icon: BarChart3,
    permission: "analytics",
    description: "Datenanalyse und Berichte"
  },
  {
    name: "Erweiterte Analytics", 
    href: "advanced-analytics",
    icon: Activity,
    permission: "advancedAnalytics",
    description: "Erweiterte Analysetools"
  },
  {
    name: "KI-Erkenntnisse",
    href: "ai-insights",
    icon: Brain,
    permission: "aiInsights",
    description: "KI-gestützte Erkenntnisse"
  },
  {
    name: "Globale Datenquellen",
    href: "global-sources",
    icon: Globe,
    permission: "globalSources",
    description: "Globale Datenquellen"
  },
  {
    name: "Datensammlung",
    href: "data-collection", 
    icon: Database,
    permission: "dataCollection",
    description: "Datensammlung und -verwaltung"
  },
  {
    name: "Historische Daten",
    href: "historical-data",
    icon: Clipboard,
    permission: "historicalData",
    description: "Historische Datenanalyse"
  },
  {
    name: "Einstellungen",
    href: "settings",
    icon: Settings,
    permission: "systemSettings",
    description: "Kundeneinstellungen"
  }
];

// Props interface
interface CustomerNavigationProps {
  permissions: CustomerPermissions;
  tenantName?: string;
  onPermissionsUpdate?: (newPermissions: CustomerPermissions) => void;
}

export default function CustomerNavigation({ permissions, tenantName, onPermissionsUpdate }: CustomerNavigationProps) {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const [currentPermissions, setCurrentPermissions] = useState(permissions);
  const { logout } = useAuth();
  
  // Build tenant-specific URLs
  const buildTenantUrl = (path: string) => {
    // Use mockTenantId as fallback if params.tenantId not available
    const mockTenantId = '030d3e01-32c4-4f95-8d54-98be948e8d4b';
    const tenantId = params.tenantId || mockTenantId;
    
    if (tenantId) {
      // Ensure path starts with slash for proper URL construction
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      const finalUrl = `/tenant/${tenantId}${normalizedPath}`;
      console.log('[CUSTOMER NAV] buildTenantUrl:', {
        inputPath: path,
        tenantId,
        normalizedPath,
        finalUrl
      });
      return finalUrl;
    }
    // Fallback to regular path
    return path.startsWith('/') ? path : `/${path}`;
  };

  // Use provided permissions directly - no additional API calls
  useEffect(() => {
    // Simply use the permissions passed as props
    setCurrentPermissions(permissions);
  }, [permissions]);

  // Filter navigation items based on current permissions
  const allowedItems = ALL_NAVIGATION_ITEMS.filter(item => 
    currentPermissions[item.permission]
  );


  const renderNavigationItem = (item: NavigationItem) => {
    const tenantUrl = buildTenantUrl(item.href);
    const isActive = location === tenantUrl || location === item.href;
    const IconComponent = item.icon;
    
    return (
      <Button 
        key={item.href}
        variant="outline" 
        size="sm" 
        className={cn(
          "w-full justify-start mb-2 h-auto py-3",
          isActive
            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
            : "hover:bg-blue-50 hover:text-blue-700"
        )}
        onClick={() => {
          console.log('[CUSTOMER NAV] Navigating to:', tenantUrl);
          setLocation(tenantUrl);
        }}
      >
        <IconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
        <div className="flex flex-col items-start text-left">
          <span className="font-medium">{item.name}</span>
          {item.description && (
            <span className="text-xs opacity-75 mt-0.5">
              {item.description}
            </span>
          )}
        </div>
      </Button>
    );
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-white border-r border-gray-200 shadow-lg z-40">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {tenantName?.charAt(0) || 'H'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {tenantName || "Customer Portal"}
            </h2>
            <p className="text-sm text-gray-500">Regulatory Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {allowedItems.length > 0 ? (
          <div className="space-y-2">
            {allowedItems.map((item, index) => {
              const tenantUrl = buildTenantUrl(item.href);
              const isActive = location === tenantUrl || location.includes(item.href);
              
              return (
                <Button 
                  key={`nav-${index}-${item.href}`}
                  variant={isActive ? "default" : "outline"}
                  size="sm" 
                  className={cn(
                    "w-full justify-start mb-2 h-auto py-3 transition-all duration-200",
                    isActive 
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" 
                      : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                  )}
                  onClick={() => {
                    console.log(`[CUSTOMER NAV] Navigating to: ${item.name} -> ${tenantUrl}`);
                    setLocation(tenantUrl);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium">{item.name}</span>
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
            <p className="text-sm text-gray-500">
              Keine Navigation verfügbar
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Berechtigung wird geladen...
            </p>
          </div>
        )}
      </nav>

      {/* Footer with Logout and Chat */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => {
            const chatUrl = params.tenantId ? `/tenant/${params.tenantId}/chat-support` : '/customer/chat-support';
            setLocation(chatUrl);
          }}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Support Chat
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" 
          onClick={() => {
            logout();
            window.location.reload();
          }}
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

// Export permission types for use in other components
export type { CustomerPermissions, NavigationItem };