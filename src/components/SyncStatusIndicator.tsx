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
      
      {/* ツールチップ */}
      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border py-3 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-50">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">同期状態</span>
            <div className={`flex items-center space-x-1 ${color}`}>
              {icon}
              <span className="text-xs">{title}</span>
            </div>
          </div>
          
          {lastSyncTime && (
            <div className="text-xs text-gray-500">
              最終同期: {formatLastSyncTime(lastSyncTime)}
            </div>
          )}
          
          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="border-t pt-2 mt-2">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>ステータス:</span>
                <span className={color}>{title}</span>
              </div>
              <div className="flex justify-between">
                <span>接続:</span>
                <span className={status === 'error' ? 'text-red-600' : 'text-green-600'}>
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