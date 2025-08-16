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
  Mail,
  Search,
  History,
  RefreshCw,
  Sparkles,
  Gavel,
  Workflow,
  MessageSquare,
  BookOpen,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// Vollständige Navigation - alle verfügbaren Bereiche
const navigationSections = [
  {
    title: "Hauptmodule",
    items: [
      { name: "Dashboard", href: "/", icon: BarChart3 },
      { name: "Regulatory Updates", href: "/regulatory-updates", icon: FileText },
      { name: "Analytics", href: "/analytics", icon: TrendingUp },
      { name: "Intelligent Search", href: "/intelligent-search", icon: Search },
    ]
  },
  {
    title: "Datenmanagement",
    items: [
      { name: "Data Collection", href: "/data-collection", icon: Database },
      { name: "Knowledge Base", href: "/knowledge-base", icon: Book },
      { name: "Global Sources", href: "/global-sources", icon: Globe },
      { name: "Historical Data", href: "/historical-data", icon: History },
      { name: "GRIP Integration", href: "/grip-integration", icon: RefreshCw },
    ]
  },
  {
    title: "KI & Analyse",
    items: [
      { name: "AI Insights", href: "/ai-insights", icon: Brain },
      { name: "AI Analysis", href: "/ai-analysis-combined", icon: Sparkles },
      { name: "Advanced Analytics", href: "/advanced-analytics", icon: TrendingUp },
    ]
  },
  {
    title: "Rechtliche Module",
    items: [
      { name: "Legal Cases", href: "/customer-legal-cases", icon: Gavel },
      { name: "Rechtsprechung", href: "/rechtsprechung-kompakt", icon: Scale },
      { name: "Approval Workflow", href: "/approval-workflow", icon: CheckCircle },
      { name: "Laufende Zulassungen", href: "/laufende-zulassungen", icon: Workflow },
    ]
  },
  {
    title: "Kommunikation",
    items: [
      { name: "Newsletter Management", href: "/newsletter-manager", icon: Mail },
      { name: "Email Management", href: "/email-management", icon: Newspaper },
      { name: "Chat Support", href: "/chat-support", icon: MessageSquare },
    ]
  },
  {
    title: "Administration",
    items: [
      { name: "User Management", href: "/user-management", icon: Users },
      { name: "System Settings", href: "/system-settings", icon: Settings },
      { name: "Audit Logs", href: "/audit-logs", icon: Shield },
    ]
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
            <div className="relative h-10 w-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-lg flex items-center justify-center text-white shadow-md">
              <div className="text-lg font-black">H</div>
            </div>
            <span className="text-xs font-medium text-gray-700 mt-1">MedTech Intelligence</span>
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
                <div className="relative h-12 w-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-lg flex items-center justify-center text-white shadow-lg mb-2">
                  <div className="text-xl font-black">H</div>
                </div>
                <div className="text-sm font-medium text-gray-700">MedTech Intelligence</div>
              </div>
            </div>

            {/* Navigation Items by Section */}
            <div className="max-h-[50vh] overflow-y-auto">
              {navigationSections.map((section) => (
                <div key={section.title}>
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">
                    {section.title}
                  </DropdownMenuLabel>
                  {section.items.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link key={item.name} href={item.href}>
                        <DropdownMenuItem 
                          className={cn(
                            "flex items-center px-4 py-2 cursor-pointer mx-2 rounded-md",
                            isActive && "bg-blue-50 text-blue-600"
                          )}
                          onClick={() => setDropdownOpen(false)}
                        >
                          <item.icon className={cn(
                            "mr-3 h-4 w-4",
                            isActive ? "text-blue-600" : "text-gray-400"
                          )} />
                          <span className="text-sm">{item.name}</span>
                        </DropdownMenuItem>
                      </Link>
                    );
                  })}
                  {section !== navigationSections[navigationSections.length - 1] && (
                    <DropdownMenuSeparator className="my-1" />
                  )}
                </div>
              ))}
            </div>

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