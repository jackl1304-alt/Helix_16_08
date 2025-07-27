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
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  { name: "Rechtsfälle", href: "/legal-cases", icon: FileText },
];

const administration = [
  { name: "User Management", href: "/user-management", icon: Users },
  { name: "System Settings", href: "/system-settings", icon: Settings },
  { name: "Audit Logs", href: "/audit-logs", icon: FileText },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-sm border-r border-gray-200 z-50">
      {/* Logo Header */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Helix</h1>
              <p className="text-xs text-gray-500">MedTech Intelligence</p>
            </div>
          </div>
        </Link>
      </div>
      
      <nav className="mt-4">
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
          </div>
        </div>
      </nav>
    </aside>
  );
}
