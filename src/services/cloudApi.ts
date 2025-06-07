// src/services/cloudApi.ts
import { Component, ComponentFormData } from '../types';

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
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
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
    
    // 日付をDateオブジェクトに変換
    const components = result.components.map(comp => ({
      ...comp,
      createdAt: new Date(comp.createdAt),
      updatedAt: new Date(comp.updatedAt),
      tags: Array.isArray(comp.tags) ? comp.tags : []
    }));
    
    return {
      ...result,
      components
    };
  }

  async getComponent(id: string): Promise<Component> {
    const result = await this.request<ComponentApiResponse>(`/api/components/${id}`);
    
    // 日付をDateオブジェクトに変換
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
      tags: Array.isArray(result.tags) ? result.tags : []
    };
  }

  async createComponent(data: ComponentFormData): Promise<{ id: string; message: string }> {
    // tagsを文字列から配列に変換
    const tags = typeof data.tags === 'string' 
      ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    const payload = {
      name: data.name,
      category: data.category,
      html: data.html,
      css: data.css,
      js: data.js,
      tags: tags,
    };

    return this.request<{ id: string; message: string }>('/api/components', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateComponent(id: string, data: ComponentFormData): Promise<{ message: string }> {
    // tagsを文字列から配列に変換
    const tags = typeof data.tags === 'string' 
      ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    const payload = {
      name: data.name,
      category: data.category,
      html: data.html,
      css: data.css,
      js: data.js,
      tags: tags,
    };

    return this.request<{ message: string }>(`/api/components/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
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