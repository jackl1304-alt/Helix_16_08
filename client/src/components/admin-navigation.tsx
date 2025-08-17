import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Sparkles,
  Building,
  LogOut,
  History,
  BookOpen,
  MessageSquare,
  ClipboardCheck,
  Workflow,
  FileCheck,
  AlertTriangle,
  Gavel,
  PenTool,
  Home,
  Activity
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

export function AdminNavigation() {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['main', 'data']);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle)
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const navigationStructure: NavSection[] = [
    {
      title: "ÜBERSICHT & STEUERUNG",
      defaultOpen: true,
      items: [
        { name: "Dashboard", href: "/", icon: Home },
        { name: "Berichte & Analysen", href: "/analytics", icon: BarChart3 }
      ]
    },
    {
      title: "DATENMANAGEMENT", 
      defaultOpen: true,
      items: [
        { name: "Datensammlung", href: "/data-collection", icon: Database },
        { name: "Newsletter-Verwaltung", href: "/newsletter-manager", icon: Newspaper },
        { name: "Email-Verwaltung", href: "/email-management", icon: Mail },
        { name: "Wissensartikel", href: "/knowledge-base", icon: BookOpen }
      ]
    },
    {
      title: "COMPLIANCE & REGULIERUNG",
      defaultOpen: true,
      items: [
        { name: "Regulatorische Updates", href: "/regulatory-updates", icon: FileText },
        { name: "Rechtsprechung", href: "/legal-intelligence", icon: Scale },
        { name: "Laufende Zulassungen", href: "/laufende-zulassungen", icon: CheckCircle }
      ]
    },
    {
      title: "ZULASSUNGEN & REGISTRIERUNG",
      defaultOpen: false,
      items: [
        { name: "Globale Zulassungen", href: "/global-sources", icon: Globe },
        { name: "Laufende Zulassungen", href: "/laufende-zulassungen", icon: Activity }
      ]
    },
    {
      title: "ERWEITERT",
      defaultOpen: false,
      items: [
        { name: "AI-Datenquellen", href: "/ai-insights", icon: Brain },
        { name: "Globale Quellen", href: "/global-sources", icon: Globe },
        { name: "Administration", href: "/administration", icon: Settings }
      ]
    }
  ];

  return (
    <nav className="space-y-2">
      {navigationStructure.map((section) => {
        const isExpanded = expandedSections.includes(section.title.toLowerCase().replace(' ', '_'));
        
        return (
          <div key={section.title} className="space-y-1">
            <Button
              variant="ghost"
              onClick={() => toggleSection(section.title.toLowerCase().replace(' ', '_'))}
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
            
            {section !== navigationStructure[navigationStructure.length - 1] && (
              <Separator className="my-2" />
            )}
          </div>
        );
      })}
    </nav>
  );
}