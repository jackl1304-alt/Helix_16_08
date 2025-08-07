import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  blur?: "light" | "medium" | "strong";
}

export function GlassCard({ 
  children, 
  className, 
  blur = "medium" 
}: GlassCardProps) {
  const blurClasses = {
    light: "backdrop-blur-sm bg-white/70",
    medium: "backdrop-blur-md bg-white/80", 
    strong: "backdrop-blur-lg bg-white/90"
  };

  return (
    <div className={cn(
      "rounded-xl border border-white/20 shadow-xl",
      blurClasses[blur],
      className
    )}>
      {children}
    </div>
  );
}