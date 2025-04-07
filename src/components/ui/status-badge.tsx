import React from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  AlertTriangle
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
  size = 'md'
}) => {
  const getStatusInfo = () => {
    const statusLower = status.toLowerCase();
    
    // Pending statuses
    if (
      statusLower === 'pending' ||
      statusLower === 'awaiting' ||
      statusLower === 'processing' ||
      statusLower === 'reviewing'
    ) {
      return {
        baseClass: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: <Clock className={size === 'sm' ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-1.5'} />,
        displayText: statusLower === 'reviewing' ? 'Reviewing' : 'Pending'
      };
    }
    
    // Approved/success statuses
    if (
      statusLower === 'approved' ||
      statusLower === 'verified' ||
      statusLower === 'active' ||
      statusLower === 'completed' ||
      statusLower === 'success'
    ) {
      return {
        baseClass: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className={size === 'sm' ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-1.5'} />,
        displayText: statusLower === 'verified' ? 'Verified' : 
                    statusLower === 'active' ? 'Active' :
                    statusLower === 'completed' ? 'Completed' : 'Approved'
      };
    }
    
    // Rejected/error statuses
    if (
      statusLower === 'rejected' ||
      statusLower === 'declined' ||
      statusLower === 'denied' ||
      statusLower === 'cancelled' ||
      statusLower === 'error' ||
      statusLower === 'failed'
    ) {
      return {
        baseClass: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className={size === 'sm' ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-1.5'} />,
        displayText: statusLower === 'cancelled' ? 'Cancelled' : 'Rejected'
      };
    }
    
    // Warning statuses
    if (
      statusLower === 'warning' ||
      statusLower === 'attention' ||
      statusLower === 'requires_action'
    ) {
      return {
        baseClass: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: <AlertTriangle className={size === 'sm' ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-1.5'} />,
        displayText: 'Attention Required'
      };
    }
    
    // Informational statuses
    if (
      statusLower === 'info' ||
      statusLower === 'information' ||
      statusLower === 'notice'
    ) {
      return {
        baseClass: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <AlertCircle className={size === 'sm' ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-1.5'} />,
        displayText: 'Information'
      };
    }
    
    // Default/unknown status
    return {
      baseClass: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <AlertCircle className={size === 'sm' ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-1.5'} />,
      displayText: status.charAt(0).toUpperCase() + status.slice(1)
    };
  };
  
  const { baseClass, icon, displayText } = getStatusInfo();
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 rounded',
    md: 'text-sm px-2 py-1 rounded-md',
    lg: 'text-base px-3 py-1.5 rounded-lg'
  };
  
  return (
    <span 
      className={cn(
        'inline-flex items-center font-medium border', 
        baseClass, 
        sizeClasses[size],
        className
      )}
    >
      {showIcon && icon}
      {displayText}
    </span>
  );
};

export { StatusBadge }; 