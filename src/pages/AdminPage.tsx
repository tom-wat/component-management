// pages/AdminPage.tsx - 管理者ページメインコンポーネント
import { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  BarChart3, 
  Database,
  Calendar,
  ArrowLeft,
  RefreshCw,
  X,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi, AdminStats, DeletedComponent } from '../services/adminApi';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { isDevelopment, getEnvVar } from '../utils/env';
import { useModal } from '../hooks/useModal';

interface AdminPageState {
  stats: AdminStats | null;
  deletedComponents: DeletedComponent[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  showPurgeModal: boolean;
  showPurgeAllModal: boolean;
  showConfirmPurgeModal: boolean;
  selectedComponentForPurge: DeletedComponent | null;
  isAuthenticated: boolean;
}

interface AuthState {
  password: string;
  showPassword: boolean;
  isAuthenticating: boolean;
}

export function AdminPage() {
  const [state, setState] = useState<AdminPageState>({
    stats: null,
    deletedComponents: [],
    loading: false,
    error: null,
    refreshing: false,
    showPurgeModal: false,
    showPurgeAllModal: false,
    showConfirmPurgeModal: false,
    selectedComponentForPurge: null,
    isAuthenticated: isDevelopment(), // 開発環境では自動認証
  });

  const [authState, setAuthState] = useState<AuthState>({
    password: '',
    showPassword: false,
    isAuthenticating: false,
  });

  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setAuthState(prev => ({ ...prev, isAuthenticating: true }));
    
    try {
      // Cookie認証でログイン
      const result = await adminApi.login(authState.password);
      
      if (result.success) {
        setState(prev => ({ ...prev, isAuthenticated: true }));
        
        // 認証成功後にデータロード
        loadData();
        
        showSuccess('認証成功', result.message);
      } else {
        showError('認証エラー', result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '認証に失敗しました';
      showError('認証エラー', errorMessage);
    } finally {
      setAuthState(prev => ({ ...prev, isAuthenticating: false }));
    }
  };

  const loadData = useCallback(async (isRefresh = false) => {
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
  }, [showSuccess, showError]);

  // 初期化時の処理
  useEffect(() => {
    const initAuth = async () => {
      // 開発環境では環境変数から自動認証
      if (isDevelopment()) {
        const password = getEnvVar('VITE_ADMIN_PASSWORD');
        if (password) {
          const result = await adminApi.login(password);
          if (result.success) {
            setState(prev => ({ ...prev, isAuthenticated: true }));
            return;
          }
        }
      }

      // Cookie認証状態をチェック
      try {
        const authStatus = await adminApi.checkAuthStatus();
        if (authStatus.authenticated) {
          setState(prev => ({ ...prev, isAuthenticated: true }));
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
        // エラーの場合は認証状態をfalseのままにしておく
      }
    };

    initAuth();
  }, []);

  // 認証状態が変わった時のデータロード
  useEffect(() => {
    if (state.isAuthenticated) {
      loadData();
    }
  }, [state.isAuthenticated, loadData]);

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

  const handlePurge = (component: DeletedComponent) => {
    setState(prev => ({ 
      ...prev, 
      showConfirmPurgeModal: true,
      selectedComponentForPurge: component 
    }));
  };

  const handlePurgeConfirm = async () => {
    const component = state.selectedComponentForPurge;
    if (!component) return;

    setState(prev => ({ 
      ...prev, 
      showConfirmPurgeModal: false,
      selectedComponentForPurge: null 
    }));

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

  const handlePurgeCancel = () => {
    setState(prev => ({ 
      ...prev, 
      showConfirmPurgeModal: false,
      selectedComponentForPurge: null 
    }));
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

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 認証モーダル用のuseModal（ESCキーは無効化）
  useModal({
    isOpen: !state.isAuthenticated,
    onClose: () => {}, // 認証モーダルは背景クリックでは閉じない
    enableEscapeKey: false, // 認証モーダルはESCキーでは閉じない
    disableBodyScroll: true,
  });

  const renderAuthModal = () => {
    if (state.isAuthenticated) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md mx-4 transform transition-all duration-200 scale-100 opacity-100"
          onDragStart={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="text-center mb-8">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              管理者認証
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              パスワードを入力してください
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={authState.showPassword ? 'text' : 'password'}
                  value={authState.password}
                  onChange={(e) => setAuthState(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="パスワードを入力..."
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setAuthState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {authState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={authState.isAuthenticating || !authState.password.trim()}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {authState.isAuthenticating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  認証中...
                </>
              ) : (
                '認証'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← メインページに戻る
            </Link>
          </div>
        </div>
      </div>
    );
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                削除されたコンポーネント
              </h2>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:space-x-2">
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
                    className="flex flex-col md:flex-row gap-2 md:gap-0 md:items-center md:justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1 w-full md:w-auto">
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

                    <div className="flex items-start md:items-center md:justify-end space-x-2">
                      <button
                        onClick={() => handleRestore(component)}
                        className="flex items-center space-x-1 px-2 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>復元</span>
                      </button>
                      
                      <button
                        onClick={() => handlePurge(component)}
                        className="flex items-center space-x-1 px-2 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
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

      {/* 認証モーダル */}
      {renderAuthModal()}

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

      {/* 個別削除確認モーダル */}
      {state.showConfirmPurgeModal && state.selectedComponentForPurge && (
        <ConfirmPurgeModal
          component={state.selectedComponentForPurge}
          onConfirm={handlePurgeConfirm}
          onCancel={handlePurgeCancel}
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
  const { handleBackgroundClick } = useModal({
    isOpen: true,
    onClose: onCancel,
    enableEscapeKey: true,
    disableBodyScroll: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onConfirm();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackgroundClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 transform transition-all duration-200 scale-100 opacity-100"
        onDragStart={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
      >
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
              {loading ? '削除中...' : '完全削除する'}
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
  const { handleBackgroundClick } = useModal({
    isOpen: true,
    onClose: onCancel,
    enableEscapeKey: true,
    disableBodyScroll: true,
  });

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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackgroundClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 transform transition-all duration-200 scale-100 opacity-100"
        onDragStart={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
      >
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

// 個別削除確認モーダル
interface ConfirmPurgeModalProps {
  component: DeletedComponent;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmPurgeModal({ component, onConfirm, onCancel }: ConfirmPurgeModalProps) {
  const [loading, setLoading] = useState(false);
  const { handleBackgroundClick } = useModal({
    isOpen: true,
    onClose: onCancel,
    enableEscapeKey: true,
    disableBodyScroll: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onConfirm();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackgroundClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 transform transition-all duration-200 scale-100 opacity-100"
        onDragStart={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            完全削除の確認
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
              「<span className="font-semibold text-gray-900 dark:text-white">{component.name}</span>」を完全に削除しますか？
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
                  このコンポーネントはデータベースから完全に削除され、復元できなくなります。
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
              className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '削除中...' : '完全削除する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}