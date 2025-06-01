// src/components/SyncStatusIndicator.tsx
import React from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle, WifiOff } from 'lucide-react';

interface SyncStatusIndicatorProps {
  status: 'idle' | 'syncing' | 'error';
  error?: string | null;
  useCloud?: boolean;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ 
  status, 
  error,
  useCloud = false
}) => {
  const getStatusIcon = () => {
    if (!useCloud) {
      return <WifiOff className="h-4 w-4 text-gray-500" />;
    }

    switch (status) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return navigator.onLine ? 
          <Cloud className="h-4 w-4 text-green-500" /> : 
          <CloudOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!useCloud) {
      return 'ローカル';
    }

    switch (status) {
      case 'syncing':
        return '同期中...';
      case 'error':
        return error || '同期エラー';
      default:
        return navigator.onLine ? '同期済み' : 'オフライン';
    }
  };

  const getStatusColor = () => {
    if (!useCloud) {
      return 'text-gray-600';
    }

    switch (status) {
      case 'syncing':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return navigator.onLine ? 'text-green-600' : 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      {getStatusIcon()}
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
      {useCloud && (
        <span className="text-xs text-gray-500">
          (クラウド)
        </span>
      )}
    </div>
  );
};