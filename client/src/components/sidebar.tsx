import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Database, 
  Globe, 
  BarChart3, 
  FileText, 
  Mail, 
  CheckCircle, 
  Users, 
  Settings, 
  FileCheck, 
  Brain, 
  BookOpen, 
  Calendar,
  Scale,
  Home,
  Activity,
  Bot
} from "lucide-react";

// Main Navigation
const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    current: false,
    description: "Übersicht und KPIs"
  },
  {
    name: "Datensammlung",
    href: "/data-collection",
    icon: Database,
    current: false,
    description: "Automatisierte Datenerfassung"
  },
  {
    name: "Globale Quellen",
    href: "/global-sources",
    icon: Globe,
    current: false,
    description: "Weltweite Regulierungsquellen"
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    current: false,
    description: "Datenanalyse und Berichte"
  },
  {
    name: "Erweiterte Analytics",
    href: "/advanced-analytics",
    icon: Activity,
    current: false,
    description: "Fortgeschrittene Analysen"
  },
  {
    name: "Regulierungs-Updates",
    href: "/regulatory-updates",
    icon: FileText,
    current: false,
    description: "Aktuelle Änderungen"
  },
  {
    name: "Newsletter-Manager",
    href: "/newsletter-manager",
    icon: Mail,
    current: false,
    description: "Newsletter-Verwaltung"
  },
  {
    name: "Historische Daten",
    href: "/historical-data",
    icon: Calendar,
    current: false,
    description: "Archivierte Dokumente"
  }
];

// AI & Knowledge Navigation
const aiNavigation = [
  {
    name: "KI-Insights",
    href: "/ai-insights",
    icon: Brain,
    current: false,
    description: "AI-gestützte Analysen"
  },
  {
    name: "KI-Analyse",
    href: "/ai-analysis",
    icon: Bot,
    current: false,
    description: "Kombinierte KI-Analysen"
  },
  {
    name: "Wissenssammlung",
    href: "/knowledge-base",
    icon: BookOpen,
    current: false,
    description: "Zentrale Wissensdatenbank"
  },
  {
    name: "Intelligente Suche",
    href: "/intelligent-search",
    icon: Brain,
    current: false,
    description: "KI-gestützte Suche"
  },
  {
    name: "Terminologie",
    href: "/terminology-glossary",
    icon: BookOpen,
    current: false,
    description: "Fachbegriffe und Glossar"
  }
];

// Regulatory & Legal Navigation
const regulatoryNavigation = [
  {
    name: "Rechtsprechung",
    href: "/rechtsprechung",
    icon: Scale,
    current: false,
    description: "Rechtliche Entscheidungen"
  },
  {
    name: "Globale Zulassungen",
    href: "/zulassungen-global",
    icon: Globe,
    current: false,
    description: "Weltweite Zulassungen"
  },
  {
    name: "Laufende Zulassungen",
    href: "/laufende-zulassungen",
    icon: Activity,
    current: false,
    description: "Aktuelle Zulassungsverfahren"
  },
  {
    name: "Genehmigungsworkflow",
    href: "/approval-workflow",
    icon: CheckCircle,
    current: false,
    description: "Approval-Prozesse"
  }
];

// Integration & Tools Navigation
const integrationNavigation = [
  {
    name: "GRIP Integration",
    href: "/grip-integration",
    icon: Database,
    current: false,
    description: "GRIP Plattform Integration"
  },
  {
    name: "GRIP Daten",
    href: "/grip-data",
    icon: FileCheck,
    current: false,
    description: "GRIP Datenquellen"
  },
  {
    name: "Sync Manager",
    href: "/sync-manager",
    icon: CheckCircle,
    current: false,
    description: "Synchronisation verwalten"
  },
  {
    name: "E-Mail Management",
    href: "/email-management",
    icon: Mail,
    current: false,
    description: "E-Mail Verwaltung"
  },
  {
    name: "Chat Support",
    href: "/chat-support",
    icon: Bot,
    current: false,
    description: "Chat-basierter Support"
  }
];

// Admin Navigation
const adminNavigation = [
  {
    name: "Administration",
    href: "/administration",
    icon: Settings,
    current: false,
    description: "Systemverwaltung"
  },
  {
    name: "Benutzerverwaltung",
    href: "/admin/users",
    icon: Users,
    current: false,
    description: "Nutzer & Berechtigungen"
  },
  {
    name: "Kundenverwaltung",
    href: "/admin/customers",
    icon: Users,
    current: false,
    description: "Kunden verwalten"
  },
  {
    name: "Datenquellen Admin",
    href: "/admin/data-sources",
    icon: Database,
    current: false,
    description: "Datenquellen-Administration"
  },
  {
    name: "Glossar Admin",
    href: "/admin/glossary",
    icon: BookOpen,
    current: false,
    description: "Terminologie verwalten"
  },
  {
    name: "Newsletter Admin",
    href: "/admin/newsletters",
    icon: Mail,
    current: false,
    description: "Newsletter-Administration"
  },
  {
    name: "Systemeinstellungen",
    href: "/admin/settings",
    icon: Settings,
    current: false,
    description: "Systemkonfiguration"
  },
  {
    name: "Audit-Logs",
    href: "/admin/audit-logs",
    icon: FileCheck,
    current: false,
    description: "Systemprotokoll"
  }
];

// Customer Portal Navigation
const customerNavigation = [
  {
    name: "Kunden-Dashboard",
    href: "/customer/dashboard",
    icon: Home,
    current: false,
    description: "Kunden-Übersicht"
  },
  {
    name: "Kunden-KI-Insights",
    href: "/customer/ai-insights",
    icon: Brain,
    current: false,
    description: "KI-Analysen für Kunden"
  },
  {
    name: "Kunden-Analytics",
    href: "/customer/analytics",
    icon: BarChart3,
    current: false,
    description: "Kundenspezifische Analysen"
  },
  {
    name: "Kunden-Einstellungen",
    href: "/customer/settings",
    icon: Settings,
    current: false,
    description: "Kunden-Konfiguration"
  }
];

// Tenant Management Navigation  
const tenantNavigation = [
  {
    name: "Tenant-Anmeldung",
    href: "/tenant/auth",
    icon: Users,
    current: false,
    description: "Tenant-Authentifizierung"
  },
  {
    name: "Tenant-Dashboard",
    href: "/tenant/dashboard", 
    icon: Home,
    current: false,
    description: "Tenant-Übersicht"
  },
  {
    name: "Tenant-Onboarding",
    href: "/tenant/onboarding",
    icon: CheckCircle,
    current: false,
    description: "Tenant-Einrichtung"
  }
];

// Navigation Section Component
function NavigationSection({ 
  title, 
  items, 
  location, 
  isCollapsible = false,
  defaultCollapsed = false 
}: { 
  title: string; 
  items: any[]; 
  location: string; 
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
}) {
  const renderNavItem = (item: any) => {
    const isActive = location === item.href;
    const Icon = item.icon;
    
    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
          isActive
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
        )}
      >
        <Icon
          className={cn(
            "mr-3 h-4 w-4 flex-shrink-0",
            isActive
              ? "text-white"
              : "text-gray-500 group-hover:text-blue-600"
          )}
        />
        <div className="flex-1">
          <div className="font-medium">{item.name}</div>
          {item.description && (
            <div className={cn(
              "text-xs mt-0.5",
              isActive 
                ? "text-blue-100" 
                : "text-gray-500 group-hover:text-blue-600"
            )}>
              {item.description}
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="mb-6">
      <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map(renderNavItem)}
      </div>
    </div>
  );
}

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Logo-Bereich */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Helix
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              MedTech Regulatory Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <NavigationSection 
          title="Hauptmodule" 
          items={navigation} 
          location={location} 
        />
        
        <NavigationSection 
          title="KI & Wissen" 
          items={aiNavigation} 
          location={location} 
        />
        
        <NavigationSection 
          title="Regulatorisch & Legal" 
          items={regulatoryNavigation} 
          location={location} 
        />
        
        <NavigationSection 
          title="Integration & Tools" 
          items={integrationNavigation} 
          location={location} 
        />
        
        <NavigationSection 
          title="Kundenbereiche" 
          items={customerNavigation} 
          location={location} 
        />
        
        <NavigationSection 
          title="Tenant Management" 
          items={tenantNavigation} 
          location={location} 
        />
        
        <NavigationSection 
          title="Administration" 
          items={adminNavigation} 
          location={location} 
        />
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <div className="font-medium">Helix Platform</div>
          <div className="mt-1">Version 2.0</div>
          <div className="mt-1">© 2025 MedTech Intelligence</div>
        </div>
      </div>
    </div>
  );
}