import { Component } from '../types';

const STORAGE_KEY = 'component-management-data';

export const storage = {
  // ローカルストレージからコンポーネントを読み込み
  getComponents(): Component[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return parsed.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load components:', error);
      return [];
    }
  },

  // ローカルストレージにコンポーネントを保存
  saveComponents(components: Component[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(components));
    } catch (error) {
      console.error('Failed to save components:', error);
    }
  },

  // JSONファイルとしてエクスポート
  exportComponents(components: Component[]): void {
    const dataStr = JSON.stringify(components, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `components-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // JSONファイルからインポート
  importComponents(file: File): Promise<Component[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const imported = JSON.parse(content);
          const components = imported.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          }));
          resolve(components);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const sanitizeHtml = (html: string): string => {
  // 基本的なHTMLサニタイズ（本格的な場合はDOMPurifyなどを使用）
  // 危険なスクリプトタグとイベントハンドラーを除去
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>/gi, '')
    .replace(/<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '');
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // フォールバック
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
};

// デバッグ用：プレビューエラーをチェックする関数
export const checkPreviewContent = (html: string, css: string, js: string) => {
  const issues = [];
  
  if (html.includes('<script')) {
    issues.push('HTMLにscriptタグが含まれています');
  }
  
  if (css.includes('@import')) {
    issues.push('CSSに@importが含まれています');
  }
  
  if (js.includes('document.write')) {
    issues.push('JavaScriptにdocument.writeが含まれています');
  }
  
  return issues;
};
