import { ReactNode } from "react";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { ProjectNotebook } from "@/components/customer/project-notebook";
import { useCustomer } from "@/contexts/CustomerContext";
import { cn } from "@/lib/utils";

interface CustomerLayoutProps {
  children: ReactNode;
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const { customer, theme } = useCustomer();

  return (
    <div className={cn("min-h-screen", theme.background)}>
      {/* Customer Sidebar */}
      <CustomerSidebar />
      
      {/* Main Content */}
      <div className="ml-64 transition-all duration-300 px-6 py-4">
        {children}
      </div>
      
      {/* Floating Project Notebook - Available on all pages */}
      <ProjectNotebook />
      

    </div>
  );
}