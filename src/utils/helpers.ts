// src/utils/helpers.ts - クラウド専用版のヘルパー関数
import DOMPurify from 'dompurify';

/**
 * 一意のIDを生成
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * HTMLサニタイズ（DOMPurifyを使用したセキュアな実装）
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    // 許可するタグを明示的に指定
    ALLOWED_TAGS: [
      'div', 'span', 'p', 'a', 'strong', 'em', 'u', 'i', 'b',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'dl', 'dt', 'dd',
      'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'caption',
      'img', 'br', 'hr',
      'button', 'input', 'select', 'option', 'textarea', 'label', 'form', 'fieldset', 'legend',
      'section', 'article', 'header', 'footer', 'nav', 'main', 'aside',
      'figure', 'figcaption', 'blockquote', 'code', 'pre',
      'details', 'summary', 'dialog',
      'svg', 'path', 'circle', 'rect', 'line', 'ellipse', 'polygon', 'polyline', 'g', 'defs', 'use', 'symbol',
      'text', 'tspan', 'textPath', 'marker', 'pattern', 'clipPath', 'mask', 'linearGradient', 'radialGradient', 'stop',
      'canvas', 'video', 'audio', 'source', 'track'
    ],
    // 許可する属性を明示的に指定
    ALLOWED_ATTR: [
      'id', 'class', 'style', 'title', 'alt', 'src', 'href', 'target',
      'width', 'height', 'type', 'name', 'value', 'placeholder',
      'role', 'aria-label', 'aria-describedby', 'data-*',
      // SVG関連の属性
      'viewBox', 'xmlns', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
      'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
      'transform', 'opacity', 'fill-opacity', 'stroke-opacity',
      'points', 'gradientUnits', 'gradientTransform', 'offset', 'stop-color', 'stop-opacity',
      // video/audio関連
      'controls', 'autoplay', 'loop', 'muted', 'preload', 'poster',
      // form関連
      'for', 'required', 'disabled', 'readonly', 'checked', 'selected',
      // details/summary関連
      'open'
    ],
    // 危険な要素を完全に除去
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'applet', 'meta', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    // URLスキームの制限
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // その他のセキュリティ設定
    KEEP_CONTENT: true, // 危険なタグの中身は保持
    RETURN_DOM: false,  // 文字列として返す
    RETURN_DOM_FRAGMENT: false,
    SANITIZE_DOM: true  // DOM操作も安全化
  });
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
