import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminNavigation } from "@/components/admin-navigation";
import { useAuth } from "@/hooks/use-auth";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="fixed top-4 left-4 z-50 md:hidden"
          size="icon"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Menu öffnen</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-800 px-6">
            <div className="flex items-center">
              {/* HELIX Logo */}
              <div className="relative h-8 w-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-lg ring-1 ring-blue-200 dark:ring-blue-800 shadow-md flex items-center justify-center text-white mr-3">
                <div className="text-sm font-black tracking-tight">H</div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">HELIX</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <AdminNavigation />
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
      </SheetContent>
    </Sheet>
  );
}