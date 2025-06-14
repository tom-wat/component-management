// src/utils/env.ts - クラウド専用版
/**
 * 環境変数を安全に取得するユーティリティ関数
 * ViteとCreate React Appの両方に対応
 */

// Window オブジェクトの拡張
declare global {
  interface Window {
    env?: Record<string, string>;
  }
}

export const getEnvVar = (key: string): string | undefined => {
  // ブラウザ環境での window.env チェック（カスタム設定用）
  if (typeof window !== 'undefined' && window.env) {
    return window.env[key];
  }

  // Viteの環境変数（VITE_プレフィックス）
  if (import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }

  // Create React App互換（REACT_APP_プレフィックス）
  const reactAppKey = key.replace('VITE_', 'REACT_APP_');
  if (import.meta.env && import.meta.env[reactAppKey]) {
    return import.meta.env[reactAppKey];
  }

  return undefined;
};

/**
 * アプリケーション設定の取得（クラウド専用版）
 */
export const getConfig = () => {
  return {
    apiUrl: getEnvVar('VITE_API_URL') || '',
    environment: getEnvVar('VITE_ENVIRONMENT') || 'development',
    // クラウド専用なので常にtrue
    useCloud: true,
  };
};

/**
 * 開発環境かどうかの判定
 */
export const isDevelopment = () => {
  return getConfig().environment === 'development';
};

/**
 * 本番環境かどうかの判定
 */
export const isProduction = () => {
  return getConfig().environment === 'production';
};
