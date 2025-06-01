import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Upload, Plus, Grid, List } from 'lucide-react';
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
  syncError = null
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
      className="bg-white shadow-sm border-b"
      style={{ zoom }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* メインヘッダー */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
              Components
            </h1>
            
            {/* 同期ステータス表示 */}
            <div className="ml-4">
              <SyncStatusIndicator 
                status={syncStatus}
                error={syncError}
              />
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
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* 表示切り替えボタン */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => onViewModeChange('list')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="1列表示"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewModeChange('grid')}
                className={`px-3 py-2 text-sm font-medium border-l border-gray-300 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="3列グリッド表示"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>

            {/* フィルタボタン */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              フィルタ
            </button>

            {/* エクスポート */}
            <button
              onClick={onExport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              エクスポート
            </button>

            {/* インポート */}
            <button
              onClick={handleImportClick}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              インポート
            </button>

            {/* 新規作成 */}
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          {/* SP用FAB(新規作成ボタン) */}
          <div className="fixed bottom-6 right-6 z-50">
            <button
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  onClick={handleSearch}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
