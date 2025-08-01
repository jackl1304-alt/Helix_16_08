import * as React from "react";
import { cn } from "@/lib/utils";

// Optimized Card Component with minimal re-renders
const OptimizedCard = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm will-change-transform",
      className
    )}
    {...props}
  />
)));
OptimizedCard.displayName = "OptimizedCard";

const OptimizedCardHeader = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4", className)}
    {...props}
  />
)));
OptimizedCardHeader.displayName = "OptimizedCardHeader";

const OptimizedCardTitle = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
)));
OptimizedCardTitle.displayName = "OptimizedCardTitle";

const OptimizedCardDescription = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground line-clamp-2", className)}
    {...props}
  />
)));
OptimizedCardDescription.displayName = "OptimizedCardDescription";

const OptimizedCardContent = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
)));
OptimizedCardContent.displayName = "OptimizedCardContent";

const OptimizedCardFooter = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0", className)}
    {...props}
  />
)));
OptimizedCardFooter.displayName = "OptimizedCardFooter";

export {
  OptimizedCard as Card,
  OptimizedCardHeader as CardHeader,
  OptimizedCardTitle as CardTitle,
  OptimizedCardDescription as CardDescription,
  OptimizedCardContent as CardContent,
  OptimizedCardFooter as CardFooter,
};