import React, { useState } from 'react';
import { Edit2, Trash2, Copy, Code, Calendar, Tag, Eye, Maximize2 } from 'lucide-react';
import { Component } from '../types';
import { copyToClipboard, formatDateSimple } from '../utils/helpers';
import { ComponentPreview } from './ComponentPreview';
import { FullscreenPreviewModal } from './FullscreenPreviewModal';

interface ComponentCardProps {
  component: Component;
  onEdit: (component: Component) => void;
  onDelete: (id: string) => void;
  viewMode?: 'grid' | 'list';
  isDarkMode?: boolean;
  isThreeColumnGrid?: boolean;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  onEdit,
  onDelete,
  viewMode = 'grid',
  isDarkMode = false,
  isThreeColumnGrid = false,
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCopy = async (code: string, type: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleDelete = () => {
    onDelete(component.id);
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 ${
        isThreeColumnGrid ? 'grid grid-rows-[auto_auto_1fr] gap-0' : ''
      }`}
      style={isThreeColumnGrid ? {
        gridTemplateRows: 'subgrid',
        gridRow: 'span 3'
      } : {}}
    >
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1 truncate">
              {component.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center shrink-0">
                <Tag className="h-3 w-3 mr-1" />
                {component.category}
              </span>
              <span className="inline-flex items-center shrink-0">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDateSimple(component.updatedAt)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors duration-200"
              title="全画面表示"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(component)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-colors duration-200"
              title="編集"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors duration-200"
              title="削除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* タグ */}
        {component.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {component.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 表示切り替えタブ */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveView('preview')}
            className={`flex-1 py-2 px-4 text-sm font-medium text-center border-b-2 transition-colors duration-200 ${
              activeView === 'preview'
                ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Eye className="h-4 w-4 mx-auto mb-1" />
            プレビュー
          </button>
          <button
            type="button"
            onClick={() => setActiveView('code')}
            className={`flex-1 py-2 px-4 text-sm font-medium text-center border-b-2 transition-colors duration-200 ${
              activeView === 'code'
                ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Code className="h-4 w-4 mx-auto mb-1" />
            コード
          </button>
        </nav>
      </div>

      {/* コンテンツエリア */}
      <div className={`p-4 ${isThreeColumnGrid ? 'flex flex-col' : ''}`}>
        {activeView === 'preview' ? (
          /* プレビュー表示 */
          <div className={
            viewMode === 'list' 
              ? 'h-80 lg:h-96' // 1列表示時はより高く
              : isThreeColumnGrid 
                ? 'flex-1 min-h-[16rem]' // 3列表示時は flex-1 で均等化
                : 'h-64' // 通常のグリッド表示時
          }>
            <ComponentPreview
              html={component.html}
              css={component.css}
              js={component.js}
              componentId={component.id}
              isDarkMode={isDarkMode}
            />
          </div>
        ) : (
          /* コード表示 */
          <div className={`space-y-4 ${isThreeColumnGrid ? 'flex-1 overflow-y-auto' : ''}`}>
            {/* HTML */}
            {component.html && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">HTML</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(component.html, 'html')}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copied === 'html' ? 'コピー済み' : 'コピー'}
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-3 max-h-24 overflow-y-auto">
                  <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {component.html.substring(0, 150)}
                    {component.html.length > 150 && '...'}
                  </pre>
                </div>
              </div>
            )}

            {/* CSS */}
            {component.css && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CSS</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(component.css, 'css')}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copied === 'css' ? 'コピー済み' : 'コピー'}
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-3 max-h-24 overflow-y-auto">
                  <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {component.css.substring(0, 150)}
                    {component.css.length > 150 && '...'}
                  </pre>
                </div>
              </div>
            )}

            {/* JavaScript */}
            {component.js && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">JavaScript</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(component.js, 'js')}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copied === 'js' ? 'コピー済み' : 'コピー'}
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-3 max-h-24 overflow-y-auto">
                  <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {component.js.substring(0, 150)}
                    {component.js.length > 150 && '...'}
                  </pre>
                </div>
              </div>
            )}

            {/* コードがない場合の表示 */}
            {!component.html && !component.css && !component.js && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Code className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                <p className="text-sm">コードが設定されていません</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 全画面プレビューモーダル */}
      {isFullscreen && (
        <FullscreenPreviewModal
          component={component}
          onClose={() => setIsFullscreen(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};
