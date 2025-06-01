// src/hooks/useCloudComponents.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Component, ComponentFormData } from '../types';
import { CloudComponentAPI } from '../services/cloudApi';
import { getConfig } from '../utils/env';
import { downloadFile } from '../utils/helpers';

export const useCloudComponents = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // API インスタンスをuseMemoでキャッシュ
  const api = useMemo(() => {
    const { apiUrl } = getConfig();
    return new CloudComponentAPI(apiUrl);
  }, []);

  const loadComponents = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSyncStatus('syncing');
    
    try {
      // 環境変数でリモートAPI使用を制御
      const useRemote = import.meta.env.VITE_DEV_USE_REMOTE === 'true' || !import.meta.env.DEV;
      
      if (!useRemote && import.meta.env.DEV) {
        // 開発環境でモックデータを使用する場合のみ
        const mockComponents: Component[] = [
          {
            id: 'mock-1',
            name: 'サンプルボタン',
            category: 'UI',
            html: '<button class="btn-primary">クリック</button>',
            css: '.btn-primary { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }',
            js: 'console.log("ボタンがクリックされました");',
            tags: ['ボタン', 'UI'],
            author: 'System',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date(),
          },
          {
            id: 'mock-2',
            name: 'カードコンポーネント',
            category: 'UI',
            html: '<div class="card"><h3>タイトル</h3><p>コンテンツ</p></div>',
            css: '.card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }',
            js: '',
            tags: ['カード', 'レイアウト'],
            author: 'System',
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date(),
          }
        ];
        
        // 簡単な遅延でAPI呼び出しをシミュレート
        await new Promise(resolve => setTimeout(resolve, 500));
        setComponents(mockComponents);
        setSyncStatus('idle');
        return;
      }
      
      // リモートAPIを使用
      const result = await api.getComponents();
      setComponents(result.components);
      setSyncStatus('idle');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load components';
      setError(errorMessage);
      setSyncStatus('error');
      console.error('Failed to load components:', err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const addComponent = useCallback(async (formData: ComponentFormData) => {
    setSyncStatus('syncing');
    setError(null);
    
    try {
      const result = await api.createComponent(formData);
      console.log('Component created:', result.message);
      
      // 作成後、リストを再読み込み
      await loadComponents();
      
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
      
      // 更新後、リストを再読み込み
      await loadComponents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update component';
      setError(errorMessage);
      setSyncStatus('error');
      throw new Error(errorMessage);
    }
  }, [api, loadComponents]);

  const deleteComponent = useCallback(async (id: string) => {
    setSyncStatus('syncing');
    setError(null);
    
    try {
      await api.deleteComponent(id);
      
      // 削除後、リストから即座に削除（楽観的更新）
      setComponents(prev => prev.filter(c => c.id !== id));
      setSyncStatus('idle');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete component';
      setError(errorMessage);
      setSyncStatus('error');
      // 削除に失敗した場合は、リストを再読み込みして正しい状態に戻す
      await loadComponents();
      throw new Error(errorMessage);
    }
  }, [api, loadComponents]);

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
      
      // インポート完了後、リストを再読み込み
      await loadComponents();
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      setError('インポートに失敗しました');
      setSyncStatus('error');
      return false;
    }
  }, [api, loadComponents]);

  // 初回読み込み
  useEffect(() => {
    loadComponents();
  }, [loadComponents]);

  return {
    components,
    loading,
    error,
    syncStatus,
    addComponent,
    updateComponent,
    deleteComponent,
    exportComponents,
    importComponents,
    refreshComponents: loadComponents,
  };
};