import React, { memo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationOptions } from '../types';

interface PaginationProps {
  pagination: PaginationOptions;
  onPageChange: (page: number) => void;
  loading?: boolean;
  className?: string;
  showInfo?: boolean; // 件数情報を表示するかどうか
}

const PaginationComponent: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  loading = false,
  className = '',
  showInfo = true,
}) => {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  if (totalPages <= 1) {
    return null;
  }

  // ページ番号の生成ロジック
  const getPageNumbers = () => {
    const delta = 2; // 現在のページの前後に表示するページ数
    const pages: (number | string)[] = [];
    
    // 最初のページは常に表示
    pages.push(1);
    
    const startPage = Math.max(2, page - delta);
    const endPage = Math.min(totalPages - 1, page + delta);
    
    // ... を挿入するかどうかの判定
    if (startPage > 2) {
      pages.push('...');
    }
    
    // 中間のページ番号を追加
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }
    
    // ... を挿入するかどうかの判定
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    // 最後のページは常に表示（1ページより多い場合）
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (targetPage: number) => {
    if (targetPage >= 1 && targetPage <= totalPages && targetPage !== page && !loading) {
      onPageChange(targetPage);
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* 件数表示 */}
      {showInfo && (
        <div className="flex-1 flex justify-between sm:hidden">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {total > 0 ? `${startItem}-${endItem} / ${total}件` : '0件'}
          </span>
        </div>
      )}

      <div className={`${showInfo ? 'hidden sm:flex-1 sm:flex sm:items-center sm:justify-between' : 'flex justify-center w-full'}`}>
        {showInfo && (
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">{startItem}</span>
              {' '}から{' '}
              <span className="font-medium">{endItem}</span>
              {' '}まで（全{' '}
              <span className="font-medium">{total}</span>
              {' '}件中）
            </p>
          </div>
        )}

        {/* ページネーション */}
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* 最初のページへ */}
            <button
              type="button"
              onClick={() => handlePageClick(1)}
              disabled={page === 1 || loading}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              title="最初のページ"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            {/* 前のページへ */}
            <button
              type="button"
              onClick={() => handlePageClick(page - 1)}
              disabled={page === 1 || loading}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              title="前のページ"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* ページ番号 */}
            {pageNumbers.map((pageNumber, index) => (
              pageNumber === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageClick(pageNumber as number)}
                  disabled={loading}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                    pageNumber === page
                      ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {pageNumber}
                </button>
              )
            ))}

            {/* 次のページへ */}
            <button
              type="button"
              onClick={() => handlePageClick(page + 1)}
              disabled={page === totalPages || loading}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              title="次のページ"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* 最後のページへ */}
            <button
              type="button"
              onClick={() => handlePageClick(totalPages)}
              disabled={page === totalPages || loading}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              title="最後のページ"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>

      {/* モバイル用ナビゲーション */}
      {!showInfo && (
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            type="button"
            onClick={() => handlePageClick(page - 1)}
            disabled={page === 1 || loading}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            前へ
          </button>
          <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => handlePageClick(page + 1)}
            disabled={page === totalPages || loading}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
};

export const Pagination = memo(PaginationComponent);