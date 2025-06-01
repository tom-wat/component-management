import { useState, useEffect, useMemo } from 'react';
import { Component, ComponentFormData, SearchFilters } from './types';
import { useComponents } from './hooks/useComponents';
import { Header } from './components/Header';
import { ComponentList } from './components/ComponentList';
import { ComponentForm } from './components/ComponentForm';
import { ComponentViewer } from './components/ComponentViewer';
import { loadSampleData } from './data/sampleComponents';

type ModalState = 
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; component: Component }
  | { type: 'view'; component: Component };

function App() {
  const {
    components,
    loading,
    addComponent,
    updateComponent,
    deleteComponent,
    exportComponents,
    importComponents,
  } = useComponents();

  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    tags: [],
  });

  // 初回起動時にサンプルデータを読み込み
  useEffect(() => {
    loadSampleData();
  }, []);

  // コンポーネントのフィルタリングをuseMemoで最適化
  const filteredComponents = useMemo(() => {
    if (loading) return [];
    
    return components.filter(component => {
      const matchesQuery = !currentFilters.query || 
        component.name.toLowerCase().includes(currentFilters.query.toLowerCase()) ||
        component.tags.some(tag => tag.toLowerCase().includes(currentFilters.query.toLowerCase()));

      const matchesCategory = !currentFilters.category || component.category === currentFilters.category;

      const matchesTags = currentFilters.tags.length === 0 ||
        currentFilters.tags.some(filterTag => 
          component.tags.some(componentTag => 
            componentTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        );

      return matchesQuery && matchesCategory && matchesTags;
    });
  }, [components, currentFilters, loading]);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  const handleSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters);
  };

  const handleCreateNew = () => {
    setModalState({ type: 'create' });
  };

  const handleEdit = (component: Component) => {
    setModalState({ type: 'edit', component });
  };

  const handleView = (component: Component) => {
    setModalState({ type: 'view', component });
  };

  const handleSave = (formData: ComponentFormData) => {
    if (modalState.type === 'create') {
      addComponent(formData);
    } else if (modalState.type === 'edit') {
      updateComponent(modalState.component.id, formData);
    }
    setModalState({ type: 'none' });
  };

  const handleCancel = () => {
    setModalState({ type: 'none' });
  };

  const handleDelete = (id: string) => {
    deleteComponent(id);
  };

  const handleExport = () => {
    exportComponents();
  };

  const handleImport = async (file: File) => {
    const success = await importComponents(file);
    if (success) {
      alert('コンポーネントのインポートが完了しました');
    } else {
      alert('インポートに失敗しました。ファイル形式を確認してください。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={handleSearch}
        onExport={handleExport}
        onImport={handleImport}
        onCreateNew={handleCreateNew}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                コンポーネント一覧
              </h2>
              <p className="text-sm text-gray-500">
                {loading ? '読み込み中...' : `${filteredComponents.length} 件のコンポーネント`}
                {currentFilters.query && ` (「${currentFilters.query}」で検索)`}
                {currentFilters.category && ` (カテゴリ: ${currentFilters.category})`}
              </p>
            </div>
          </div>
        </div>

        <ComponentList
          components={filteredComponents}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onCreateNew={handleCreateNew}
          loading={loading}
          viewMode={viewMode}
        />
      </main>

      {/* モーダル */}
      {modalState.type === 'create' && (
        <ComponentForm
          onSave={handleSave}
          onCancel={handleCancel}
          isEditing={false}
        />
      )}

      {modalState.type === 'edit' && (
        <ComponentForm
          initialData={{
            name: modalState.component.name,
            category: modalState.component.category,
            html: modalState.component.html,
            css: modalState.component.css,
            js: modalState.component.js,
            tags: modalState.component.tags.join(', '),
          }}
          onSave={handleSave}
          onCancel={handleCancel}
          isEditing={true}
        />
      )}

      {modalState.type === 'view' && (
        <ComponentViewer
          component={modalState.component}
          onClose={handleCancel}
        />
      )}
    </div>
  );
}

export default App;
