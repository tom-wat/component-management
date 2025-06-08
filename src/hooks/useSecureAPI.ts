// src/hooks/useSecureAPI.ts
import { useState, useCallback } from 'react';
import { authService } from '../services/authService';

interface APIError extends Error {
  status: number;
  code?: string;
}

export function useSecureAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async <T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.makeRequest(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        const apiError = new Error(errorData.error || 'API request failed') as APIError;
        apiError.status = response.status;
        apiError.code = errorData.code;
        throw apiError;
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // 認証エラーの場合は自動ログアウト
      if (err instanceof Error && 'status' in err && (err as APIError).status === 401) {
        await authService.logout();
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 便利メソッド
  const get = useCallback(<T>(url: string) => 
    apiCall<T>(url, { method: 'GET' }), [apiCall]
  );

  const post = useCallback(<T>(url: string, data: unknown) =>
    apiCall<T>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }), [apiCall]
  );

  const put = useCallback(<T>(url: string, data: unknown) =>
    apiCall<T>(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }), [apiCall]
  );

  const del = useCallback(<T>(url: string) =>
    apiCall<T>(url, { method: 'DELETE' }), [apiCall]
  );

  return {
    loading,
    error,
    apiCall,
    get,
    post,
    put,
    delete: del
  };
}