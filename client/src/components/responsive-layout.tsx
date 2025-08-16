import { ReactNode } from "react";
import { useDevice, getDeviceClasses } from "@/hooks/use-device";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/LanguageSelector";

interface ResponsiveLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function ResponsiveLayout({ children, showSidebar = true }: ResponsiveLayoutProps) {
  const device = useDevice();

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 dark:bg-gray-900",
      getDeviceClasses(device)
    )}>
      {showSidebar && (
        <>
          {/* Desktop Sidebar - only show on screens larger than 1024px */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          
          {/* Mobile/Tablet Sidebar - show on screens smaller than 1024px */}
          <div className="lg:hidden">
            <MobileSidebar />
          </div>
        </>
      )}
      
      {/* Language Selector - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      
      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        showSidebar ? "ml-64" : "ml-0", // Sidebar width margin
        "min-h-screen" // Full height
      )}>
        {children}
      </div>
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