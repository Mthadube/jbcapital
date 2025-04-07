import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  variant = 'primary',
  text
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4'
  };
  
  const variantClasses = {
    primary: 'border-t-blue-600 border-r-blue-300 border-b-blue-100 border-l-blue-300',
    secondary: 'border-t-purple-600 border-r-purple-300 border-b-purple-100 border-l-purple-300',
    success: 'border-t-green-600 border-r-green-300 border-b-green-100 border-l-green-300',
    danger: 'border-t-red-600 border-r-red-300 border-b-red-100 border-l-red-300',
    warning: 'border-t-amber-600 border-r-amber-300 border-b-amber-100 border-l-amber-300'
  };
  
  const textSizeClasses = {
    sm: 'text-xs mt-2',
    md: 'text-sm mt-3',
    lg: 'text-base mt-3',
    xl: 'text-lg mt-4'
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={cn(
          'rounded-full border animate-spin',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      />
      {text && (
        <p className={cn('text-muted-foreground font-medium', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
};

export { LoadingSpinner }; 