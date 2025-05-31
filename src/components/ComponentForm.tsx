import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { ComponentFormData } from '../types';
import { CodeEditor } from './CodeEditor';
import { ComponentPreview } from './ComponentPreview';

interface ComponentFormProps {
  initialData?: ComponentFormData;
  onSave: (data: ComponentFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const categories = ['UI', 'Layout', 'Form', 'Navigation', 'Content', 'Other'];

export const ComponentForm: React.FC<ComponentFormProps> = ({
  initialData,
  onSave,
  onCancel,
  isEditing = false,
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

  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'preview'>('html');

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'コンポーネントを編集' : '新しいコンポーネントを作成'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          {/* 基本情報 */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  コンポーネント名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例: プライマリボタン"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateFormData('category', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タグ
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => updateFormData('tags', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ボタン, プライマリ, アクション"
                />
              </div>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'html', label: 'HTML' },
                { id: 'css', label: 'CSS' },
                { id: 'js', label: 'JavaScript' },
                { id: 'preview', label: 'プレビュー' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* コンテンツエリア */}
          <div className="flex-1 p-6">
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
                />
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
