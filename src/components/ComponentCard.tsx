import React, { useState } from 'react';
import { Edit2, Trash2, Copy, Code, Calendar, User, Tag, Eye } from 'lucide-react';
import { Component } from '../types';
import { copyToClipboard } from '../utils/storage';
import { ComponentPreview } from './ComponentPreview';

interface ComponentCardProps {
  component: Component;
  onEdit: (component: Component) => void;
  onDelete: (id: string) => void;
  viewMode?: 'grid' | 'list';
}

export const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  onEdit,
  onDelete,
  viewMode = 'grid',
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');

  const handleCopy = async (code: string, type: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`「${component.name}」を削除しますか？この操作は取り消せません。`)) {
      onDelete(component.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">
              {component.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="inline-flex items-center shrink-0">
                <Tag className="h-3 w-3 mr-1" />
                {component.category}
              </span>
              <span className="inline-flex items-center shrink-0">
                <User className="h-3 w-3 mr-1" />
                {component.author}
              </span>
              <span className="inline-flex items-center shrink-0">
                <Calendar className="h-3 w-3 mr-1" />
                {component.updatedAt.toLocaleDateString('ja-JP')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => onEdit(component)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
              title="編集"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 表示切り替えタブ */}
      <div className="border-b border-gray-200">
        <nav className="flex" aria-label="Tabs">
          <button
            onClick={() => setActiveView('preview')}
            className={`flex-1 py-2 px-4 text-sm font-medium text-center border-b-2 ${
              activeView === 'preview'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Eye className="h-4 w-4 mx-auto mb-1" />
            プレビュー
          </button>
          <button
            onClick={() => setActiveView('code')}
            className={`flex-1 py-2 px-4 text-sm font-medium text-center border-b-2 ${
              activeView === 'code'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Code className="h-4 w-4 mx-auto mb-1" />
            コード
          </button>
        </nav>
      </div>

      {/* コンテンツエリア */}
      <div className="p-4">
        {activeView === 'preview' ? (
          /* プレビュー表示 */
          <div className={
            viewMode === 'list' 
              ? 'h-80 lg:h-96' // 1列表示時はより高く
              : 'h-64' // グリッド表示時は通常の高さ
          }>
            <ComponentPreview
              html={component.html}
              css={component.css}
              js={component.js}
            />
          </div>
        ) : (
          /* コード表示 */
          <div className="space-y-4">
            {/* HTML */}
            {component.html && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">HTML</span>
                  <button
                    onClick={() => handleCopy(component.html, 'html')}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 focus:outline-none"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copied === 'html' ? 'コピー済み' : 'コピー'}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-md p-3 max-h-24 overflow-y-auto">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap">
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
                  <span className="text-sm font-medium text-gray-700">CSS</span>
                  <button
                    onClick={() => handleCopy(component.css, 'css')}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 focus:outline-none"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copied === 'css' ? 'コピー済み' : 'コピー'}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-md p-3 max-h-24 overflow-y-auto">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap">
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
                  <span className="text-sm font-medium text-gray-700">JavaScript</span>
                  <button
                    onClick={() => handleCopy(component.js, 'js')}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 focus:outline-none"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copied === 'js' ? 'コピー済み' : 'コピー'}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-md p-3 max-h-24 overflow-y-auto">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                    {component.js.substring(0, 150)}
                    {component.js.length > 150 && '...'}
                  </pre>
                </div>
              </div>
            )}

            {/* コードがない場合の表示 */}
            {!component.html && !component.css && !component.js && (
              <div className="text-center py-8 text-gray-500">
                <Code className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">コードが設定されていません</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
