// SkeletonLoader.tsx - スケルトンローディングコンポーネント
import React from 'react';

interface SkeletonProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  height, 
  width, 
  variant = 'rectangular' 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded',
    circular: 'rounded-full'
  };

  const style: React.CSSProperties = {};
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// ComponentCardSkeleton.tsx - コンポーネントカード用スケルトン
export const ComponentCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
    <div className="space-y-4">
      {/* ヘッダー部分 */}
      <div className="flex items-center justify-between">
        <Skeleton width="60%" height="20px" />
        <Skeleton width="60px" height="24px" variant="rectangular" />
      </div>

      {/* タグ部分 */}
      <div className="flex space-x-2">
        <Skeleton width="50px" height="20px" />
        <Skeleton width="40px" height="20px" />
        <Skeleton width="60px" height="20px" />
      </div>

      {/* プレビュー部分 */}
      <Skeleton height="120px" className="rounded-md" />

      {/* メタ情報 */}
      <div className="space-y-2">
        <Skeleton width="40%" height="16px" />
        <Skeleton width="30%" height="16px" />
      </div>

      {/* ボタン部分 */}
      <div className="flex justify-between pt-4">
        <div className="flex space-x-2">
          <Skeleton width="60px" height="32px" />
          <Skeleton width="60px" height="32px" />
          <Skeleton width="60px" height="32px" />
        </div>
        <div className="flex space-x-2">
          <Skeleton width="32px" height="32px" />
          <Skeleton width="32px" height="32px" />
        </div>
      </div>
    </div>
  </div>
);

// ComponentListSkeleton.tsx - コンポーネントリスト用スケルトン
interface ComponentListSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list';
}

export const ComponentListSkeleton: React.FC<ComponentListSkeletonProps> = ({ 
  count = 6, 
  viewMode = 'grid' 
}) => {
  const gridClasses = viewMode === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-4';

  return (
    <div className={gridClasses}>
      {Array.from({ length: count }, (_, index) => (
        viewMode === 'grid' ? (
          <ComponentCardSkeleton key={index} />
        ) : (
          <ComponentListItemSkeleton key={index} />
        )
      ))}
    </div>
  );
};

// ComponentListItemSkeleton.tsx - リスト表示用スケルトン
export const ComponentListItemSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4 flex-1">
        <Skeleton width="60px" height="60px" />
        <div className="space-y-2 flex-1">
          <Skeleton width="40%" height="18px" />
          <Skeleton width="60%" height="14px" />
          <div className="flex space-x-2">
            <Skeleton width="40px" height="16px" />
            <Skeleton width="50px" height="16px" />
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Skeleton width="32px" height="32px" />
        <Skeleton width="32px" height="32px" />
        <Skeleton width="32px" height="32px" />
      </div>
    </div>
  </div>
);

// HeaderSkeleton.tsx - ヘッダー用スケルトン
export const HeaderSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-6">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton width="200px" height="32px" />
          <Skeleton width="120px" height="32px" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton width="100px" height="36px" />
          <Skeleton width="100px" height="36px" />
          <Skeleton width="120px" height="36px" />
        </div>
      </div>
    </div>
  </div>
);

// FormSkeleton.tsx - フォーム用スケルトン
export const FormSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Skeleton width="120px" height="16px" />
        <Skeleton height="40px" />
      </div>
      <div className="space-y-2">
        <Skeleton width="100px" height="16px" />
        <Skeleton height="40px" />
      </div>
    </div>
    
    <div className="space-y-2">
      <Skeleton width="80px" height="16px" />
      <Skeleton height="40px" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {['HTML', 'CSS', 'JavaScript'].map((index) => (
        <div key={index} className="space-y-2">
          <Skeleton width="60px" height="16px" />
          <Skeleton height="200px" />
        </div>
      ))}
    </div>

    <div className="space-y-2">
      <Skeleton width="80px" height="16px" />
      <Skeleton height="120px" />
    </div>

    <div className="flex justify-end space-x-4">
      <Skeleton width="80px" height="40px" />
      <Skeleton width="80px" height="40px" />
    </div>
  </div>
);

// PulsatingDot.tsx - 同期状態インジケーター用
interface PulsatingDotProps {
  color?: 'green' | 'yellow' | 'red' | 'blue';
  size?: 'sm' | 'md' | 'lg';
}

export const PulsatingDot: React.FC<PulsatingDotProps> = ({ 
  color = 'green', 
  size = 'md' 
}) => {
  const colorClasses = {
    green: 'bg-green-400',
    yellow: 'bg-yellow-400',
    red: 'bg-red-400',
    blue: 'bg-blue-400'
  };

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <span className="relative flex">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorClasses[color]} opacity-75`}></span>
      <span className={`relative inline-flex rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}></span>
    </span>
  );
};

// LoadingSpinner.tsx - カスタムローディングスピナー
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'text-blue-600',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`${sizeClasses[size]} ${color} ${className}`}>
      <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// EmptyState.tsx - 空状態コンポーネント
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  action 
}) => (
  <div className="text-center py-12">
    {icon && (
      <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
    {description && (
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">{description}</p>
    )}
    {action && action}
  </div>
);