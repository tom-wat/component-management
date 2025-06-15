// src/hooks/useCloudComponents.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Component, ComponentFormData, PaginationOptions, SearchFilters } from '../types';
import { CloudComponentAPI } from '../services/cloudApi';
import { getConfig } from '../utils/env';
import { downloadFile } from '../utils/helpers';

export const useCloudComponents = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: 30,
    total: 0
  });
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    tags: [],
  });

  // API インスタンスをuseMemoでキャッシュ
  const api = useMemo(() => {
    const { apiUrl } = getConfig();
    return new CloudComponentAPI(apiUrl);
  }, []);

  const loadComponents = useCallback(async (page: number = pagination.page, resetData: boolean = false, filters?: SearchFilters) => {
    setLoading(true);
    setError(null);
    setSyncStatus('syncing');
    
    try {
      // 環境変数でリモートAPI使用を制御
      const useRemote = import.meta.env.VITE_DEV_USE_REMOTE === 'true' || !import.meta.env.DEV;
      
      if (!useRemote && import.meta.env.DEV) {
        // 開発環境でモックデータを使用する場合のみ（ページネーション対応）
        const allMockComponents: Component[] = [];
        
        // より多くのモックデータを生成（ページネーションテスト用）
        for (let i = 1; i <= 75; i++) {
          allMockComponents.push({
            id: `mock-${i}`,
            name: `サンプルコンポーネント ${i}`,
            category: i % 5 === 0 ? 'Layout' : i % 3 === 0 ? 'Form' : 'UI',
            html: `<div class="component-${i}">コンポーネント ${i}</div>`,
            css: `.component-${i} { padding: 10px; margin: 5px; border: 1px solid #ccc; }`,
            js: `console.log('Component ${i} loaded');`,
            tags: [`タグ${i % 5 + 1}`, i % 2 === 0 ? '偶数' : '奇数'],
            author: 'System',
            createdAt: new Date(`2024-01-${String(i % 30 + 1).padStart(2, '0')}`),
            updatedAt: new Date(),
          });
        }
        
        // ページネーション適用
        const startIndex = (page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const paginatedComponents = allMockComponents.slice(startIndex, endIndex);
        
        // 簡単な遅延でAPI呼び出しをシミュレート
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setComponents(resetData ? paginatedComponents : [...components, ...paginatedComponents]);
        setTotalCount(allMockComponents.length);
        setHasMore(endIndex < allMockComponents.length);
        setPagination(prev => ({ ...prev, page, total: allMockComponents.length }));
        setSyncStatus('idle');
        return;
      }
      
      // リモートAPIを使用（ページネーション対応）
      const activeFilters = filters || currentFilters;
      const result = await api.getComponents({
        limit: pagination.limit,
        offset: (page - 1) * pagination.limit,
        category: activeFilters.category || undefined,
        search: activeFilters.query || undefined
      });
      
      setComponents(resetData ? result.components : [...components, ...result.components]);
      setTotalCount(result.total);
      setHasMore(result.hasMore);
      setPagination(prev => ({ ...prev, page, total: result.total }));
      setSyncStatus('idle');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load components';
      setError(errorMessage);
      setSyncStatus('error');
      console.error('Failed to load components:', err);
    } finally {
      setLoading(false);
    }
  }, [api, pagination.page, pagination.limit, components]);

  const addComponent = useCallback(async (formData: ComponentFormData) => {
    setSyncStatus('syncing');
    setError(null);
    
    try {
      const result = await api.createComponent(formData);
      console.log('Component created:', result.message);
      
      // 作成後、最初のページから再読み込み
      await loadComponents(1, true);
      
      // Component型に適合するオブジェクトを返す
      const newComponent: Component = {
        id: result.id,
        name: formData.name,
        category: formData.category,
        html: formData.html,
        css: formData.css,
        js: formData.js,
        tags: typeof formData.tags === 'string' 
          ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          : [],
        author: 'Anonymous',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return newComponent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create component';
      setError(errorMessage);
      setSyncStatus('error');
      throw new Error(errorMessage);
    }
  }, [api, loadComponents]);

  const updateComponent = useCallback(async (id: string, formData: ComponentFormData) => {
    setSyncStatus('syncing');
    setError(null);
    
    try {
      await api.updateComponent(id, formData);
      
      // 更新後、現在のページを再読み込み
      await loadComponents(pagination.page, true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update component';
      setError(errorMessage);
      setSyncStatus('error');
      throw new Error(errorMessage);
    }
  }, [api, loadComponents, pagination.page]);

  const deleteComponent = useCallback(async (id: string) => {
    setSyncStatus('syncing');
    setError(null);
    
    try {
      await api.deleteComponent(id);
      
      // 削除後、リストから即座に削除（楽観的更新）
      setComponents(prev => prev.filter(c => c.id !== id));
      setTotalCount(prev => prev - 1);
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      setSyncStatus('idle');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete component';
      setError(errorMessage);
      setSyncStatus('error');
      // 削除に失敗した場合は、リストを再読み込みして正しい状態に戻す
      await loadComponents(pagination.page, true);
      throw new Error(errorMessage);
    }
  }, [api, loadComponents, pagination.page]);

  const exportComponents = useCallback((componentsToExport?: Component[]) => {
    // フィルタリングされたコンポーネントが渡された場合はそれを使用、そうでなければ全体を使用
    const dataToExport = componentsToExport || components;
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const count = dataToExport.length;
    const filename = `components-export-${count}items-${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(dataStr, filename, 'application/json');
    return count; // エクスポートした件数を返す
  }, [components]);

  const importComponents = useCallback(async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      if (!Array.isArray(importedData)) {
        throw new Error('Invalid file format');
      }

      setSyncStatus('syncing');
      
      // 各コンポーネントを個別に作成
      for (const componentData of importedData) {
        if (componentData.name && componentData.category) {
          const formData: ComponentFormData = {
            name: componentData.name,
            category: componentData.category,
            html: componentData.html || '',
            css: componentData.css || '',
            js: componentData.js || '',
            tags: Array.isArray(componentData.tags) 
              ? componentData.tags.join(', ')
              : (componentData.tags || ''),
          };
          
          await api.createComponent(formData);
        }
      }
      
      // インポート完了後、最初のページから再読み込み
      await loadComponents(1, true);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      setError('インポートに失敗しました');
      setSyncStatus('error');
      return false;
    }
  }, [api, loadComponents]);

  // ページネーション関連の関数
  const loadPage = useCallback(async (page: number) => {
    await loadComponents(page, true);
  }, [loadComponents]);
  
  const setPageSize = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
    loadComponents(1, true);
  }, [loadComponents]);

  const setFilters = useCallback((filters: SearchFilters) => {
    setCurrentFilters(filters);
    setPagination(prev => ({ ...prev, page: 1 })); // 検索時は1ページ目に戻る
    loadComponents(1, true, filters); // 新しいフィルタを直接渡す
  }, [loadComponents]);
  
  // 初回読み込み
  useEffect(() => {
    loadComponents(1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    components,
    loading,
    error,
    syncStatus,
    pagination,
    totalCount,
    hasMore,
    currentFilters,
    addComponent,
    updateComponent,
    deleteComponent,
    exportComponents,
    importComponents,
    refreshComponents: () => loadComponents(pagination.page, true),
    loadPage,
    setPageSize,
    setFilters,
  };
};