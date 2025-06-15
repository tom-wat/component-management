import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUp, ArrowDown, Plus, Grid, List, Sun, Moon } from 'lucide-react';
import { SearchFilters } from '../types';
import { SyncStatusIndicator } from './SyncStatusIndicator';

interface HeaderProps {
  onSearch: (filters: SearchFilters) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onCreateNew: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  // 同期ステータス用
  syncStatus?: 'idle' | 'syncing' | 'error';
  syncError?: string | null;
  // ダークモード用
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const categories = ['', 'UI', 'Layout', 'Form', 'Navigation', 'Content', 'Other'];

export const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  onExport, 
  onImport, 
  onCreateNew,
  viewMode,
  onViewModeChange,
  syncStatus = 'idle',
  syncError = null,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [zoom, setZoom] = useState(1);

  // ウィンドウサイズに応じてzoomを設定
  useEffect(() => {
    const updateZoom = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setZoom(1);
      } else if (width <= 1024) {
        setZoom(0.5);
      } else if (width <= 1280) {
        setZoom(0.75);
      } else {
        setZoom(1);
      }
    };

    // 初回設定
    updateZoom();

    // リサイズイベントリスナー追加
    window.addEventListener('resize', updateZoom);

    // クリーンアップ
    return () => window.removeEventListener('resize', updateZoom);
  }, []);

  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      category: selectedCategory,
      tags: [],
    });
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        onImport(file);
      }
    };
    input.click();
  };

  return (
    <header 
      className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200"
      style={{ zoom }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* メインヘッダー */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
              Components
            </h1>
            
            {/* 同期ステータス表示 */}
            <div className="ml-4">
              <SyncStatusIndicator 
                status={syncStatus}
                error={syncError}
              />
            </div>

            {/* ダークモード切り替え */}
            <div className="ml-3">
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="inline-flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                title={isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
              >
                {isDarkMode ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* デスクトップのみ表示 */}
          <div className="hidden md:flex items-center space-x-4">
            {/* 検索バー */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="コンポーネントを検索..."
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* 表示切り替えボタン */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title="1列表示"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`px-3 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-600 transition-colors duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title="3列グリッド表示"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>

            {/* フィルタボタン */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            >
              <Filter className="h-4 w-4 mr-2" />
              フィルタ
            </button>

            {/* エクスポート */}
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            >
              <ArrowUp className="h-4 w-4 mr-2" />
              エクスポート
            </button>

            {/* インポート */}
            <button
              type="button"
              onClick={handleImportClick}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            >
              <ArrowDown className="h-4 w-4 mr-2" />
              インポート
            </button>

            {/* 新規作成 */}
            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </button>
          </div>
        </div>

        {/* モバイル用検索バー */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="コンポーネントを検索..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          {/* SP用FAB(新規作成ボタン) */}
          <div className="fixed bottom-6 right-6 z-50">
            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex items-center justify-center w-14 h-14 border border-transparent rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              title="新規作成"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* フィルタパネル（デスクトップのみ） */}
        {showFilters && (
          <div className="hidden md:block pb-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  カテゴリ
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category || 'すべて'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  検索
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
