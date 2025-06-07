// pages/DebugPage.tsx - デバッグ・診断ページ
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { CloudComponentAPI } from '../services/cloudApi';
import { adminApi, AdminStats } from '../services/adminApi';
import { getConfig } from '../utils/env';
import { Component } from '../types';

// 診断結果の詳細情報用の型定義
interface HealthCheckResult {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
}

interface ComponentsResult {
  components: Component[];
  total: number;
  hasMore: boolean;
}

interface EnvDetails {
  environment: string;
  useCloud: boolean;
  allEnvVars: Record<string, unknown>;
}

interface CorsDetails {
  status: number;
  headers: Record<string, string>;
}

type DiagnosticDetails = 
  | string 
  | Error 
  | HealthCheckResult 
  | ComponentsResult 
  | AdminStats 
  | EnvDetails 
  | CorsDetails 
  | null 
  | undefined;

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: DiagnosticDetails;
}

export function DebugPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: DiagnosticResult[] = [];

    // 1. 環境変数チェック
    const config = getConfig();
    results.push({
      name: '環境変数設定',
      status: config.apiUrl ? 'success' : 'error',
      message: `API URL: ${config.apiUrl}`,
      details: {
        environment: config.environment,
        useCloud: config.useCloud,
        allEnvVars: import.meta.env
      } as EnvDetails
    });

    // 2. API接続テスト
    try {
      const api = new CloudComponentAPI(config.apiUrl);
      const healthResult = await api.healthCheck();
      results.push({
        name: 'API ヘルスチェック',
        status: 'success',
        message: `API接続成功 - ${healthResult.status}`,
        details: healthResult as HealthCheckResult
      });
    } catch (error) {
      results.push({
        name: 'API ヘルスチェック',
        status: 'error',
        message: `API接続失敗: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error instanceof Error ? error : String(error)
      });
    }

    // 3. コンポーネント取得テスト
    try {
      const api = new CloudComponentAPI(config.apiUrl);
      const componentsResult = await api.getComponents({ limit: 5 });
      results.push({
        name: 'コンポーネント取得',
        status: 'success',
        message: `${componentsResult.components.length}件のコンポーネントを取得`,
        details: componentsResult
      });
    } catch (error) {
      results.push({
        name: 'コンポーネント取得',
        status: 'error',
        message: `コンポーネント取得失敗: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error instanceof Error ? error : String(error)
      });
    }

    // 4. 管理者API テスト
    try {
      const statsResult = await adminApi.getAdminStats();
      results.push({
        name: '管理者API',
        status: 'success',
        message: '管理者API接続成功',
        details: statsResult
      });
    } catch (error) {
      results.push({
        name: '管理者API',
        status: 'error',
        message: `管理者API接続失敗: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error instanceof Error ? error : String(error)
      });
    }

    // 5. CORS チェック
    try {
      const response = await fetch(`${config.apiUrl}/api/health`, {
        method: 'OPTIONS'
      });
      results.push({
        name: 'CORS設定',
        status: response.ok ? 'success' : 'warning',
        message: `CORS プリフライト: ${response.status}`,
        details: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        } as CorsDetails
      });
    } catch (error) {
      results.push({
        name: 'CORS設定',
        status: 'error',
        message: `CORS チェック失敗: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error instanceof Error ? error : String(error)
      });
    }

    setDiagnostics(results);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  const formatDetails = (details: DiagnosticDetails): string => {
    if (typeof details === 'string') {
      return details;
    }
    if (details instanceof Error) {
      return details.message;
    }
    if (details === null || details === undefined) {
      return 'No details available';
    }
    return JSON.stringify(details, null, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>メインページに戻る</span>
              </Link>
            </div>
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>再診断</span>
            </button>
          </div>
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🔍 システム診断
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              API接続とシステム状態の確認
            </p>
          </div>
        </div>

        {/* 診断結果 */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-500">診断実行中...</p>
            </div>
          ) : (
            diagnostics.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-6 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start space-x-4">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {result.name}
                    </h3>
                    <p className="text-gray-700 mt-1">
                      {result.message}
                    </p>
                    
                    {result.details && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                          詳細情報
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                          {formatDetails(result.details)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* トラブルシューティング情報 */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🛠️ トラブルシューティング
          </h2>
          
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                API接続エラーが発生した場合:
              </h3>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>component-apiの開発サーバーが起動しているか確認してください</li>
                <li><code className="bg-gray-100 px-1 rounded">cd ../component-api && npm run dev</code></li>
                <li>ポート8787が使用されているか確認してください</li>
                <li>環境変数VITE_API_URLが正しく設定されているか確認してください</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                CORSエラーが発生した場合:
              </h3>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>component-apiのCORS設定を確認してください</li>
                <li>ブラウザの開発者ツールでネットワークタブを確認してください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
