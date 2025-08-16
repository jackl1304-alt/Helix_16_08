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

  if (device.isMobile || device.isTablet) {
    // Mobile/Tablet Layout
    return (
      <div className={cn(
        "min-h-screen bg-gray-50 dark:bg-gray-900",
        getDeviceClasses(device)
      )}>
        {showSidebar && <MobileSidebar />}
        
        {/* Language Selector - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSelector />
        </div>
        
        {/* Main Content - Full Width on Mobile */}
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className={cn(
      "min-h-screen bg-gray-50 dark:bg-gray-900",
      getDeviceClasses(device)
    )}>
      {showSidebar && <Sidebar />}
      
      {/* Language Selector - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      
      {/* Main Content - With Sidebar Margin on Desktop */}
      <div className={cn(
        "transition-all duration-300 min-h-screen",
        showSidebar ? "ml-64" : "ml-0"
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