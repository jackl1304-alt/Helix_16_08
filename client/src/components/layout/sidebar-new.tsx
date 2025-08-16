import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  Database, 
  Globe,
  FileText, 
  Newspaper, 
  CheckCircle, 
  TrendingUp,
  Brain,
  Book,
  Users,
  Settings,
  Archive,
  Shield,
  Search,
  RefreshCw,
  Scale,
  FileSearch,
  ChevronDown,
  ChevronRight,
  Mail,
  Bot,
  Sparkles,
  Building,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoPath from "@assets/ICON Helix_1753735921077.jpg";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";

// JSON-basierte Admin Navigation Schema
interface AdminPermissions {
  dashboard: boolean;
  analytics: boolean;
  dataCollection: boolean;
  newsletterAdmin: boolean;
  emailManagement: boolean;
  knowledgeBase: boolean;
  regulatoryUpdates: boolean;
  legalCases: boolean;
  globalApprovals: boolean;
  ongoingApprovals: boolean;
  syncManager: boolean;
  globalSources: boolean;
  newsletterManager: boolean;
  historicalData: boolean;
  customerManagement: boolean;
  userManagement: boolean;
  systemAdmin: boolean;
  auditLogs: boolean;
  aiContentAnalysis: boolean;
  kiInsights: boolean;
  gripIntegration: boolean;
}

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  permission: keyof AdminPermissions;
  description?: string;
}

interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
  defaultOpen: boolean;
  hiddenItems?: NavigationItem[];
}

interface AdminNavigationConfig {
  sections: NavigationSection[];
}

// JSON Navigation Configuration
const ADMIN_NAVIGATION_CONFIG: AdminNavigationConfig = {
  sections: [
    {
      id: "overview",
      title: "nav.sections.overview",
      defaultOpen: true,
      items: [
        {
          id: "dashboard",
          name: "nav.dashboard",
          href: "/",
          icon: "BarChart3",
          permission: "dashboard",
          description: "Admin Dashboard"
        },
        {
          id: "analytics",
          name: "nav.analytics",
          href: "/analytics",
          icon: "TrendingUp",
          permission: "analytics",
          description: "Analytics Overview"
        }
      ]
    },
    {
      id: "dataManagement",
      title: "nav.sections.dataManagement",
      defaultOpen: true,
      items: [
        {
          id: "dataCollection",
          name: "nav.dataCollection",
          href: "/data-collection",
          icon: "Database",
          permission: "dataCollection",
          description: "Data Collection Management"
        },
        {
          id: "newsletterAdmin",
          name: "nav.newsletterAdmin",
          href: "/newsletter-admin",
          icon: "Mail",
          permission: "newsletterAdmin",
          description: "Newsletter Administration"
        },
        {
          id: "emailManagement",
          name: "nav.emailManagement",
          href: "/email-management",
          icon: "Mail",
          permission: "emailManagement",
          description: "Email Management"
        },
        {
          id: "knowledgeBase",
          name: "nav.knowledgeBase",
          href: "/knowledge-base",
          icon: "Book",
          permission: "knowledgeBase",
          description: "Knowledge Base Management"
        }
      ]
    },
    {
      id: "compliance",
      title: "nav.sections.compliance",
      defaultOpen: true,
      items: [
        {
          id: "regulatoryUpdates",
          name: "nav.regulatoryUpdates",
          href: "/regulatory-updates",
          icon: "FileText",
          permission: "regulatoryUpdates",
          description: "Regulatory Updates"
        },
        {
          id: "legalCases",
          name: "nav.legalCases",
          href: "/rechtsprechung",
          icon: "Scale",
          permission: "legalCases",
          description: "Legal Cases Management"
        }
      ]
    },
    {
      id: "approvals",
      title: "nav.sections.approvals",
      defaultOpen: true,
      items: [
        {
          id: "globalApprovals",
          name: "nav.globalApprovals",
          href: "/zulassungen/global",
          icon: "Globe",
          permission: "globalApprovals",
          description: "Global Approvals"
        },
        {
          id: "ongoingApprovals",
          name: "nav.ongoingApprovals",
          href: "/zulassungen/laufende",
          icon: "CheckCircle",
          permission: "ongoingApprovals",
          description: "Ongoing Approvals"
        }
      ]
    },
    {
      id: "advanced",
      title: "nav.sections.advanced",
      defaultOpen: false,
      items: [
        {
          id: "syncManager",
          name: "nav.syncManager",
          href: "/sync-manager",
          icon: "RefreshCw",
          permission: "syncManager",
          description: "Sync Manager"
        },
        {
          id: "globalSources",
          name: "nav.globalSources",
          href: "/global-sources",
          icon: "Globe",
          permission: "globalSources",
          description: "Global Sources"
        },
        {
          id: "newsletterManager",
          name: "nav.newsletterManager",
          href: "/newsletter-manager",
          icon: "Newspaper",
          permission: "newsletterManager",
          description: "Newsletter Manager"
        },
        {
          id: "historicalData",
          name: "nav.historicalData",
          href: "/historical-data",
          icon: "Archive",
          permission: "historicalData",
          description: "Historical Data"
        },
        {
          id: "customerManagement",
          name: "nav.customerManagement",
          href: "/admin-customers",
          icon: "Building",
          permission: "customerManagement",
          description: "Customer Management"
        },
        {
          id: "userManagement",
          name: "nav.userManagement",
          href: "/user-management",
          icon: "Users",
          permission: "userManagement",
          description: "User Management"
        },
        {
          id: "systemAdmin",
          name: "nav.systemAdmin",
          href: "/administration",
          icon: "Settings",
          permission: "systemAdmin",
          description: "System Administration"
        },
        {
          id: "auditLogs",
          name: "nav.auditLogs",
          href: "/audit-logs",
          icon: "FileSearch",
          permission: "auditLogs",
          description: "Audit Logs"
        }
      ],
      hiddenItems: [
        {
          id: "aiContentAnalysis",
          name: "🧠",
          href: "/ai-content-analysis",
          icon: "Brain",
          permission: "aiContentAnalysis",
          description: "AI Content Analysis"
        },
        {
          id: "kiInsights",
          name: "🤖",
          href: "/ki-insights",
          icon: "Bot",
          permission: "kiInsights",
          description: "KI Insights"
        },
        {
          id: "gripIntegration",
          name: "✨",
          href: "/grip-integration",
          icon: "Sparkles",
          permission: "gripIntegration",
          description: "GRIP Integration"
        }
      ]
    }
  ]
};

// Icon mapping
const ICON_MAP = {
  BarChart3,
  TrendingUp,
  Database,
  Mail,
  Book,
  FileText,
  Scale,
  Globe,
  CheckCircle,
  RefreshCw,
  Newspaper,
  Archive,
  Building,
  Users,
  Settings,
  FileSearch,
  Brain,
  Bot,
  Sparkles
};

// Hook for fetching admin permissions
function useAdminPermissions() {
  return useQuery({
    queryKey: ['/api/admin/permissions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/permissions');
      if (!response.ok) {
        throw new Error(`Failed to fetch admin permissions: ${response.status}`);
      }
      return await response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Search Field Component
function SidebarSearchField() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/intelligent-search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#07233e]" />
        <Input
          type="text"
          placeholder={t('search.askQuestion')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-4 py-2 bg-[#f0f8ff] border border-[#b0d4f6] rounded-lg text-sm text-[#07233e] placeholder-[#07233e]/70 focus:outline-none focus:ring-2 focus:ring-[#07233e] focus:border-transparent hover:bg-[#e6f3ff] transition-colors duration-200"
          data-testid="sidebar-search-input"
        />
      </div>
    </form>
  );
}

export function AdminSidebarNew() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const { logout } = useAuth();
  const { data: adminPermissions, isLoading } = useAdminPermissions();
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ADMIN_NAVIGATION_CONFIG.sections.forEach((section) => {
      initial[section.id] = section.defaultOpen;
    });
    return initial;
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderNavigationItem = (item: NavigationItem) => {
    // Check permission
    if (adminPermissions && !adminPermissions[item.permission]) {
      return null;
    }

    const isActive = location === item.href;
    const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP];
    
    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          "flex items-center justify-start px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer text-left",
          isActive
            ? "bg-[#07233e] text-white shadow-md"
            : "text-gray-700 hover:bg-[#f0f8ff] hover:text-[#07233e]"
        )}
        data-testid={`nav-${item.id}`}
      >
        {IconComponent && <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />}
        <span className="text-left">{t(item.name)}</span>
      </Link>
    );
  };

  const renderHiddenItems = (hiddenItems: NavigationItem[]) => {
    return (
      <div className="flex justify-center space-x-4 py-3 border-t border-gray-200 dark:border-gray-700 mt-2">
        {hiddenItems.map((item) => {
          // Check permission
          if (adminPermissions && !adminPermissions[item.permission]) {
            return null;
          }

          const isActive = location === item.href;
          const IconComponent = ICON_MAP[item.icon as keyof typeof ICON_MAP];
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 cursor-pointer",
                isActive
                  ? "bg-[#07233e] text-white shadow-md"
                  : "text-gray-700 hover:bg-[#f0f8ff] hover:text-[#07233e]"
              )}
              title={item.description}
              data-testid={`nav-hidden-${item.id}`}
            >
              {IconComponent ? <IconComponent className="h-5 w-5" /> : item.name}
            </Link>
          );
        })}
      </div>
    );
  };

  const renderNavigationSection = (section: NavigationSection) => {
    const isExpanded = expandedSections[section.id];
    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
    
    // Filter items based on permissions
    const allowedItems = section.items.filter(item => 
      !adminPermissions || adminPermissions[item.permission]
    );
    
    const allowedHiddenItems = section.hiddenItems?.filter(item => 
      !adminPermissions || adminPermissions[item.permission]
    );

    if (allowedItems.length === 0 && (!allowedHiddenItems || allowedHiddenItems.length === 0)) {
      return null;
    }
    
    return (
      <div key={section.id} className="mb-3">
        <button
          onClick={() => toggleSection(section.id)}
          className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-[#07233e] transition-colors duration-200 text-left"
          data-testid={`nav-section-${section.id}`}
        >
          <span>{t(section.title)}</span>
          <ChevronIcon className="h-4 w-4" />
        </button>
        
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {allowedItems.map(renderNavigationItem)}
            {allowedHiddenItems && allowedHiddenItems.length > 0 && renderHiddenItems(allowedHiddenItems)}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-64 deltaways-nav shadow-lg z-50 overflow-y-auto">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#07233e]"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 deltaways-nav shadow-lg z-50 overflow-y-auto">
      {/* DELTA WAYS Logo Header */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/">
          <div className="flex flex-col items-center cursor-pointer space-y-2">
            <img 
              src={logoPath} 
              alt="Helix Logo" 
              className="h-32 w-32 object-cover rounded-lg ring-2 ring-[#b0d4f6]"
            />
            <span className="text-lg deltaways-brand-text text-[#07233e]">HELIX</span>
            <p className="text-xs font-medium text-gray-600">Powered by DELTA WAYS</p>
          </div>
        </Link>
      </div>
      
      {/* Search Field */}
      <div className="p-4 border-b border-gray-100">
        <SidebarSearchField />
      </div>
      
      {/* JSON-based Navigation */}
      <nav className="mt-4 pb-8 flex-1 overflow-y-auto">
        <div className="px-2 space-y-2">
          {ADMIN_NAVIGATION_CONFIG.sections.map(renderNavigationSection)}
        </div>
      </nav>
      
      {/* Status Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>{t('status.label')}:</span>
            <span className="text-green-600 font-medium">{t('status.online')}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>{t('status.dataSources')}</span>
            <span className="text-blue-600 font-medium">{t('common.active')}</span>
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="mt-3 pt-3 border-t border-gray-300">
          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            className="flex items-center w-full px-2 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            data-testid="logout-button"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Abmelden</span>
          </button>
        </div>
      </div>
    </aside>
  );
}