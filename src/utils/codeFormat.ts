/**
 * コードフォーマット用のユーティリティ関数
 */

// データベース保存用：改行文字をエスケープ
export const encodeCodeForStorage = (code: string): string => {
  if (!code) return '';
  return code
    .replace(/\r\n/g, '\\n')  // Windows改行
    .replace(/\n/g, '\\n')    // Unix改行
    .replace(/\r/g, '\\n');   // 古いMac改行
};

// 表示用：エスケープされた改行文字を復元
export const decodeCodeForDisplay = (code: string): string => {
  if (!code) return '';
  return code
    .replace(/\\n/g, '\n');   // エスケープされた改行を実際の改行に復元
};

// コンポーネントデータ全体の変換
export const encodeComponentForStorage = (component: {
  html: string;
  css: string;
  js: string;
  [key: string]: unknown;
}) => ({
  ...component,
  html: encodeCodeForStorage(component.html),
  css: encodeCodeForStorage(component.css),
  js: encodeCodeForStorage(component.js),
});

export const decodeComponentForDisplay = (component: {
  html: string;
  css: string;
  js: string;
  [key: string]: unknown;
}) => ({
  ...component,
  html: decodeCodeForDisplay(component.html),
  css: decodeCodeForDisplay(component.css),
  js: decodeCodeForDisplay(component.js),
});