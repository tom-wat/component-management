// pages/AdminPage.tsx - 管理者ページメインコンポーネント
import { useState, useEffect } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  BarChart3, 
  Database,
  Calendar,
  ArrowLeft,
  RefreshCw,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi, AdminStats, DeletedComponent } from '../services/adminApi';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface AdminPageState {
  stats: AdminStats | null;
  deletedComponents: DeletedComponent[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  showPurgeModal: boolean;
  showPurgeAllModal: boolean;
}

export function AdminPage() {
  const [state, setState] = useState<AdminPageState>({
    stats: null,
    deletedComponents: [],
    loading: true,
    error: null,
    refreshing: false,
    showPurgeModal: false,
    showPurgeAllModal: false,
  });

  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setState(prev => ({ ...prev, refreshing: true }));
    } else {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const [statsData, deletedData] = await Promise.all([
        adminApi.getAdminStats(),
        adminApi.getDeletedComponents({ limit: 50 })
      ]);

      setState(prev => ({
        ...prev,
        stats: statsData,
        deletedComponents: deletedData.components,
        loading: false,
        refreshing: false,
        error: null,
      }));

      if (isRefresh) {
        showSuccess('データ更新完了', '最新のデータを取得しました');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: errorMessage,
      }));
      showError('データ取得エラー', errorMessage);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRestore = async (component: DeletedComponent) => {
    try {
      await adminApi.restoreComponent(component.id);
      showSuccess('復元完了', `「${component.name}」を復元しました`);
      
      // データを再読み込み
      loadData(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '復元に失敗しました';
      showError('復元エラー', errorMessage);
    }
  };

  const handlePurge = async (component: DeletedComponent) => {
    if (!confirm(`「${component.name}」を完全に削除しますか？\n\nこの操作は取り消すことができません。`)) {
      return;
    }

    try {
      await adminApi.purgeComponent(component.id);
      showSuccess('完全削除完了', `「${component.name}」を完全に削除しました`);
      
      // データを再読み込み
      loadData(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '削除に失敗しました';
      showError('削除エラー', errorMessage);
    }
  };

  const handlePurgeAll = () => {
    setState(prev => ({ ...prev, showPurgeAllModal: true }));
  };

  const handlePurgeAllConfirm = async () => {
    setState(prev => ({ ...prev, showPurgeAllModal: false }));

    if (state.deletedComponents.length === 0) {
      showWarning('削除対象なし', '削除されたコンポーネントがありません');
      return;
    }

    try {
      // 各コンポーネントを個別に完全削除
      let successCount = 0;
      const errors = [];

      for (const component of state.deletedComponents) {
        try {
          await adminApi.purgeComponent(component.id);
          successCount++;
        } catch (error) {
          errors.push(`${component.name}: ${error instanceof Error ? error.message : '不明なエラー'}`);
        }
      }

      if (errors.length > 0) {
        showError(
          '一部失敗', 
          `${successCount}件成功、${errors.length}件失敗\n\n失敗詳細:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}`
        );
      } else {
        showSuccess(
          '完全削除完了', 
          `すべての削除済みコンポーネント（${successCount}件）を完全削除しました`
        );
      }
      
      // データを再読み込み
      loadData(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '一括削除に失敗しました';
      showError('一括削除エラー', errorMessage);
    }
  };

  const handlePurgeAllCancel = () => {
    setState(prev => ({ ...prev, showPurgeAllModal: false }));
  };

  const handlePurgeOld = () => {
    setState(prev => ({ ...prev, showPurgeModal: true }));
  };

  const handlePurgeOldConfirm = async (days: number) => {
    setState(prev => ({ ...prev, showPurgeModal: false }));

    if (days < 1) {
      showWarning('入力エラー', '1以上の数値を入力してください');
      return;
    }

    try {
      const result = await adminApi.purgeOldComponents(days);
      
      if (result.deleted > 0) {
        showSuccess(
          '一括削除完了', 
          `${result.deleted}件のコンポーネントを完全削除しました`
        );
      } else {
        showWarning('削除対象なし', '指定期間内の削除済みコンポーネントはありませんでした');
      }
      
      // データを再読み込み
      loadData(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '一括削除に失敗しました';
      showError('一括削除エラー', errorMessage);
    }
  };

  const handlePurgeOldCancel = () => {
    setState(prev => ({ ...prev, showPurgeModal: false }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>メインページに戻る</span>
            </Link>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                🔧 管理者パネル
              </h1>
              <button
                onClick={() => loadData(true)}
                disabled={state.refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${state.refreshing ? 'animate-spin' : ''}`} />
                <span>更新</span>
              </button>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        {state.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">アクティブ</p>
                  <p className="text-3xl font-bold text-green-600">{state.stats.totalComponents}</p>
                </div>
                <Database className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">削除済み</p>
                  <p className="text-3xl font-bold text-red-600">{state.stats.deletedComponents}</p>
                </div>
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">最近削除</p>
                  <p className="text-3xl font-bold text-orange-600">{state.stats.recentDeleted}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">カテゴリ数</p>
                  <p className="text-3xl font-bold text-blue-600">{state.stats.categoriesStats.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        )}

        {/* 削除されたコンポーネント一覧 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                削除されたコンポーネント
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePurgeAll}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>すべて完全削除</span>
                </button>
                <button
                  onClick={handlePurgeOld}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  <AlertTriangle className="h-3 w-3" />
                  <span>古いコンポーネント一括削除</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {state.deletedComponents.length === 0 ? (
              <div className="text-center py-12">
                <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">削除されたコンポーネントはありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.deletedComponents.map((component) => (
                  <div
                    key={component.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {component.name}
                        </h3>
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          {component.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        削除日時: {formatDate(component.updatedAt)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRestore(component)}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>復元</span>
                      </button>
                      
                      <button
                        onClick={() => handlePurge(component)}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>完全削除</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* トースト通知 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* 古いコンポーネント一括削除モーダル */}
      {state.showPurgeModal && (
        <PurgeOldModal
          onConfirm={handlePurgeOldConfirm}
          onCancel={handlePurgeOldCancel}
        />
      )}

      {/* すべて完全削除モーダル */}
      {state.showPurgeAllModal && (
        <PurgeAllModal
          componentCount={state.deletedComponents.length}
          onConfirm={handlePurgeAllConfirm}
          onCancel={handlePurgeAllCancel}
        />
      )}
    </div>
  );
}

// すべて完全削除モーダル
interface PurgeAllModalProps {
  componentCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function PurgeAllModal({ componentCount, onConfirm, onCancel }: PurgeAllModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            すべて完全削除
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300">
              削除されたコンポーネントをすべて（<span className="font-semibold text-red-600">{componentCount}件</span>）完全に削除しますか？
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                  注意：この操作は取り消すことができません
                </h4>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  すべての削除済みコンポーネントがデータベースから完全に削除され、復元できなくなります。
                </p>
              </div>
            </div>
          </div>

          {componentCount === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                削除されたコンポーネントがありません。
              </p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || componentCount === 0}
              className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '削除中...' : `すべて完全削除（${componentCount}件）`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 古いコンポーネント一括削除モーダル
interface PurgeOldModalProps {
  onConfirm: (days: number) => void;
  onCancel: () => void;
}

function PurgeOldModal({ onConfirm, onCancel }: PurgeOldModalProps) {
  const [days, setDays] = useState('30');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1) {
      alert('1以上の数値を入力してください');
      return;
    }

    setLoading(true);
    onConfirm(daysNum);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            古いコンポーネント一括削除
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              何日前までの削除済みコンポーネントを完全削除しますか？
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="30"
              required
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              例: 30と入力すると、30日以前に削除されたコンポーネントが完全削除されます
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                  注意：この操作は取り消すことができません
                </h4>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  指定した日数以前に削除されたコンポーネントはデータベースから完全に削除され、復元できなくなります。
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '削除中...' : '完全削除する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
