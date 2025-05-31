import { useState, useEffect, useCallback } from 'react';
import { Component, ComponentFormData, SearchFilters } from '../types';
import { storage, generateId } from '../utils/storage';

export const useComponents = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);

  // 初期化時にローカルストレージから読み込み
  useEffect(() => {
    const loadedComponents = storage.getComponents();
    setComponents(loadedComponents);
    setLoading(false);
  }, []);

  // コンポーネントが変更されるたびにローカルストレージに保存
  useEffect(() => {
    if (!loading) {
      storage.saveComponents(components);
    }
  }, [components, loading]);

  const addComponent = (formData: ComponentFormData) => {
    const newComponent: Component = {
      id: generateId(),
      name: formData.name,
      category: formData.category,
      html: formData.html,
      css: formData.css,
      js: formData.js,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      author: 'Current User', // 実際の実装では現在のユーザー情報を使用
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setComponents(prev => [newComponent, ...prev]);
    return newComponent;
  };

  const updateComponent = (id: string, formData: ComponentFormData) => {
    setComponents(prev =>
      prev.map(component =>
        component.id === id
          ? {
              ...component,
              name: formData.name,
              category: formData.category,
              html: formData.html,
              css: formData.css,
              js: formData.js,
              tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
              updatedAt: new Date(),
            }
          : component
      )
    );
  };

  const deleteComponent = (id: string) => {
    setComponents(prev => prev.filter(component => component.id !== id));
  };

  const getComponent = (id: string): Component | undefined => {
    return components.find(component => component.id === id);
  };

  const searchComponents = useCallback((filters: SearchFilters): Component[] => {
    return components.filter(component => {
      const matchesQuery = !filters.query || 
        component.name.toLowerCase().includes(filters.query.toLowerCase()) ||
        component.tags.some(tag => tag.toLowerCase().includes(filters.query.toLowerCase()));

      const matchesCategory = !filters.category || component.category === filters.category;

      const matchesTags = filters.tags.length === 0 ||
        filters.tags.some(filterTag => 
          component.tags.some(componentTag => 
            componentTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        );

      return matchesQuery && matchesCategory && matchesTags;
    });
  }, [components]);

  const exportComponents = () => {
    storage.exportComponents(components);
  };

  const importComponents = async (file: File) => {
    try {
      const importedComponents = await storage.importComponents(file);
      setComponents(prev => [...importedComponents, ...prev]);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  };

  return {
    components,
    loading,
    addComponent,
    updateComponent,
    deleteComponent,
    getComponent,
    searchComponents,
    exportComponents,
    importComponents,
  };
};
