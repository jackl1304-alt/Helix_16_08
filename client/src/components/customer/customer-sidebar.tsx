import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Database, 
  FileText, 
  Scale,
  Globe,
  Brain,
  Settings,
  LogOut,
  Search,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { Input } from "@/components/ui/input";
import { useCustomer } from "@/contexts/CustomerContext";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  permission: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
  defaultOpen?: boolean;
}

const getCustomerNavigation = (): Record<string, NavigationSection> => ({
  overview: {
    title: "Dashboard",
    items: [
      { name: "Übersicht", href: "/customer-area", icon: BarChart3, permission: "dashboard" }
    ],
    defaultOpen: true
  },
  content: {
    title: "Regulatory Intelligence",
    items: [
      { name: "Regulatory Updates", href: "/customer-area/regulatory-updates", icon: FileText, permission: "regulatory-updates" },
      { name: "Rechtsprechung", href: "/customer-area/rechtsprechung", icon: Scale, permission: "rechtsprechung" },
      { name: "Data Collection", href: "/customer-area/data-collection", icon: Database, permission: "data-collection" }
    ],
    defaultOpen: true
  },
  advanced: {
    title: "Erweitert",
    items: [
      { name: "Zulassungen", href: "/customer-area/zulassungen", icon: Globe, permission: "zulassungen-global" },
      { name: "KI Insights", href: "/customer-area/ai-insights", icon: Brain, permission: "ai-insights" },
      { name: "Berichte", href: "/customer-area/reports", icon: FileText, permission: "reports" }
    ],
    defaultOpen: false
  }
});

function CustomerSidebarSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/customer-area/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Suche..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
          data-testid="customer-sidebar-search"
        />
      </div>
    </form>
  );
}

export function CustomerSidebar() {
  const { customer, logout, hasPermission, theme } = useCustomer();
  const [location] = useLocation();
  const navigationStructure = getCustomerNavigation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
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
    if (!hasPermission(item.permission)) return null;
    
    const isActive = location === item.href;
    const IconComponent = item.icon;
    
    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "flex items-center justify-start px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer text-left",
          isActive
            ? `${theme.secondary} ${theme.accent} shadow-sm`
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        )}
        data-testid={`nav-${item.permission}`}
      >
        <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
        <span className="text-left">{item.name}</span>
      </Link>
    );
  };

  const renderNavigationSection = (sectionKey: string, section: NavigationSection) => {
    const isExpanded = expandedSections[sectionKey];
    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
    const visibleItems = section.items.filter(item => hasPermission(item.permission));
    
    if (visibleItems.length === 0) return null;
    
    return (
      <div key={sectionKey} className="mb-3">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors duration-200 text-left"
          data-testid={`section-${sectionKey}`}
        >
          <span>{section.title}</span>
          <ChevronIcon className="h-4 w-4" />
        </button>
        
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {visibleItems.map(renderNavigationItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-50 overflow-y-auto border-r border-gray-200">
      {/* Logo Header */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/customer-area">
          <div className="flex flex-col items-center cursor-pointer space-y-2">
            <Logo size="lg" showText={true} />
          </div>
        </Link>
        
        {/* Customer Info */}
        <div className={`mt-4 p-3 ${theme.secondary} rounded-lg`}>
          <div className="text-sm font-medium text-gray-800">
            {customer?.companyName}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {customer?.subscription} Plan
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <CustomerSidebarSearch />
      </div>
      
      {/* Navigation */}
      <nav className="mt-4 pb-8 flex-1 overflow-y-auto">
        <div className="px-2 space-y-2">
          {Object.entries(navigationStructure).map(([sectionKey, section]) =>
            renderNavigationSection(sectionKey, section)
          )}
        </div>
      </nav>
      
      {/* Footer with Settings and Logout */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="space-y-2">
          <Link
            to="/customer-area/settings"
            className="flex items-center w-full px-2 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            data-testid="nav-settings"
          >
            <Settings className="h-4 w-4 mr-2" />
            <span>Einstellungen</span>
          </Link>
          
          <button
            onClick={() => {
              logout();
              window.location.href = "/customer-login";
            }}
            className="flex items-center w-full px-2 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Abmelden</span>
          </button>
        </div>
        
        <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-300">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-green-500 font-medium">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}