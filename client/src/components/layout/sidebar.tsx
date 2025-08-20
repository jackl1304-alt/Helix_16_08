import React, { useState } from "react";
import { Link, useLocation } from "wouter";
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
  LogOut,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/hooks/use-auth";

// Verbesserte thematische Sidebar-Struktur basierend auf Benutzeranalyse
interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
  defaultOpen?: boolean;
  hiddenItems?: NavigationItem[];
}

const getNavigationStructure = (t: (key: string) => string): Record<string, NavigationSection> => ({
  // 1. OVERVIEW & CONTROL
  overview: {
    title: t('nav.sections.overview'),
    items: [
      { name: t('nav.dashboard'), href: "/", icon: BarChart3 },
      { name: t('nav.analytics'), href: "/analytics", icon: TrendingUp },
    ],
    defaultOpen: true
  },

  // 2. DATA MANAGEMENT 
  dataManagement: {
    title: t('nav.sections.dataManagement'),
    items: [
      { name: t('nav.dataCollection'), href: "/data-collection", icon: Database },
      { name: t('nav.newsletterAdmin'), href: "/newsletter-admin", icon: Mail },
      { name: t('nav.emailManagement'), href: "/email-management", icon: Mail },
      { name: t('nav.knowledgeBase'), href: "/knowledge-base", icon: Book },
    ],
    defaultOpen: true
  },

  // 3. COMPLIANCE & REGULATION
  compliance: {
    title: t('nav.sections.compliance'),
    items: [
      { name: t('nav.regulatoryUpdates'), href: "/regulatory-updates", icon: FileText },
      { name: t('nav.legalCases'), href: "/rechtsprechung", icon: Scale },
    ],
    defaultOpen: true
  },

  // 4. APPROVALS & REGISTRATION
  approvals: {
    title: t('nav.sections.approvals'),
    items: [
      { name: t('nav.globalApprovals'), href: "/zulassungen/global", icon: Globe },
      { name: t('nav.ongoingApprovals'), href: "/zulassungen/laufende", icon: CheckCircle },
    ],
    defaultOpen: true
  },

  // 5. ADVANCED (collapsible)
  advanced: {
    title: t('nav.sections.advanced'),
    items: [
      { name: t('nav.syncManager'), href: "/sync-manager", icon: RefreshCw },
      { name: t('nav.globalSources'), href: "/global-sources", icon: Globe },
      { name: t('nav.newsletterManager'), href: "/newsletter-manager", icon: Newspaper },
      { name: t('nav.historicalData'), href: "/historical-data", icon: Archive },
      { name: t('nav.customerManagement'), href: "/admin-customers", icon: Building },
      { name: t('nav.userManagement'), href: "/user-management", icon: Users },
      { name: t('nav.systemAdmin'), href: "/administration", icon: Settings },
      { name: t('nav.auditLogs'), href: "/audit-logs", icon: FileSearch },
    ],
    defaultOpen: false,
    hiddenItems: [
      { name: "🧠", href: "/ai-content-analysis", icon: Brain },
      { name: "🤖", href: "/ki-insights", icon: Bot },
      { name: "✨", href: "/grip-integration", icon: Sparkles },
    ]
  }
});

// Sidebar Search Field Component
function SidebarSearchField() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to intelligent search page with query
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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder={t('search.askQuestion')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-gray-50 transition-colors duration-200"
          data-testid="sidebar-search-input"
        />
      </div>
    </form>
  );
}

export function Sidebar() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const { logout } = useAuth();
  const navigationStructure = getNavigationStructure(t);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // Initialize with default open states
    const initial: Record<string, boolean> = {};
    Object.entries(navigationStructure).forEach(([key, section]) => {
      initial[key] = section.defaultOpen || false;
    });
    return initial;
  });

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const isActive = location === item.href;
    const IconComponent = item.icon;
    
    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "flex items-center justify-start px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer text-left",
          isActive
            ? "bg-blue-50 text-blue-700 shadow-sm"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        )}
      >
        <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
        <span className="text-left">{item.name}</span>
      </Link>
    );
  };

  const renderHiddenItems = (hiddenItems: NavigationItem[]) => {
    return (
      <div className="flex justify-center space-x-4 py-3 border-t border-gray-200 dark:border-gray-700 mt-2">
        {hiddenItems.map((item) => {
          const isActive = location === item.href;
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 cursor-pointer",
                isActive
                  ? "bg-[#07233e] text-white shadow-md"
                  : "text-gray-700 hover:bg-[#f0f8ff] hover:text-[#07233e]"
              )}
              title={item.name}
            >
              <IconComponent className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    );
  };

  const renderNavigationSection = (sectionKey: string, section: NavigationSection) => {
    const isExpanded = expandedSections[sectionKey];
    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
    
    return (
      <div key={sectionKey} className="mb-3">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors duration-200 text-left"
        >
          <span>{section.title}</span>
          <ChevronIcon className="h-4 w-4" />
        </button>
        
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {section.items.map(renderNavigationItem)}
            {section.hiddenItems && renderHiddenItems(section.hiddenItems)}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-50 overflow-y-auto border-r border-gray-200">
      {/* DELTA WAYS Logo Header */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/">
          <div className="flex flex-col items-center cursor-pointer space-y-2">
            <Logo size="lg" showText={true} />
          </div>
        </Link>
        

      </div>
      
      {/* Funktionsfähiger Suchbereich */}
      <div className="p-4 border-b border-gray-200">
        <SidebarSearchField />
      </div>
      
      {/* Thematisch organisierte Navigation */}
      <nav className="mt-4 pb-8 flex-1 overflow-y-auto">
        <div className="px-2 space-y-2">
          {Object.entries(navigationStructure).map(([sectionKey, section]) =>
            renderNavigationSection(sectionKey, section)
          )}
        </div>
      </nav>
      
      {/* Status-Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span>{t('status.label')}:</span>
            <span className="text-green-400 font-medium">{t('status.online')}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>{t('status.dataSources')}</span>
            <span className="text-blue-400 font-medium">{t('common.active')}</span>
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="mt-3 pt-3 border-t border-gray-300">
          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            className="flex items-center w-full px-2 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Tenant Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}