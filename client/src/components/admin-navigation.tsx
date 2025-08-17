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
      title: "Hauptmodule",
      defaultOpen: true,
      items: [
        { name: "Dashboard", href: "/", icon: Home, description: "Übersicht & Analytics" },
        { name: "Regulatory Updates", href: "/regulatory-updates", icon: FileText, badge: "2,847", description: "Aktuelle Vorschriften" },
        { name: "Advanced Analytics", href: "/advanced-analytics", icon: TrendingUp, description: "Detaillierte Analysen" },
        { name: "Intelligent Search", href: "/intelligent-search", icon: Search, description: "KI-gestützte Suche" }
      ]
    },
    {
      title: "Datenmanagement",
      defaultOpen: true,
      items: [
        { name: "Data Collection", href: "/data-collection", icon: Database, description: "Datensammlung & -quellen" },
        { name: "Global Sources", href: "/global-sources", icon: Globe, badge: "70", description: "Weltweite Datenquellen" },
        { name: "Historical Data", href: "/historical-data", icon: Archive, description: "Historische Daten" },
        { name: "Sync Manager", href: "/sync-manager", icon: RefreshCw, description: "Synchronisation" }
      ]
    },
    {
      title: "KI & Analyse",
      items: [
        { name: "AI Insights", href: "/ai-insights", icon: Brain, badge: "24", description: "KI-gestützte Erkenntnisse" },
        { name: "AI Analysis", href: "/ai-analysis-combined", icon: Sparkles, description: "Umfassende KI-Analyse" },
        { name: "Knowledge Base", href: "/knowledge-base", icon: Book, badge: "89", description: "Wissensdatenbank" }
      ]
    },
    {
      title: "Rechtsprechung & Compliance",
      items: [
        { name: "Rechtsfälle", href: "/customer-legal-cases", icon: Gavel, badge: "65", description: "Aktuelle Rechtsprechung" },
        { name: "Rechtsprechung Kompakt", href: "/rechtsprechung-kompakt", icon: Scale, description: "Kompakte Übersicht" },
        { name: "Laufende Zulassungen", href: "/laufende-zulassungen", icon: ClipboardCheck, description: "Aktuelle Zulassungsverfahren" }
      ]
    },
    {
      title: "Workflow & Kommunikation",
      items: [
        { name: "Approval Workflow", href: "/approval-workflow", icon: CheckCircle, description: "Genehmigungsprozess" },
        { name: "Newsletter Manager", href: "/newsletter-manager", icon: Mail, description: "Newsletter-Verwaltung" },
        { name: "Email Management", href: "/email-management", icon: Newspaper, description: "E-Mail-Verwaltung" },
        { name: "Chat Support", href: "/chat-support", icon: MessageSquare, description: "Chat & Support" }
      ]
    },
    {
      title: "Integration & Tools",
      items: [
        { name: "GRIP Integration", href: "/grip-integration", icon: Shield, description: "GRIP-Plattform-Integration" },
        { name: "Terminology Glossary", href: "/terminology-glossary", icon: BookOpen, description: "Fachbegriffe" },
        { name: "Document Viewer", href: "/document-viewer", icon: FileSearch, description: "Dokumentenbetrachter" }
      ]
    },
    {
      title: "Administration",
      items: [
        { name: "User Management", href: "/user-management", icon: Users, description: "Benutzerverwaltung" },
        { name: "Administration", href: "/administration", icon: Building, description: "Systemverwaltung" },
        { name: "System Settings", href: "/system-settings", icon: Settings, description: "Systemkonfiguration" },
        { name: "Audit Logs", href: "/audit-logs", icon: Activity, description: "Systemprotokolle" }
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