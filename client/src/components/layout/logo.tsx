import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  showSubtext?: boolean;
  className?: string;
  linkTo?: string;
}

export function Logo({ 
  size = "medium", 
  showText = false, 
  showSubtext = false, 
  className,
  linkTo = "/" 
}: LogoProps) {
  const sizeClasses = {
    small: "h-10 w-10",
    medium: "h-14 w-14", 
    large: "h-18 w-18"
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-xl"
  };

  const content = (
    <div className={cn("flex items-center", className)}>
      <div 
        className={cn(
          sizeClasses[size],
          "bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center text-white font-bold text-xl"
        )}
      >
        H
      </div>
      {showText && (
        <div>
          <h1 className={cn(
            "font-bold text-gray-900 dark:text-gray-100",
            textSizeClasses[size]
          )}>
            Helix
          </h1>
          {showSubtext && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              MedTech Intelligence
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link href={linkTo}>
        <div className="cursor-pointer hover:opacity-80 transition-opacity">
          {content}
        </div>
      </Link>
    );
  }

  return content;
}

// Preset logo components for common use cases
export function HeaderLogo() {
  return (
    <Logo 
      size="medium" 
      showText={false} 
      showSubtext={false}
      className="hover:opacity-80 transition-opacity"
    />
  );
}

export function SidebarLogo() {
  return (
    <Logo 
      size="medium" 
      showText={false} 
      showSubtext={false}
      className="p-2"
    />
  );
}

export function CompactLogo() {
  return (
    <Logo 
      size="small" 
      showText={false} 
      showSubtext={false}
    />
  );
}

export function FullLogo() {
  return (
    <Logo 
      size="large" 
      showText={false} 
      showSubtext={false}
      className="text-center"
    />
  );
}