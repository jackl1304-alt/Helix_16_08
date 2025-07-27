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
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import logoPath from "@assets/tmp_4b23ca96-d4e9-4839-9375-75a53368ad60_1753652563564.jpeg";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Data Collection", href: "/data-collection", icon: Database },
  { name: "Global Sources", href: "/global-sources", icon: Globe },
  { name: "Regulatory Updates", href: "/regulatory-updates", icon: FileText },
  { name: "Newsletter Manager", href: "/newsletter-manager", icon: Newspaper },
  { name: "Approval Workflow", href: "/approval-workflow", icon: CheckCircle },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
];

const knowledgeBase = [
  { name: "AI Insights", href: "/ai-insights", icon: Brain },
  { name: "Custom Knowledge", href: "/knowledge-base", icon: Book },
  { name: "Historische Daten", href: "/historical-data", icon: Archive },
  { name: "Rechtsfälle", href: "/legal-cases", icon: Scale },
];

const administration = [
  { name: "User Management", href: "/user-management", icon: Users },
  { name: "System Settings", href: "/system-settings", icon: Settings },
  { name: "Audit Logs", href: "/audit-logs", icon: FileText },
];

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
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
          <div className="flex items-center cursor-pointer">
            <img 
              src={logoPath} 
              alt="Helix Logo" 
              className="h-8 w-8 rounded object-cover mr-2"
            />
            <h1 className="text-lg font-bold text-gray-900">Helix</h1>
          </div>
        </Link>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md p-0 h-full max-h-screen mobile-sidebar-dialog">
            <div className="dialog-content flex flex-col h-full relative">
              {/* Header */}
              <DialogHeader className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <img 
                    src={logoPath} 
                    alt="Helix Logo" 
                    className="h-12 w-12 rounded-lg object-cover mr-3"
                  />
                  <div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                      Helix
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                      MedTech Regulatory Intelligence
                    </p>
                  </div>
                </div>
              </DialogHeader>

              {/* Navigation */}
              <div className="dialog-navigation flex-1 p-4 pb-20">
                {/* Main Navigation */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                    Hauptmodule
                  </h3>
                  {navigation.map((item) => {
                    const isActive = location === item.href;
                    return renderNavItem(item, isActive, () => setIsOpen(false));
                  })}
                </div>

                {/* Knowledge Base */}
                <div className="mt-6 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                    Knowledge Base
                  </h3>
                  {knowledgeBase.map((item) => {
                    const isActive = location === item.href;
                    return renderNavItem(item, isActive, () => setIsOpen(false));
                  })}
                </div>

                {/* Administration */}
                <div className="mt-6 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                    Administration
                  </h3>
                  {administration.map((item) => {
                    const isActive = location === item.href;
                    return renderNavItem(item, isActive, () => setIsOpen(false));
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
                <div className="text-xs text-gray-500 text-center">
                  <div className="font-medium">Helix Platform</div>
                  <div className="mt-1">Version 2.0</div>
                  <div className="mt-1">© 2025 MedTech Intelligence</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}