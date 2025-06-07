import React, { useState, useEffect, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { ComponentFormData } from '../types';
import { CodeEditor } from './CodeEditor';
import { ComponentPreview } from './ComponentPreview';

interface ComponentFormProps {
  initialData?: ComponentFormData;
  onSave: (data: ComponentFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isDarkMode?: boolean;
}

const categories = ['UI', 'Layout', 'Form', 'Navigation', 'Content', 'Other'];

export const ComponentForm: React.FC<ComponentFormProps> = ({
  initialData,
  onSave,
  onCancel,
  isEditing = false,
  isDarkMode = false,
}) => {
  const [formData, setFormData] = useState<ComponentFormData>(
    initialData || {
      name: '',
      category: 'UI',
      html: '',
      css: '',
      js: '',
      tags: '',
    }
  );

  type TabType = 'html' | 'css' | 'js' | 'preview';
  const [activeTab, setActiveTab] = useState<TabType>('html');

  // ドラッグ状態を追跡するための状態管理
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(false);
  const dragTimeoutRef = useRef<number | null>(null);

  // モーダル表示時に背景のスクロールをロック
  useEffect(() => {
    // モーダルが開かれた時にbodyのスクロールを無効化
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    // コンポーネントがアンマウントされた時にスクロールを復元
    return () => {
      document.body.style.overflow = originalStyle;
      // ドラッグタイムアウトをクリア
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  // ESCキーでモーダルを閉じる機能
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  // ドラッグ関連のイベントハンドラー
  const handleMouseDown = () => {
    dragStartRef.current = true;
    setIsDragging(false);
  };

  const handleMouseMove = () => {
    if (dragStartRef.current) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    dragStartRef.current = false;
    // 少し遅延させてドラッグ状態をリセット（背景クリックイベントとの競合を防ぐ）
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(false);
    }, 100);
  };

  // グローバルなマウスイベントリスナーを設定
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('コンポーネント名は必須です');
      return;
    }
    onSave(formData);
  };

  const updateFormData = (field: keyof ComponentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // ドラッグ中は背景クリックを無視
    if (isDragging) {
      return;
    }
    
    // 背景幕をクリックした場合のみモーダルを閉じる
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-y-scroll transition-colors duration-200"
        onMouseDown={handleMouseDown}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'コンポーネントを編集' : '新しいコンポーネントを作成'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          {/* 基本情報 */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  コンポーネント名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                  placeholder="例: プライマリボタン"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  カテゴリ
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateFormData('category', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  タグ
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => updateFormData('tags', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                  placeholder="ボタン, プライマリ, アクション"
                />
              </div>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6" aria-label="Tabs">
              {([
                { id: 'html', label: 'HTML' },
                { id: 'css', label: 'CSS' },
                { id: 'js', label: 'JavaScript' },
                { id: 'preview', label: 'プレビュー' },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* コンテンツエリア */}
          <div className="flex-1 p-4 sm:p-6">
            {activeTab === 'html' && (
              <CodeEditor
                value={formData.html}
                onChange={(value) => updateFormData('html', value)}
                language="html"
                placeholder="HTMLコードを入力してください..."
              />
            )}
            
            {activeTab === 'css' && (
              <CodeEditor
                value={formData.css}
                onChange={(value) => updateFormData('css', value)}
                language="css"
                placeholder="CSSコードを入力してください..."
              />
            )}
            
            {activeTab === 'js' && (
              <CodeEditor
                value={formData.js}
                onChange={(value) => updateFormData('js', value)}
                language="javascript"
                placeholder="JavaScriptコードを入力してください..."
              />
            )}
            
            {activeTab === 'preview' && (
              <div className="h-full">
                <ComponentPreview
                  html={formData.html}
                  css={formData.css}
                  js={formData.js}
                  isModal={true}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="flex items-center justify-end space-x-4 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isEditing ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
