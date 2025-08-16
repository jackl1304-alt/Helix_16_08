import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
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
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard",
    description: "Übersicht und aktuelle Statistiken"
  },
  {
    name: "Regulatorische Updates",
    href: "/regulatory-updates",
    icon: FileText,
    permission: "regulatoryUpdates",
    description: "Aktuelle regulatorische Änderungen"
  },
  {
    name: "Rechtsprechung",
    href: "/legal-cases",
    icon: Scale,
    permission: "legalCases",
    description: "Rechtsprechung und Präzedenzfälle"
  },
  {
    name: "Wissensdatenbank",
    href: "/knowledge-base",
    icon: BookOpen,
    permission: "knowledgeBase",
    description: "Wissensdatenbank und Artikel"
  },
  {
    name: "Newsletter",
    href: "/newsletters",
    icon: Mail,
    permission: "newsletters",
    description: "Newsletter-Verwaltung"
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    permission: "analytics",
    description: "Datenanalyse und Berichte"
  },
  {
    name: "Erweiterte Analytics", 
    href: "/advanced-analytics",
    icon: Activity,
    permission: "advancedAnalytics",
    description: "Erweiterte Analysetools"
  },
  {
    name: "KI-Erkenntnisse",
    href: "/ai-insights",
    icon: Brain,
    permission: "aiInsights",
    description: "KI-gestützte Erkenntnisse"
  },
  {
    name: "Globale Datenquellen",
    href: "/global-sources",
    icon: Globe,
    permission: "globalSources",
    description: "Globale Datenquellen"
  },
  {
    name: "Datensammlung",
    href: "/data-collection", 
    icon: Database,
    permission: "dataCollection",
    description: "Datensammlung und -verwaltung"
  },
  {
    name: "Historische Daten",
    href: "/historical-data",
    icon: Clipboard,
    permission: "historicalData",
    description: "Historische Datenanalyse"
  },
  {
    name: "Einstellungen",
    href: "/settings",
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
  
  // Build tenant-specific URLs
  const buildTenantUrl = (path: string) => {
    if (params.tenantId) {
      return `/tenant/${params.tenantId}${path}`;
    }
    return path;
  };

  // Polling für Live-Updates der Berechtigungen
  useEffect(() => {
    if (!params.tenantId) return;
    
    const pollPermissions = async () => {
      try {
        const response = await fetch(`/api/customer/tenant/${params.tenantId}`);
        if (response.ok) {
          const tenantData = await response.json();
          if (tenantData.customerPermissions) {
            setCurrentPermissions(tenantData.customerPermissions);
            onPermissionsUpdate?.(tenantData.customerPermissions);
          }
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der aktuellen Berechtigungen:', error);
      }
    };

    // Initial load
    pollPermissions();
    
    // Poll alle 5 Sekunden für Live-Updates
    const interval = setInterval(pollPermissions, 5000);
    
    return () => clearInterval(interval);
  }, [params.tenantId, onPermissionsUpdate]);

  // Filter navigation items based on current permissions
  const allowedItems = ALL_NAVIGATION_ITEMS.filter(item => 
    currentPermissions[item.permission]
  );

  const renderNavigationItem = (item: NavigationItem) => {
    const tenantUrl = buildTenantUrl(item.href);
    const isActive = location === tenantUrl || location === item.href;
    const IconComponent = item.icon;
    
    return (
      <button
        key={item.href}
        onClick={() => setLocation(tenantUrl)}
        className={cn(
          "w-full flex items-center justify-start px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group",
          isActive
            ? "bg-blue-600 text-white shadow-md"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
        )}
      >
        <IconComponent className={cn(
          "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
          isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"
        )} />
        <div className="flex flex-col">
          <span className="text-left font-medium">{item.name}</span>
          {item.description && (
            <span className={cn(
              "text-xs text-left mt-0.5",
              isActive ? "text-blue-100" : "text-gray-500"
            )}>
              {item.description}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-white border-r border-gray-200 shadow-sm z-40">
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
          allowedItems.map(renderNavigationItem)
        ) : (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-500">
              Keine Berechtigung für Navigation
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
          onClick={() => window.open('/chat-support', '_blank')}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Support Chat
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" 
          onClick={() => window.location.href = '/login'}
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