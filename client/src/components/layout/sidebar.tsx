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
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
// import logoPath from "@assets/ICON Helix_1753735921077.jpg"; // Logo temporär deaktiviert
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

// Vereinfachte Navigation - nur existierende Seiten
const getNavigationStructure = (): Record<string, NavigationSection> => ({
  // Hauptmodule
  main: {
    title: "Hauptmodule",
    items: [
      { name: "Dashboard", href: "/", icon: BarChart3 },
      { name: "Regulatory Updates", href: "/regulatory-updates", icon: FileText },
      { name: "Analytics", href: "/analytics", icon: TrendingUp },
    ],
    defaultOpen: true
  },

  // Datenmanagement
  data: {
    title: "Datenmanagement",
    items: [
      { name: "Data Collection", href: "/data-collection", icon: Database },
      { name: "Knowledge Base", href: "/knowledge-base", icon: Book },
    ],
    defaultOpen: true
  },

  // Administration
  admin: {
    title: "Administration",
    items: [
      { name: "User Management", href: "/user-management", icon: Users },
      { name: "System Settings", href: "/system-settings", icon: Settings },
    ],
    defaultOpen: false
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

export function Sidebar() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const { logout } = useAuth();
  const navigationStructure = getNavigationStructure();
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
        href={item.href}
        className={cn(
          "flex items-center justify-start px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer text-left",
          isActive
            ? "bg-[#07233e] text-white shadow-md"
            : "text-gray-700 hover:bg-[#f0f8ff] hover:text-[#07233e]"
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
              href={item.href}
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
          className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-[#07233e] transition-colors duration-200 text-left"
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-40 overflow-y-auto border-r border-gray-200">
      {/* DELTA WAYS Logo Header */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/">
          <div className="flex flex-col items-center cursor-pointer space-y-2">
            <img 
              src="/favicon.ico" 
              alt="Helix Logo" 
              className="h-32 w-32 object-cover rounded-lg ring-2 ring-[#b0d4f6]"
            />
            <span className="text-lg deltaways-brand-text text-[#07233e]">HELIX</span>
            <p className="text-xs font-medium text-gray-600">Powered by DELTA WAYS</p>
          </div>
        </Link>
        
      </div>
      
      {/* Funktionsfähiger Suchbereich */}
      <div className="p-4 border-b border-gray-100">
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
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Abmelden</span>
          </button>
        </div>
      </div>
    </aside>
  );
}