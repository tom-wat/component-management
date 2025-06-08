// src/services/cloudApi.ts
import { Component, ComponentFormData } from '../types';
import { encodeComponentForStorage, decodeComponentForDisplay } from '../utils/codeFormat';

export interface CloudApiResponse<T> {
  data?: T;
  error?: string;
}

// API レスポンス用の型定義
interface ComponentApiResponse {
  id: string;
  name: string;
  category: string;
  html: string;
  css: string;
  js: string;
  tags: string[];
  author: string;
  createdAt: string; // API からは文字列として返される
  updatedAt: string; // API からは文字列として返される
}

interface ComponentsListResponse {
  components: ComponentApiResponse[];
  total: number;
  hasMore: boolean;
}

export class CloudComponentAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // 末尾のスラッシュを削除
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-App-Name': 'component-management',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { 
        ...options, 
        headers,
        credentials: 'include' // Cookieセッション対応
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  async getComponents(filters?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ components: Component[]; total: number; hasMore: boolean }> {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `/api/components${queryString ? `?${queryString}` : ''}`;
    
    const result = await this.request<ComponentsListResponse>(endpoint);
    
    // 日付をDateオブジェクトに変換し、コードをデコード
    const components = result.components.map(comp => {
      // デバッグ用：取得したコンポーネントデータをログ出力
      console.log(`CloudApi getComponents - raw component ${comp.name}:`, {
        html: { length: comp.html?.length || 0, hasNewlines: comp.html?.includes('\n') || false, hasEscaped: comp.html?.includes('\\n') || false },
        css: { length: comp.css?.length || 0, hasNewlines: comp.css?.includes('\n') || false, hasEscaped: comp.css?.includes('\\n') || false },
        js: { length: comp.js?.length || 0, hasNewlines: comp.js?.includes('\n') || false, hasEscaped: comp.js?.includes('\\n') || false }
      });
      
      // コードをデコードして改行を復元
      const decodedComponent = decodeComponentForDisplay({
        ...comp,
        createdAt: new Date(comp.createdAt),
        updatedAt: new Date(comp.updatedAt),
        tags: Array.isArray(comp.tags) ? comp.tags : []
      }) as Component;
      
      // デバッグ用：デコード後のデータをログ出力
      console.log(`CloudApi getComponents - decoded component ${comp.name}:`, {
        html: { length: decodedComponent.html?.length || 0, hasNewlines: decodedComponent.html?.includes('\n') || false },
        css: { length: decodedComponent.css?.length || 0, hasNewlines: decodedComponent.css?.includes('\n') || false },
        js: { length: decodedComponent.js?.length || 0, hasNewlines: decodedComponent.js?.includes('\n') || false }
      });
      
      return decodedComponent;
    });
    
    return {
      ...result,
      components
    };
  }

  async getComponent(id: string): Promise<Component> {
    const result = await this.request<ComponentApiResponse>(`/api/components/${id}`);
    
    // 日付をDateオブジェクトに変換し、コードをデコード
    return decodeComponentForDisplay({
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
      tags: Array.isArray(result.tags) ? result.tags : []
    }) as Component;
  }

  async createComponent(data: ComponentFormData): Promise<{ id: string; message: string }> {
    // tagsを文字列から配列に変換
    const tags = typeof data.tags === 'string' 
      ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    // コードの改行文字をエスケープして保存
    const encodedComponent = encodeComponentForStorage({
      name: data.name,
      category: data.category,
      html: data.html,
      css: data.css,
      js: data.js,
      tags: tags,
    });

    return this.request<{ id: string; message: string }>('/api/components', {
      method: 'POST',
      body: JSON.stringify(encodedComponent),
    });
  }

  async updateComponent(id: string, data: ComponentFormData): Promise<{ message: string }> {
    // tagsを文字列から配列に変換
    const tags = typeof data.tags === 'string' 
      ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    // コードの改行文字をエスケープして保存
    const encodedComponent = encodeComponentForStorage({
      name: data.name,
      category: data.category,
      html: data.html,
      css: data.css,
      js: data.js,
      tags: tags,
    });

    // デバッグ用：送信するペイロードをログ出力
    console.log('CloudApi updateComponent - encoded payload:', {
      html: { length: encodedComponent.html.length, hasNewlines: encodedComponent.html.includes('\n'), hasEscaped: encodedComponent.html.includes('\\n') },
      css: { length: encodedComponent.css.length, hasNewlines: encodedComponent.css.includes('\n'), hasEscaped: encodedComponent.css.includes('\\n') },
      js: { length: encodedComponent.js.length, hasNewlines: encodedComponent.js.includes('\n'), hasEscaped: encodedComponent.js.includes('\\n') }
    });

    return this.request<{ message: string }>(`/api/components/${id}`, {
      method: 'PUT',
      body: JSON.stringify(encodedComponent),
    });
  }

  async deleteComponent(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/components/${id}`, {
      method: 'DELETE',
    });
  }

  async getStats(): Promise<{
    totalComponents: number;
    recentComponents: number;
    categories: Array<{ category: string; count: number }>;
  }> {
    return this.request<{
      totalComponents: number;
      recentComponents: number;
      categories: Array<{ category: string; count: number }>;
    }>('/api/stats');
  }

  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    version: string;
    environment: string;
  }> {
    return this.request<{
      status: string;
      timestamp: string;
      version: string;
      environment: string;
    }>('/api/health');
  }
}