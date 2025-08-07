import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
  icon?: ReactNode;
  action?: ReactNode;
}

export function ModernCard({ 
  title, 
  description, 
  children, 
  className, 
  highlighted = false,
  icon,
  action
}: ModernCardProps) {
  return (
    <Card className={cn(
      "card-modern transition-all duration-200",
      highlighted && "card-highlighted",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="text-sm text-gray-600 mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
}