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
  Bot,
  Network,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoPath from "@assets/ICON Helix_1753735921077.jpg";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Data Collection", href: "/data-collection", icon: Database },
  { name: "Sync Manager", href: "/sync-manager", icon: RefreshCw },
  { name: "Phase 1 Integration", href: "/phase1-integration", icon: Shield },
  { name: "Phase 2 Extensions", href: "/phase2-integration", icon: Network },
  { name: "Phase 3 Advanced", href: "/phase3-advanced", icon: Brain },
  { name: "Real-Time APIs", href: "/real-time-integration", icon: Zap },
  { name: "Global Sources", href: "/global-sources", icon: Globe },
  { name: "Regulatory Updates", href: "/regulatory-updates", icon: FileText },
  { name: "Newsletter Manager", href: "/newsletter-manager", icon: Newspaper },
  { name: "Approval Workflow", href: "/approval-workflow", icon: CheckCircle },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
];

const knowledgeBase = [
  { name: "Intelligente Suche", href: "/intelligent-search", icon: Search },
  { name: "AI Insights", href: "/ai-insights", icon: Brain },
  { name: "Custom Knowledge", href: "/knowledge-base", icon: Book },
  { name: "Historische Daten", href: "/historical-data", icon: Archive },
  { name: "Rechtsfälle", href: "/legal-cases", icon: FileText },
  { name: "Enhanced Legal Cases", href: "/enhanced-legal-cases", icon: Shield },
];

const administration = [
  { name: "User Management", href: "/user-management", icon: Users },
  { name: "Data Sources Admin", href: "/administration/data-sources", icon: Database },
  { name: "System Settings", href: "/system-settings", icon: Settings },
  { name: "Audit Logs", href: "/audit-logs", icon: FileText },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-sm border-r border-gray-200 z-50 overflow-y-auto">
      {/* Logo Header */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/">
          <div className="flex flex-col items-center cursor-pointer space-y-2">
            <img 
              src={logoPath} 
              alt="Helix Logo" 
              className="h-16 w-16 object-cover rounded-lg"
            />
            <p className="text-sm font-medium text-gray-700">MedTech Intelligence</p>
          </div>
        </Link>
      </div>
      
      <nav className="mt-4 pb-8 flex-1 overflow-y-auto">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "text-primary bg-primary/10 border border-primary/20"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5",
                    isActive ? "text-primary" : "text-gray-400"
                  )} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 px-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Knowledge Base
          </h3>
          <div className="mt-4 space-y-2">
            {knowledgeBase.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                      isActive
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <item.icon className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-primary" : "text-gray-400"
                    )} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 px-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Administration
          </h3>
          <div className="mt-4 space-y-2">
            {administration.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                      isActive
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <item.icon className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-primary" : "text-gray-400"
                    )} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
            
            {/* Verstecktes KI-Icon - nur für Wissende */}
            <Link href="/ai-approval-demo">
              <div
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer mt-2",
                  location === "/ai-approval-demo"
                    ? "text-primary bg-primary/10 border border-primary/20"
                    : "text-gray-400 hover:text-blue-600 hover:bg-blue-50 opacity-60 hover:opacity-100"
                )}
                title="Advanced System"
              >
                <Bot className={cn(
                  "mr-3 h-5 w-5",
                  location === "/ai-approval-demo" ? "text-primary" : "text-gray-400 hover:text-blue-600"
                )} />
              </div>
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}
