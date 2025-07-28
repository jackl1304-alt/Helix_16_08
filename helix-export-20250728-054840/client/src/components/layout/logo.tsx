import { Link } from "wouter";
import logoPath from "@assets/tmp_4b23ca96-d4e9-4839-9375-75a53368ad60_1753652563564.jpeg";
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
  showText = true, 
  showSubtext = false, 
  className,
  linkTo = "/" 
}: LogoProps) {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-8 w-8", 
    large: "h-12 w-12"
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-xl"
  };

  const content = (
    <div className={cn("flex items-center", className)}>
      <img 
        src={logoPath} 
        alt="Helix Logo" 
        className={cn(
          sizeClasses[size],
          "rounded-lg object-cover",
          showText && "mr-3"
        )}
      />
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
      showText={true} 
      showSubtext={false}
      className="hover:opacity-80 transition-opacity"
    />
  );
}

export function SidebarLogo() {
  return (
    <Logo 
      size="medium" 
      showText={true} 
      showSubtext={true}
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
      showText={true} 
      showSubtext={true}
      className="text-center"
    />
  );
}