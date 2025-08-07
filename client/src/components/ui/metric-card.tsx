import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  color?: "blue" | "green" | "orange" | "red" | "purple";
}

const colorClasses = {
  blue: "from-blue-500 to-blue-600 text-blue-600 bg-blue-50",
  green: "from-green-500 to-green-600 text-green-600 bg-green-50", 
  orange: "from-orange-500 to-orange-600 text-orange-600 bg-orange-50",
  red: "from-red-500 to-red-600 text-red-600 bg-red-50",
  purple: "from-purple-500 to-purple-600 text-purple-600 bg-purple-50"
};

export function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
  color = "blue"
}: MetricCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColorClass = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500";
  
  return (
    <Card className={cn("card-modern h-full", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {typeof value === 'number' ? (
                  <AnimatedCounter value={value} />
                ) : (
                  value
                )}
              </h3>
              {trend && trendValue && (
                <div className={cn("flex items-center gap-1 text-sm", trendColorClass)}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {icon && (
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-br",
              colorClasses[color].split(" ").slice(0, 2).join(" ")
            )}>
              <div className={cn("w-6 h-6", colorClasses[color].split(" ")[2])}>
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}