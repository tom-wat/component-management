import React from 'react';
import { Component } from '../types';
import { ComponentCard } from './ComponentCard';

interface ComponentListProps {
  components: Component[];
  onEdit: (component: Component) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  loading?: boolean;
  viewMode: 'grid' | 'list';
}

export const ComponentList: React.FC<ComponentListProps> = ({
  components,
  onEdit,
  onDelete,
  onCreateNew,
  loading = false,
  viewMode,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div className="text-center py-16">
        {/* 虹眼鏡アイコン */}
        <div className="text-4xl mb-6" role="img" aria-label="検索">
          🔍
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          コンポーネントが見つかりません
        </h3>
        <p className="text-gray-500 mb-6">
          検索条件を変更するか、新しいコンポーネントを作成してください。
        </p>
        <button
          onClick={onCreateNew}
          className="hidden md:inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規作成
        </button>
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'grid' 
        ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        : "grid grid-cols-1 gap-6"
    }>
      {components.map((component) => (
        <ComponentCard
          key={component.id}
          component={component}
          onEdit={onEdit}
          onDelete={onDelete}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};
