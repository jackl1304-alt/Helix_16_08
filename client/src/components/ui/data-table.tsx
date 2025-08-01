import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, LucideIcon } from "lucide-react";

interface DataTableColumn<T = any> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T = any> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  data: T[];
  columns: DataTableColumn<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  headerActions?: ReactNode;
  rowActions?: (item: T) => ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
  stats?: {
    total: number;
    filtered: number;
  };
}

export function DataTable<T = any>({
  title,
  description,
  icon: Icon,
  data,
  columns,
  isLoading = false,
  emptyMessage = "Keine Daten gefunden",
  emptyDescription = "Versuchen Sie andere Filterkriterien",
  headerActions,
  rowActions,
  onRowClick,
  className = "",
  stats
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <Card className={`border-0 bg-white/80 shadow-sm backdrop-blur-sm dark:bg-slate-800/80 ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {Icon && (
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg font-semibold">
                  {title}
                </CardTitle>
                {description && (
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            {headerActions}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-0 bg-white/80 shadow-sm backdrop-blur-sm dark:bg-slate-800/80 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-semibold">
                {title} ({data.length})
              </CardTitle>
              {description && (
                <CardDescription className="mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {stats && (
              <Badge variant="outline" className="text-sm">
                {stats.filtered} von {stats.total}
              </Badge>
            )}
            {headerActions}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-slate-500 dark:text-slate-400">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-medium">{emptyMessage}</p>
              <p className="text-sm">{emptyDescription}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 max-w-full">
            <div className="min-w-full">
              <Table className="min-w-[900px]">
                <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  {columns.map((column) => (
                    <TableHead 
                      key={column.key} 
                      className={`font-semibold text-slate-700 dark:text-slate-300 ${column.className || ""}`}
                    >
                      {column.header}
                    </TableHead>
                  ))}
                  {rowActions && <TableHead className="w-32">Aktionen</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow 
                    key={index}
                    className={`
                      hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors
                      ${onRowClick ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column) => (
                      <TableCell 
                        key={column.key} 
                        className={column.className || ""}
                      >
                        {column.render 
                          ? column.render(item) 
                          : (item as any)[column.key]
                        }
                      </TableCell>
                    ))}
                    {rowActions && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center space-x-1">
                          {rowActions(item)}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}