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
    name: "Genehmigungsworkflow",
    href: "/approval-workflow",
    icon: CheckCircle,
    current: false,
    description: "Freigabeprozesse"
  },
  {
    name: "Historische Daten",
    href: "/historical-data",
    icon: Calendar,
    current: false,
    description: "Archivierte Dokumente"
  },
  {
    name: "Rechtsfälle",
    href: "/legal-cases",
    icon: Scale,
    current: false,
    description: "Jurisprudenz-Datenbank"
  },

  {
    name: "Knowledge Base",
    href: "/knowledge-base",
    icon: BookOpen,
    current: false,
    description: "Wissensdatenbank"
  },
  {
    name: "Benutzerverwaltung",
    href: "/user-management",
    icon: Users,
    current: false,
    description: "Nutzer & Berechtigungen"
  },
  {
    name: "Systemeinstellungen",
    href: "/system-settings",
    icon: Settings,
    current: false,
    description: "Konfiguration"
  },
  {
    name: "Audit-Logs",
    href: "/audit-logs",
    icon: FileCheck,
    current: false,
    description: "Systemprotokoll"
  },
];

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
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-2 border-blue-600"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
                )}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
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