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
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // 管理者統計情報取得
  async getAdminStats(): Promise<AdminStats> {
    const response = await fetch(`${API_BASE_URL}/api/admin/stats`);
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

    const response = await fetch(`${API_BASE_URL}/api/admin/deleted-components?${searchParams}`);
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

    const response = await fetch(`${API_BASE_URL}/api/admin/all-components?${searchParams}`);
    return this.handleResponse(response);
  }

  // コンポーネント復元
  async restoreComponent(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/admin/components/${id}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse(response);
  }

  // コンポーネント完全削除
  async purgeComponent(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/admin/components/${id}/purge`, {
      method: 'DELETE',
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
    });
    return this.handleResponse(response);
  }
}

export const adminApi = new AdminApiService();
