// EnhancedSyncStatusIndicator.tsx - ネットワーク状態を含む改良版
import React from 'react';
import { Cloud, CloudOff } from 'lucide-react';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface SyncStatusIndicatorProps {
  status: 'idle' | 'syncing' | 'error';
  error?: string | null;
  lastSyncTime?: Date;
  className?: string;
}

interface EnhancedSyncStatusIndicatorProps extends SyncStatusIndicatorProps {
  showNetworkStatus?: boolean;
  onRetry?: () => void;
}

export const EnhancedSyncStatusIndicator: React.FC<EnhancedSyncStatusIndicatorProps> = ({
  status,
  error,
  lastSyncTime,
  className = '',
  showNetworkStatus = true,
  onRetry
}) => {
  const { isOnline } = useNetworkStatus();

  // ネットワーク状態を考慮したステータス
  const effectiveStatus = !isOnline ? 'error' : status;
  const effectiveError = !isOnline ? 'ネットワーク接続がありません' : error;

  return (
    <div className={`flex items-center space-x-1 sm:space-x-2 ${className}`}>
      <SyncStatusIndicator
        status={effectiveStatus}
        error={effectiveError}
        lastSyncTime={lastSyncTime}
      />
      
      {/* ネットワーク状態インジケーター - スマホでは非表示 */}
      {showNetworkStatus && (
        <div className="hidden sm:flex items-center space-x-1">
          {isOnline ? (
            <div title="オンライン">
              <Cloud className="h-4 w-4 text-green-500" />
            </div>
          ) : (
            <div title="オフライン">
              <CloudOff className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>
      )}
      
      {/* 再試行ボタン（エラー時のみ表示） - スマホではコンパクト表示 */}
      {(status === 'error' || !isOnline) && onRetry && (
        <button
          onClick={onRetry}
          className="text-xs px-1 sm:px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          title="再試行"
        >
          <span className="hidden sm:inline">再試行</span>
          <span className="sm:hidden">↓</span>
        </button>
      )}
    </div>
  );
};