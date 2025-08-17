import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerNavigation, type CustomerPermissions } from "@/components/customer-navigation";
import { useAuth } from "@/hooks/use-auth";

interface CustomerSidebarProps {
  permissions: CustomerPermissions;
}

export function CustomerSidebar({ permissions }: CustomerSidebarProps) {
  const { logout } = useAuth();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-800 px-6">
        <div className="flex items-center">
          {/* HELIX Logo */}
          <div className="relative h-8 w-8 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-lg ring-1 ring-green-200 dark:ring-green-800 shadow-md flex items-center justify-center text-white mr-3">
            <div className="text-sm font-black tracking-tight">H</div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">HELIX</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Customer Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <CustomerNavigation permissions={permissions} />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </Button>
        </div>
      </div>
    </div>
  );
}