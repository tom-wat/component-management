import React, { useState } from 'react';
import { X, Copy, Code, Eye, Maximize2 } from 'lucide-react';
import { Component } from '../types';
import { ComponentPreview } from './ComponentPreview';
import { FullscreenPreviewModal } from './FullscreenPreviewModal';
import { copyToClipboard, formatDateSimple } from '../utils/helpers';

interface ComponentViewerProps {
  component: Component;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const ComponentViewer: React.FC<ComponentViewerProps> = ({
  component,
  onClose,
  isDarkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'css' | 'js'>('preview');
  const [copied, setCopied] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCopy = async (code: string, type: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const tabs = [
    { id: 'preview' as const, label: 'プレビュー', icon: Eye },
    { id: 'html' as const, label: 'HTML', icon: Code, content: component.html },
    { id: 'css' as const, label: 'CSS', icon: Code, content: component.css },
    { id: 'js' as const, label: 'JavaScript', icon: Code, content: component.js },
  ].filter(tab => tab.id === 'preview' || tab.content);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {component.name}
              </h2>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                <span>{component.category}</span>
                <span>更新日: {formatDateSimple(component.updatedAt)}</span>
              </div>
              {component.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {component.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* プレビュータブが選択されている時のみ全画面ボタンを表示 */}
              {activeTab === 'preview' && (
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
                  title="プレビューを全画面表示"
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  全画面表示
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* コンテンツエリア */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'preview' && (
              <div className="h-full p-6">
                <ComponentPreview
                  html={component.html}
                  css={component.css}
                  js={component.js}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}

            {activeTab !== 'preview' && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    {activeTab.toUpperCase()} コード
                  </h3>
                  <button
                    onClick={() => handleCopy(
                      activeTab === 'html' ? component.html :
                      activeTab === 'css' ? component.css :
                      component.js,
                      activeTab
                    )}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copied === activeTab ? 'コピー済み' : 'コードをコピー'}
                  </button>
                </div>
                
                <div className="flex-1 p-4 overflow-auto">
                  <div className="code-preview p-4 rounded-md">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {activeTab === 'html' ? component.html :
                       activeTab === 'css' ? component.css :
                       component.js}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 全画面プレビューモーダル */}
      {isFullscreen && (
        <FullscreenPreviewModal
          component={component}
          onClose={() => setIsFullscreen(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
};
