import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Component } from '../types';
import { ComponentPreview } from './ComponentPreview';

interface FullscreenPreviewModalProps {
  component: Component;
  onClose: () => void;
}

export const FullscreenPreviewModal: React.FC<FullscreenPreviewModalProps> = ({
  component,
  onClose,
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
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col z-[60]">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-semibold">{component.name}</h2>
            <span className="text-sm text-gray-300">全画面プレビュー</span>
          </div>
          {component.category && (
            <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
              {component.category}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 hidden sm:block">
            ESCキーで閉じる
          </span>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 rounded p-1 transition-colors"
            aria-label="全画面プレビューを閉じる"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* プレビューエリア */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="h-full min-h-[500px]">
          <ComponentPreview
            html={component.html}
            css={component.css}
            js={component.js}
            isModal={true}
          />
        </div>
      </div>
      
      {/* フッター（オプション） */}
      <div className="bg-gray-900 text-gray-400 px-6 py-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {component.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <span>タグ:</span>
                <div className="flex flex-wrap gap-1">
                  {component.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
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
