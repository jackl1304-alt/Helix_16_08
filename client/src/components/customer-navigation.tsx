import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  FileText, 
  TrendingUp,
  Brain,
  Book,
  Scale,
  Newspaper,
  ChevronDown,
  ChevronRight,
  Settings,
  Home,
  Sparkles,
  Database,
  Globe,
  Archive,
  Gavel
} from "lucide-react";

export interface CustomerPermissions {
  dashboard: boolean;
  regulatoryUpdates: boolean;
  legalCases: boolean;
  knowledgeBase: boolean;
  newsletters: boolean;
  analytics: boolean;
  reports: boolean;
  dataCollection: boolean;
  globalSources: boolean;
  historicalData: boolean;
  administration: boolean;
  userManagement: boolean;
  systemSettings: boolean;
  auditLogs: boolean;
  aiInsights: boolean;
  advancedAnalytics: boolean;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  description?: string;
  permission: keyof CustomerPermissions;
}

interface NavSection {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface CustomerNavigationProps {
  permissions: CustomerPermissions;
}

export function CustomerNavigation({ permissions }: CustomerNavigationProps) {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['core', 'analysis']);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle)
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const navigationStructure: NavSection[] = [
    {
      title: "Core Features",
      defaultOpen: true,
      items: [
        { name: "Dashboard", href: "/customer/dashboard", icon: Home, description: "Übersicht", permission: "dashboard" },
        { name: "Regulatory Updates", href: "/customer/regulatory-updates", icon: FileText, badge: "Active", description: "Regulatory Updates", permission: "regulatoryUpdates" },
        { name: "Analytics", href: "/customer/analytics", icon: TrendingUp, description: "Analytics", permission: "analytics" }
      ]
    },
    {
      title: "Analysis & Insights",
      defaultOpen: true,
      items: [
        { name: "AI Insights", href: "/customer/ai-insights", icon: Brain, badge: "New", description: "KI-Erkenntnisse", permission: "aiInsights" },
        { name: "Legal Cases", href: "/customer/legal-cases", icon: Scale, description: "Rechtsprechung", permission: "legalCases" },
        { name: "Knowledge Base", href: "/customer/knowledge-base", icon: Book, description: "Wissensdatenbank", permission: "knowledgeBase" }
      ]
    },
    {
      title: "Data & Sources",
      items: [
        { name: "Data Collection", href: "/customer/data-collection", icon: Database, description: "Datensammlung", permission: "dataCollection" },
        { name: "Global Sources", href: "/customer/global-sources", icon: Globe, description: "Globale Quellen", permission: "globalSources" },
        { name: "Historical Data", href: "/customer/historical-data", icon: Archive, description: "Historische Daten", permission: "historicalData" }
      ]
    },
    {
      title: "Communication",
      items: [
        { name: "Newsletters", href: "/customer/newsletters", icon: Newspaper, description: "Newsletter", permission: "newsletters" }
      ]
    },
    {
      title: "Settings",
      items: [
        { name: "Settings", href: "/customer/settings", icon: Settings, description: "Einstellungen", permission: "administration" }
      ]
    }
  ];

  const filteredNavigationStructure = navigationStructure.map(section => ({
    ...section,
    items: section.items.filter(item => permissions[item.permission])
  })).filter(section => section.items.length > 0);

  return (
    <nav className="space-y-2">
      {filteredNavigationStructure.map((section) => {
        const sectionKey = section.title.toLowerCase().replace(' ', '_');
        const isExpanded = expandedSections.includes(sectionKey);
        
        return (
          <div key={section.title} className="space-y-1">
            <Button
              variant="ghost"
              onClick={() => toggleSection(sectionKey)}
              className="w-full justify-between text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 h-8"
            >
              <span>{section.title}</span>
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
            
            {isExpanded && (
              <div className="space-y-1 pl-2">
                {section.items.map((item) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-sm h-9 px-3",
                          isActive 
                            ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500" 
                            : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        )}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <span className="flex-1 text-left">{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {section !== filteredNavigationStructure[filteredNavigationStructure.length - 1] && (
              <Separator className="my-2" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default CustomerNavigation;