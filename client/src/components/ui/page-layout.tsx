import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface PageLayoutProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  children: ReactNode;
  headerActions?: ReactNode;
  stats?: Array<{
    label: string;
    value: string | number;
    variant?: "default" | "secondary" | "destructive" | "outline";
  }>;
}

export function PageLayout({
  title,
  description,
  icon: Icon,
  children,
  headerActions,
  stats
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="space-y-6 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              {Icon && (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 lg:text-3xl">
                  {title}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 lg:text-base">
                  {description}
                </p>
              </div>
            </div>
          </div>
          
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-slate-800/80 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString('de-DE') : stat.value}
                      </span>
                      <div className={`ml-2 h-2 w-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 
                        index === 1 ? 'bg-green-500' : 
                        index === 2 ? 'bg-red-500' : 
                        'bg-yellow-500'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  headerActions?: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  headerActions,
  className = ""
}: SectionCardProps) {
  return (
    <Card className={`border-0 bg-white/80 shadow-sm backdrop-blur-sm dark:bg-slate-800/80 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
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