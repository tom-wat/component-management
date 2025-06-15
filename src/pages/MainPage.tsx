// pages/MainPage.tsx - 既存のApp.tsxからメインページ部分を抽出
import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Component, ComponentFormData, SearchFilters } from '../types';
import { useComponents } from '../hooks/useComponents';
import { useToast } from '../hooks/useToast';
import { useDarkMode } from '../hooks/useDarkMode';
import { Header } from '../components/Header';
import { ComponentList } from '../components/ComponentList';
import { ComponentForm } from '../components/ComponentForm';
import { ComponentViewer } from '../components/ComponentViewer';
import { ToastContainer } from '../components/Toast';
import { ComponentListSkeleton } from '../components/SkeletonLoader';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { Pagination } from '../components/Pagination';

type ModalState = 
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; component: Component }
  | { type: 'view'; component: Component }
  | { type: 'confirmDelete'; component: Component };

export function MainPage() {
  const {
    components,
    loading,
    pagination,
    totalCount,
    currentFilters,
    addComponent,
    updateComponent,
    deleteComponent,
    exportComponents,
    importComponents,
    loadPage,
    setFilters,
    syncStatus = 'idle',
    error: syncError = null,
  } = useComponents();

  const {
    toasts,
    removeToast,
    showSuccess,
    showError,
    showWarning
  } = useToast();

  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 同期エラーの監視とトースト表示
  useEffect(() => {
    if (syncError) {
      showError(
        'サーバー接続エラー',
        'データの同期に失敗しました。ネットワーク接続を確認してください。',
        0 // 手動で閉じるまで表示
      );
    }
  }, [syncError, showError]);


  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handleSearch = useCallback((filters: SearchFilters) => {
    setFilters(filters);
  }, [setFilters]);

  const handleCreateNew = useCallback(() => {
    setModalState({ type: 'create' });
  }, []);

  const handleEdit = useCallback((component: Component) => {
    setModalState({ type: 'edit', component });
  }, []);

  const handleSave = useCallback(async (formData: ComponentFormData) => {
    try {
      if (modalState.type === 'create') {
        await addComponent(formData);
        showSuccess(
          'コンポーネント作成完了',
          `「${formData.name}」を作成しました`
        );
      } else if (modalState.type === 'edit') {
        await updateComponent(modalState.component.id, formData);
        showSuccess(
          'コンポーネント更新完了',
          `「${formData.name}」を更新しました`
        );
      }
      setModalState({ type: 'none' });
    } catch (err) {
      const message = err instanceof Error ? err.message : '不明なエラーが発生しました';
      showError(
        modalState.type === 'create' ? 'コンポーネント作成エラー' : 'コンポーネント更新エラー',
        message
      );
    }
  }, [modalState, addComponent, updateComponent, showSuccess, showError]);

  const handleCancel = useCallback(() => {
    setModalState({ type: 'none' });
  }, []);

  const handleDeleteRequest = useCallback((id: string) => {
    const component = components.find(c => c.id === id);
    if (component) {
      setModalState({ type: 'confirmDelete', component });
    }
  }, [components]);

  const handleDeleteConfirm = useCallback(async () => {
    if (modalState.type !== 'confirmDelete') return;
    
    const component = modalState.component;
    
    try {
      await deleteComponent(component.id);
      showSuccess(
        'コンポーネント削除完了',
        `「${component.name}」を削除しました`
      );
      setModalState({ type: 'none' });
    } catch (err) {
      const message = err instanceof Error ? err.message : '削除に失敗しました';
      showError('コンポーネント削除エラー', message);
    }
  }, [modalState, deleteComponent, showSuccess, showError]);

  const handleExport = useCallback(() => {
    try {
      // 現在表示中のコンポーネントをエクスポート
      const exportedCount = exportComponents(components);
      
      showSuccess(
        'エクスポート完了',
        `現在のページの${exportedCount}件のコンポーネントをエクスポートしました`
      );
    } catch {
      showError('エクスポートエラー', 'エクスポートに失敗しました');
    }
  }, [exportComponents, components, showSuccess, showError]);

  const handleImport = useCallback(async (file: File) => {
    if (!file.name.endsWith('.json')) {
      showWarning('ファイル形式エラー', 'JSONファイルを選択してください');
      return;
    }

    try {
      const success = await importComponents(file);
      
      if (success) {
        showSuccess(
          'インポート完了',
          'コンポーネントのインポートが完了しました'
        );
      } else {
        showError(
          'インポートエラー',
          'ファイル形式を確認してください'
        );
      }
    } catch {
      showError(
        'インポートエラー',
        'ファイルの読み込みに失敗しました'
      );
    }
  }, [importComponents, showSuccess, showError, showWarning]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header
        onSearch={handleSearch}
        onExport={handleExport}
        onImport={handleImport}
        onCreateNew={handleCreateNew}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        syncStatus={syncStatus}
        syncError={syncError}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                コンポーネント一覧
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '読み込み中...' : `全${totalCount}件のコンポーネント`}
                {currentFilters.query && ` (「${currentFilters.query}」で検索)`}
                {currentFilters.category && ` (カテゴリ: ${currentFilters.category})`}
              </p>
            </div>
            {/* 管理者パネルボタン */}
            <Link
              to="/admin"
              className="flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 text-sm sm:text-base"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">管理者パネル</span>
              <span className="sm:hidden">管理</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <ComponentListSkeleton count={6} viewMode={viewMode} />
        ) : (
          <>
            {/* 上部: 表示件数情報（左）とページネーション（右） */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                {' '}から{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, totalCount)}</span>
                {' '}まで（全{' '}
                <span className="font-medium">{totalCount}</span>
                {' '}件中）
              </div>
              
              <div className="hidden sm:block">
                <Pagination
                  pagination={pagination}
                  onPageChange={loadPage}
                  loading={loading}
                  showInfo={false}
                />
              </div>
            </div>
            
            <ComponentList
              components={components}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onCreateNew={handleCreateNew}
              loading={loading}
              viewMode={viewMode}
              isDarkMode={isDarkMode}
            />
            
            {/* 下部ページネーション */}
            <div className="mt-8">
              <Pagination
                pagination={pagination}
                onPageChange={loadPage}
                loading={loading}
              />
            </div>
          </>
        )}
      </main>

      {/* モーダル */}
      {modalState.type === 'create' && (
        <ComponentForm
          onSave={handleSave}
          onCancel={handleCancel}
          isEditing={false}
          isDarkMode={isDarkMode}
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
          isDarkMode={isDarkMode}
        />
      )}

      {modalState.type === 'view' && (
        <ComponentViewer
          component={modalState.component}
          onClose={handleCancel}
          isDarkMode={isDarkMode}
        />
      )}

      {modalState.type === 'confirmDelete' && (
        <ConfirmDeleteModal
          component={modalState.component}
          onConfirm={handleDeleteConfirm}
          onCancel={handleCancel}
        />
      )}

      {/* トースト通知 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
