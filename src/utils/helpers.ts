// src/utils/helpers.ts - クラウド専用版のヘルパー関数

/**
 * 一意のIDを生成
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * HTMLサニタイズ（基本的なXSS対策）
 */
export const sanitizeHtml = (html: string): string => {
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

/**
 * クリップボードにテキストをコピー
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
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

/**
 * プレビューコンテンツの安全性チェック
 */
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

/**
 * ファイルダウンロード用のヘルパー
 */
export const downloadFile = (content: string, filename: string, mimeType: string = 'application/json') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * オンライン状態の監視フック用ヘルパー
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * 日付フォーマット（安全版）
 */
export const formatDate = (date: Date | string): string => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // 無効な日付をチェック
    if (isNaN(dateObj.getTime())) {
      return '不明な日付';
    }
    
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '日付エラー';
  }
};

/**
 * 簡単な日付フォーマット（年月日のみ）
 */
export const formatDateSimple = (date: Date | string): string => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // 無効な日付をチェック
    if (isNaN(dateObj.getTime())) {
      return '不明';
    }
    
    return dateObj.toLocaleDateString('ja-JP');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '不明';
  }
};

/**
 * タグ文字列を配列に変換
 */
export const parseTags = (tagString: string): string[] => {
  return tagString
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);
};

/**
 * 配列をタグ文字列に変換
 */
export const stringifyTags = (tags: string[]): string => {
  return tags.join(', ');
};
