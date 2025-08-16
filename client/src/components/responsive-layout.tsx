import { ReactNode, Suspense } from "react";
import { useDevice, getDeviceClasses } from "@/hooks/use-device";
import { AdminSidebarNew } from "@/components/layout/sidebar-new";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SidebarSkeleton } from "@/components/ui/skeleton";
import { useRenderPerformance } from "@/hooks/use-performance";

interface ResponsiveLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function ResponsiveLayout({ children, showSidebar = true }: ResponsiveLayoutProps) {
  const device = useDevice();
  useRenderPerformance('ResponsiveLayout');

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200",
      getDeviceClasses(device)
    )}>
      {showSidebar && (
        <>
          {/* Desktop Sidebar - only show on screens larger than 1024px */}
          <div className="hidden lg:block">
            <Suspense fallback={<SidebarSkeleton />}>
              <AdminSidebarNew />
            </Suspense>
          </div>
          
          {/* Mobile/Tablet Sidebar - show on screens smaller than 1024px */}
          <div className="lg:hidden">
            <Suspense fallback={<div className="h-16 bg-background border-b animate-pulse" />}>
              <MobileSidebar />
            </Suspense>
          </div>
        </>
      )}
      
      {/* Language Selector - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      
      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 animate-fade-in-up",
        showSidebar && "lg:ml-64", // Only apply left margin on large screens
        "px-4 py-2 md:px-6 md:py-4 lg:px-8 lg:py-6", // Responsive padding
        "min-h-screen overflow-hidden" // Performance: Enable GPU acceleration
      )}>
        <div className="contain-layout">
          {children}
        </div>
      </main>
    </div>
  );
}

// Device-spezifische Container Komponenten
export function MobileContainer({ children, className }: { children: ReactNode; className?: string }) {
  const device = useDevice();
  
  if (!device.isMobile) return <>{children}</>;
  
  return (
    <div className={cn("mobile-container", className)}>
      {children}
    </div>
  );
}

export function TabletContainer({ children, className }: { children: ReactNode; className?: string }) {
  const device = useDevice();
  
  if (!device.isTablet) return <>{children}</>;
  
  return (
    <div className={cn("tablet-container", className)}>
      {children}
    </div>
  );
}

export function DesktopContainer({ children, className }: { children: ReactNode; className?: string }) {
  const device = useDevice();
  
  if (!device.isDesktop) return <>{children}</>;
  
  return (
    <div className={cn("desktop-container", className)}>
      {children}
    </div>
  );
}

// Responsive Grid System
export function ResponsiveGrid({ children, className }: { children: ReactNode; className?: string }) {
  const device = useDevice();
  
  const gridClasses = cn(
    "grid gap-4",
    device.isMobile && "grid-cols-1",
    device.isTablet && "grid-cols-2",
    device.isDesktop && "grid-cols-3 lg:grid-cols-4",
    className
  );
  
  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}