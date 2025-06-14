// src/services/cloudApi.ts
import { 
  Component, 
  ComponentFormData, 
  ComponentApiResponse, 
  ComponentsListResponse, 
  ApiResponse 
} from '../types';
import { encodeComponentForStorage, decodeComponentForDisplay } from '../utils/codeFormat';
import { ApiClient } from './apiClient';

export class CloudComponentAPI {
  private apiClient: ApiClient;

  constructor(baseUrl: string) {
    this.apiClient = new ApiClient(baseUrl);
  }

  async getComponents(filters?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ components: Component[]; total: number; hasMore: boolean }> {
    const params: Record<string, string> = {};
    
    if (filters?.category) params.category = filters.category;
    if (filters?.search) params.search = filters.search;
    if (filters?.limit) params.limit = filters.limit.toString();
    if (filters?.offset) params.offset = filters.offset.toString();
    
    const response = await this.apiClient.get<ComponentsListResponse>('/api/components', params);
    const result = response.data!;
    
    // 日付をDateオブジェクトに変換し、コードをデコード
    const components = result.components.map(comp => {
      return decodeComponentForDisplay({
        ...comp,
        createdAt: new Date(comp.createdAt),
        updatedAt: new Date(comp.updatedAt),
        tags: Array.isArray(comp.tags) ? comp.tags : []
      }) as Component;
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