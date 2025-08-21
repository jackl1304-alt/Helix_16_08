
import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Activity,
  BarChart3, 
  Database, 
  Globe,
  FileText, 
  Mail, 
  CheckCircle, 
  Users, 
  Settings,
  BookOpen,
  Brain,
  Bot,
  Scale,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar-provider";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Data Collection", href: "/data-collection", icon: Database },
  { name: "Global Sources", href: "/global-sources", icon: Globe },
];

const NavigationItem = ({ name, href, icon: Icon }) => {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center p-2 text-base font-medium text-gray-900 rounded-lg",
        isActive ? "bg-blue-500 text-white" : "hover:bg-gray-100"
      )}
    >
      <Icon className="w-5 h-5 mr-3" />
      {name}
    </Link>
  );
};

const Sidebar = () => {
  const { toggleSidebar } = useSidebar();
  
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto bg-white dark:bg-gray-800 border-r shadow-lg">
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center">
          <Activity className="w-8 h-8 text-blue-600" />
          <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Helix</span>
        </div>
        <button onClick={toggleSidebar}>
          Toggle
        </button>
      </div>
      <nav className="px-2 py-4 space-y-1">
        {navigation.map((item) => (
          <NavigationItem key={item.name} {...item} />
        ))}
      </nav>
      <div className="flex-1 p-4 text-xs text-center text-gray-500 border-t dark:border-gray-700">
        <div>Helix Platform</div>
        <div className="mt-1">Version 2.0</div>
        <div className="mt-1">© 2025 MedTech Intelligence</div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SidebarProvider>
      <Sidebar />
    </SidebarProvider>
  );
}
