import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8'
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <RefreshCw className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      {text && (
        <span className={`${textSizeClasses[size]} text-gray-500 dark:text-gray-400`}>
          {text}
        </span>
      )}
    </div>
  );
};

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ 
  size = 'md' 
}) => {
  return <RefreshCw className={`${sizeClasses[size]} animate-spin text-blue-500`} />;
};