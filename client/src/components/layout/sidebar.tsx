import { Link, useLocation } from "wouter";
import { useState } from "react";
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
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoPath from "@assets/ICON Helix_1753735921077.jpg";

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

const navigationStructure: Record<string, NavigationSection> = {
  // 1. ÜBERSICHT & STEUERUNG
  overview: {
    title: "ÜBERSICHT & STEUERUNG",
    items: [
      { name: "Dashboard", href: "/", icon: BarChart3 },
      { name: "Berichte & Analysen", href: "/analytics", icon: TrendingUp },
    ],
    defaultOpen: true
  },

  // 2. DATENMANAGEMENT 
  dataManagement: {
    title: "DATENMANAGEMENT",
    items: [
      { name: "Datensammlung", href: "/data-collection", icon: Database },
      { name: "Newsletter-Verwaltung", href: "/newsletter-admin", icon: Mail },
      { name: "Wissensdatenbank", href: "/knowledge-base", icon: Book },
    ],
    defaultOpen: true
  },

  // 3. COMPLIANCE & REGULIERUNG
  compliance: {
    title: "COMPLIANCE & REGULIERUNG",
    items: [
      { name: "Regulatorische Updates", href: "/regulatory-updates", icon: FileText },
      { name: "Rechtsprechung", href: "/rechtsprechung", icon: Scale },
    ],
    defaultOpen: true
  },

  // 4. ERWEITERT (kollabierbar)
  advanced: {
    title: "ERWEITERT",
    items: [
      { name: "Sync-Verwaltung", href: "/sync-manager", icon: RefreshCw },
      { name: "Globale Quellen", href: "/global-sources", icon: Globe },
      { name: "Newsletter Manager", href: "/newsletter-manager", icon: Newspaper },
      { name: "Historische Daten", href: "/historical-data", icon: Archive },
      { name: "Benutzerverwaltung", href: "/user-management", icon: Users },
      { name: "System-Verwaltung", href: "/administration", icon: Settings },
      { name: "Datenquellen-Admin", href: "/administration/data-sources", icon: Database },
      { name: "Audit-Protokolle", href: "/audit-logs", icon: FileSearch },
    ],
    defaultOpen: false,
    hiddenItems: [
      { name: "🧠", href: "/ai-content-analysis", icon: Brain },
      { name: "🤖", href: "/ki-insights", icon: Bot },
      { name: "✨", href: "/grip-integration", icon: Sparkles },
    ]
  }
};

export function Sidebar() {
  const [location] = useLocation();
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
      
      {/* Optimierter Suchbereich */}
      <div className="p-4 border-b border-gray-100">
        <Link href="/intelligent-search">
          <div className="flex items-center px-3 py-2 bg-[#f0f8ff] rounded-lg border border-[#b0d4f6] hover:bg-[#e6f3ff] transition-colors duration-200 cursor-pointer">
            <Search className="h-4 w-4 text-[#07233e] mr-2" />
            <span className="text-sm text-[#07233e] font-medium">Intelligente Suche</span>
          </div>
        </Link>
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
            <span>Status:</span>
            <span className="text-green-600 font-medium">Online</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>46 Datenquellen</span>
            <span className="text-blue-600 font-medium">Aktiv</span>
          </div>
        </div>
      </div>
    </aside>
  );
}