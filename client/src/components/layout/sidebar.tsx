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
  { name: "Administration", href: "/administration", icon: Shield },
  { name: "Phase 1 Integration", href: "/phase1-integration", icon: Settings },
  { name: "Phase 2 Extensions", href: "/phase2-integration", icon: Network },
  { name: "Phase 3 Advanced", href: "/phase3-advanced", icon: Brain },
  { name: "Real-Time APIs", href: "/real-time-integration", icon: Zap },
  { name: "User Management", href: "/user-management", icon: Users },
  { name: "Data Sources Admin", href: "/administration/data-sources", icon: Database },
  { name: "System Settings", href: "/system-settings", icon: Settings },
  { name: "Audit Logs", href: "/audit-logs", icon: FileText },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 deltaways-nav shadow-lg z-50 overflow-y-auto">
      {/* DELTA WAYS Logo Header */}
      <div className="p-6 border-b border-[#07233e]/30">
        <Link href="/">
          <div className="flex flex-col items-center cursor-pointer space-y-2">
            <img 
              src={logoPath} 
              alt="Helix Logo" 
              className="h-16 w-16 object-cover rounded-lg ring-2 ring-[#b0d4f6]"
            />
            <span className="text-lg deltaways-brand-text text-[#07233e]">HELIX</span>
            <p className="text-xs font-medium text-gray-300">Powered by DELTA WAYS</p>
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
                    "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer",
                    isActive
                      ? "bg-[#0b3761] text-white border border-[#0b3761] shadow-sm"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-[#07233e]"
                  )} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 px-4">
          <h3 className="text-xs font-semibold text-[#07233e]/80 uppercase tracking-wider deltaways-brand-text">
            Knowledge Base
          </h3>
          <div className="mt-4 space-y-2">
            {knowledgeBase.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer",
                      isActive
                        ? "bg-[#0b3761] text-white border border-[#0b3761] shadow-sm"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <item.icon className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-[#07233e]"
                    )} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 px-4">
          <h3 className="text-xs font-semibold text-[#07233e]/80 uppercase tracking-wider deltaways-brand-text">
            Administration & Entwicklung
          </h3>
          <div className="mt-4 space-y-2">
            {administration.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer",
                      isActive
                        ? "bg-[#0b3761] text-white border border-[#0b3761] shadow-sm"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <item.icon className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-[#07233e]"
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
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer mt-2",
                  location === "/ai-approval-demo"
                    ? "bg-[#0b3761] text-white border border-[#0b3761] shadow-sm"
                    : "text-gray-400 hover:text-[#07233e] hover:bg-white/10 opacity-60 hover:opacity-100"
                )}
                title="Advanced System"
              >
                <Bot className={cn(
                  "mr-3 h-5 w-5",
                  location === "/ai-approval-demo" ? "text-white" : "text-gray-400 hover:text-[#07233e]"
                )} />
              </div>
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}
