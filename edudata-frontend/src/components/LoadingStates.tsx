import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Wifi, RefreshCw } from 'lucide-react';

// Full page loading spinner
export const PageLoader: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
      <p className="text-lg font-medium text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground">Please wait a moment</p>
    </div>
  </div>
);

// Inline loading spinner
export const InlineLoader: React.FC<{ size?: 'sm' | 'md' | 'lg'; message?: string }> = ({ 
  size = 'md', 
  message 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center py-4">
      <div className="text-center space-y-2">
        <div className={`animate-spin rounded-full border-b-2 border-primary mx-auto ${sizeClasses[size]}`}></div>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
};

// Card skeleton loader
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-[80px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
        </div>
      </Card>
    ))}
  </>
);

// Table skeleton loader
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-4">
    {/* Header skeleton */}
    <div className="flex space-x-4 pb-2 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`header-${i}`} className="h-4 flex-1" />
      ))}
    </div>
    {/* Row skeletons */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 py-2">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`row-${rowIndex}-col-${colIndex}`} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// Chart skeleton loader
export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = "h-64" }) => (
  <Card className="p-6">
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-[120px]" />
      </div>
      <div className={`${height} w-full`}>
        <div className="h-full w-full bg-muted animate-pulse rounded"></div>
      </div>
    </div>
  </Card>
);

// Error states
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  icon?: 'error' | 'network' | 'generic';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An error occurred while loading the data. Please try again.",
  onRetry,
  showRetry = true,
  icon = 'generic'
}) => {
  const icons = {
    error: <AlertCircle className="h-12 w-12 text-destructive" />,
    network: <Wifi className="h-12 w-12 text-destructive" />,
    generic: <AlertCircle className="h-12 w-12 text-muted-foreground" />
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">
        {icons[icon]}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};

// Network error state
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    title="Connection Problem"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
    icon="network"
  />
);

// Empty state component
interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data available",
  message = "There's nothing to show here yet.",
  action,
  icon
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && <div className="mb-4">{icon}</div>}
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
    {action && (
      <Button onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </div>
);