import { useState } from "react";
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
  Menu,
  X,
  Scale,
  Activity,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import logoPath from "@assets/ICON Helix_1753735921077.jpg";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    description: "Übersicht und KPIs"
  },
  {
    name: "Datensammlung",
    href: "/data-collection",
    icon: Database,
    description: "Automatisierte Datenerfassung"
  },
  {
    name: "Globale Quellen",
    href: "/global-sources",
    icon: Globe,
    description: "Weltweite Regulierungsquellen"
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Datenanalyse und Berichte"
  },
  {
    name: "Regulierungs-Updates",
    href: "/regulatory-updates",
    icon: FileText,
    description: "Aktuelle Änderungen"
  },
  {
    name: "Newsletter-Manager",
    href: "/newsletter-manager",
    icon: Mail,
    description: "Newsletter-Verwaltung"
  },
  {
    name: "Historische Daten",
    href: "/historical-data",
    icon: Archive,
    description: "Archivierte Dokumente"
  },
  {
    name: "Rechtsfälle",
    href: "/legal-cases",
    icon: Scale,
    description: "Jurisprudenz-Datenbank"
  },
  {
    name: "Knowledge Base",
    href: "/knowledge-base",
    icon: Book,
    description: "Wissensdatenbank"
  },
  {
    name: "Benutzerverwaltung",
    href: "/user-management",
    icon: Users,
    description: "Nutzer & Berechtigungen"
  },
  {
    name: "Systemeinstellungen",
    href: "/system-settings",
    icon: Settings,
    description: "Konfiguration"
  }
];

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [location] = useLocation();

  const renderNavItem = (item: any, isActive: boolean, onClose?: () => void) => (
    <Link key={item.name} href={item.href}>
      <div
        className={cn(
          "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer",
          isActive
            ? "text-blue-600 bg-blue-50 border border-blue-200"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        )}
        onClick={onClose}
      >
        <item.icon className={cn(
          "mr-3 h-5 w-5",
          isActive ? "text-blue-600" : "text-gray-400"
        )} />
        {item.name}
      </div>
    </Link>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex flex-col items-center cursor-pointer">
            <Activity className="h-10 w-10 text-blue-600" />
            <span className="text-xs font-medium text-gray-700 mt-1">Helix</span>
          </div>
        </Link>
        
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            align="end" 
            className="w-80 max-h-[80vh] overflow-y-auto"
            sideOffset={8}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col items-center">
                <Activity className="h-12 w-12 text-blue-600 mb-2" />
                <div className="text-sm font-medium text-gray-700">MedTech Intelligence</div>
              </div>
            </div>

            {/* Main Navigation */}
            <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Hauptmodule
            </DropdownMenuLabel>
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <DropdownMenuItem 
                    className={cn(
                      "flex items-center px-4 py-3 cursor-pointer",
                      isActive && "bg-blue-50 text-blue-600"
                    )}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <item.icon className={cn(
                      "mr-3 h-4 w-4",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )} />
                    {item.name}
                  </DropdownMenuItem>
                </Link>
              );
            })}

            <DropdownMenuSeparator />
            
            <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Weitere Optionen
            </DropdownMenuLabel>

            {/* Footer */}
            <DropdownMenuSeparator />
            <div className="p-3 text-center">
              <div className="text-xs text-gray-500">
                <div className="font-medium">Helix Platform v2.0</div>
                <div className="mt-1">© 2025 MedTech Intelligence</div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}