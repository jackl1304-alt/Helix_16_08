import { cn } from "@/lib/utils";

// Logo path as static URL to avoid import issues
const logoPath = "/attached_assets/ICON Helix_1753735921077.jpg";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  showSubtext?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Logo({ 
  size = "medium", 
  showText = false, 
  showSubtext = false, 
  className,
  onClick
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
      <img 
        src={logoPath} 
        alt="Helix Logo" 
        className={cn(
          sizeClasses[size],
          "object-cover rounded-lg"
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

  if (onClick) {
    return (
      <button onClick={onClick} className="cursor-pointer hover:opacity-80 transition-opacity">
        {content}
      </button>
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