import React from 'react';
import { Component } from '../types';
import { ComponentCard } from './ComponentCard';

interface ComponentListProps {
  components: Component[];
  onEdit: (component: Component) => void;
  onDelete: (id: string) => void;
  onView: (component: Component) => void;
  loading?: boolean;
  viewMode: 'grid' | 'list';
}

export const ComponentList: React.FC<ComponentListProps> = ({
  components,
  onEdit,
  onDelete,
  onView,
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
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="mx-auto h-12 w-12 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          コンポーネントが見つかりません
        </h3>
        <p className="mt-2 text-gray-500">
          新しいコンポーネントを作成して開始しましょう。
        </p>
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
          onView={onView}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};
