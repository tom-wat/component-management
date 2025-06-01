// SyncStatusIndicator.tsx - シンプル版（アイコンのみ）
import React from 'react';
import { Cloud, CloudLightning, RefreshCw } from 'lucide-react';

interface SyncStatusIndicatorProps {
  status: 'idle' | 'syncing' | 'error';
  error?: string | null;
  lastSyncTime?: Date;
  className?: string;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  status,
  error,
  lastSyncTime,
  className = ''
}) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          color: 'text-blue-600',
          title: '同期中...'
        };
      case 'error':
        return {
          icon: <CloudLightning className="h-4 w-4" />,
          color: 'text-red-600',
          title: 'エラー'
        };
      case 'idle':
      default:
        return {
          icon: <Cloud className="h-4 w-4" />,
          color: 'text-green-600',
          title: '同期済み'
        };
    }
  };

  const { icon, color, title } = getStatusDisplay();

  const formatLastSyncTime = (time: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return '数秒前';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}分前`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}時間前`;
    } else {
      return time.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {/* フィルタボタンと同じスタイルのボタン */}
      <button 
        className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${color}`}
        title={title}
      >
        {icon}
      </button>
      
      {/* ツールチップ - レスポンシブ対応 */}
      <div className="absolute right-0 top-full mt-2 w-screen max-w-xs sm:w-64 bg-white rounded-lg shadow-lg border py-3 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-50 sm:translate-x-0 -translate-x-1/2 left-1/2 sm:left-auto">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 truncate">同期状態</span>
            <div className={`flex items-center space-x-1 ${color} shrink-0`}>
              {icon}
              <span className="text-xs hidden sm:inline">{title}</span>
            </div>
          </div>
          
          {lastSyncTime && (
            <div className="text-xs text-gray-500 truncate">
              最終同期: {formatLastSyncTime(lastSyncTime)}
            </div>
          )}
          
          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded break-words">
              {error}
            </div>
          )}
          
          <div className="border-t pt-2 mt-2">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between items-center">
                <span className="truncate">ステータス:</span>
                <span className={`${color} truncate max-w-20`}>{title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="truncate">接続:</span>
                <span className={`truncate max-w-20 ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                  {status === 'error' ? 'オフライン' : 'オンライン'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};