import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, RotateCcw } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder?: string;
  }>;
  actions?: ReactNode;
  onReset?: () => void;
  className?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Suchen...",
  filters = [],
  actions,
  onReset,
  className = ""
}: FilterBarProps) {
  return (
    <Card className={`border-0 bg-white/80 shadow-sm backdrop-blur-sm dark:bg-slate-800/80 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Filter className="h-5 w-5 text-primary" />
          Filter & Suche
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Suche
            </label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-slate-900/50"
              />
            </div>
          </div>

          {/* Dynamic Filters */}
          {filters.map((filter, index) => (
            <div key={index} className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {filter.label}
              </label>
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger className="bg-white/50 dark:bg-slate-900/50">
                  <SelectValue placeholder={filter.placeholder || `Alle ${filter.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Actions */}
          <div className="flex items-end space-x-2">
            {onReset && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="bg-white/50 dark:bg-slate-900/50"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
            {actions}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}