// services/adminApi.ts - 管理者向けAPI呼び出しサービス
import { Component } from '../types';

// 環境変数からAPIのベースURLを取得
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export interface AdminStats {
  totalComponents: number;
  deletedComponents: number;
  recentDeleted: number;
  categoriesStats: Array<{
    category: string;
    total: number;
    active: number;
    deleted: number;
  }>;
}

export interface DeletedComponent extends Component {
  isDeleted: boolean;
}

class AdminApiService {
  private password: string | null = null;

  setPassword(password: string) {
    this.password = password;
  }

  // パスワードログイン
  async login(password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Cookieを含める
        body: JSON.stringify({ password })
      });

      const result = await response.json();

      if (response.ok) {
        this.password = password;
        return { success: true, message: result.message || 'Login successful' };
      } else {
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error during login' };
    }
  }

  // ログアウト
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      this.password = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // 認証状態確認
  async checkAuthStatus(): Promise<{ authenticated: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
        credentials: 'include'
      });
      
      return await response.json();
    } catch (error) {
      console.error('Auth status check error:', error);
      return { authenticated: false, message: 'Network error' };
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Cookie認証のみ使用（ヘッダー認証は削除）
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // 管理者統計情報取得
  async getAdminStats(): Promise<AdminStats> {
    const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
      headers: this.getHeaders(),
      credentials: 'include', // Cookieを含める
    });
    return this.handleResponse<AdminStats>(response);
  }

  // 削除されたコンポーネント一覧取得
  async getDeletedComponents(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    components: DeletedComponent[];
    total: number;
    hasMore: boolean;
  }> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE_URL}/api/admin/deleted-components?${searchParams}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // 全コンポーネント一覧取得（削除済み含む）
  async getAllComponents(params: {
    limit?: number;
    offset?: number;
    status?: 'active' | 'deleted' | 'all';
  } = {}): Promise<{
    components: Array<Component & { isDeleted: boolean }>;
    total: number;
    hasMore: boolean;
  }> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.status) searchParams.append('status', params.status);

    const response = await fetch(`${API_BASE_URL}/api/admin/all-components?${searchParams}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // コンポーネント復元
  async restoreComponent(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/admin/components/${id}/restore`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // コンポーネント完全削除
  async purgeComponent(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/admin/components/${id}/purge`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // 古いコンポーネント一括削除
  async purgeOldComponents(days: number): Promise<{
    message: string;
    deleted: number;
    deletedComponents: Array<{ id: string; name: string }>;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/admin/purge-old?days=${days}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // 互換性のためのsetApiKeyメソッド（非推奨）
  setApiKey(password: string) {
    this.setPassword(password);
  }
}

export const adminApi = new AdminApiService();
