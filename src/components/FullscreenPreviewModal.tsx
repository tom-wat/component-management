import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Component } from '../types';
import { ComponentPreview } from './ComponentPreview';

interface FullscreenPreviewModalProps {
  component: Component;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const FullscreenPreviewModal: React.FC<FullscreenPreviewModalProps> = ({
  component,
  onClose,
  isDarkMode = false,
}) => {
  // ESCキーで閉じる機能
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // スクロールを無効化
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className={`fixed inset-0 ${isDarkMode ? 'bg-black' : 'bg-gray-900'} bg-opacity-95 flex flex-col z-[60]`}>
      {/* ヘッダー */}
      <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'} ${isDarkMode ? 'text-white' : 'text-gray-900'} border-b`}>
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-semibold">{component.name}</h2>
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>全画面プレビュー</span>
          </div>
          {component.category && (
            <span className={`px-2 py-1 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} rounded text-xs`}>
              {component.category}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} hidden sm:block`}>
            ESCキーで閉じる
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`${isDarkMode ? 'text-gray-300 hover:text-white focus:ring-gray-500' : 'text-gray-500 hover:text-gray-700 focus:ring-gray-400'} focus:outline-none focus:ring-2 rounded p-1 transition-colors`}
            aria-label="全画面プレビューを閉じる"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* プレビューエリア */}
      <div className={`flex-1 p-6 overflow-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="h-full min-h-[500px]">
          <ComponentPreview
            html={component.html}
            css={component.css}
            js={component.js}
            isModal={true}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
      
      {/* フッター（オプション） */}
      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600'} px-6 py-3 border-t`}>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {component.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <span>タグ:</span>
                <div className="flex flex-wrap gap-1">
                  {component.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} rounded text-xs`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="text-xs">
            最終更新: {new Date(component.updatedAt).toLocaleDateString('ja-JP')}
          </div>
        </div>
      </div>
    </div>
  );
};
