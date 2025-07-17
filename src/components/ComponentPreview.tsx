import React, { useRef, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { sanitizeHtml } from '../utils/helpers';

interface ComponentPreviewProps {
  html: string;
  css: string;
  js: string;
  componentId?: string; // コンポーネントの一意ID
  isModal?: boolean; // モーダル内での表示かどうか
  isDarkMode?: boolean; // 親のダークモード状態
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({ 
  html, 
  css, 
  js,
  componentId,
  isModal = false,
  isDarkMode = false
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [useDarkBackground, setUseDarkBackground] = useState(isDarkMode);

  // 親のダークモード状態が変更されたら自動で同期
  useEffect(() => {
    setUseDarkBackground(isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const iframe = iframeRef.current;
    
    const updatePreview = () => {
      if (iframe) {
        // Web Worker経由でJavaScriptを安全に実行
        const setupContent = async () => {
          const sanitizedHtml = sanitizeHtml(html);
          
          // 最もシンプルな解決策：IIFEでスコープ分離のみ
          const suffix = componentId || Math.random().toString(36).substring(2, 8);
          
          // 安全なJavaScript実行関数（シンプル版）
          const executeJavaScriptSafely = async (code: string) => {
            try {
              // 基本的な安全性チェック
              if (code.includes('XMLHttpRequest') || code.includes('fetch') || code.includes('import')) {
                throw new Error('Code contains potentially dangerous network functions');
              }
              
              // 制限された環境で実行
              const mockDocument = {
                getElementById: (_id: any) => ({ 
                  textContent: '', 
                  innerHTML: '', 
                  style: {},
                  addEventListener: () => {},
                  removeEventListener: () => {},
                  click: () => {},
                  focus: () => {},
                  blur: () => {}
                }),
                querySelector: (_selector: any) => mockDocument.getElementById('mock'),
                querySelectorAll: (_selector: any) => [mockDocument.getElementById('mock')],
                createElement: (_tag: any) => mockDocument.getElementById('mock'),
                addEventListener: () => {},
                removeEventListener: () => {},
                body: {
                  appendChild: () => {},
                  removeChild: () => {},
                  insertAdjacentHTML: () => {}
                }
              };
              
              const safeWindow = {
                console: { 
                  log: (...args: any[]) => console.log(...args),
                  error: (...args: any[]) => console.error(...args),
                  warn: (...args: any[]) => console.warn(...args)
                },
                Math: Math, 
                Date: Date, 
                JSON: JSON,
                setTimeout: (fn: any, delay: any) => setTimeout(fn, delay),
                clearTimeout: (id: any) => clearTimeout(id),
                setInterval: (fn: any, delay: any) => setInterval(fn, delay),
                clearInterval: (id: any) => clearInterval(id),
                document: mockDocument,
                alert: (msg: any) => console.log('Alert:', msg),
                confirm: (msg: any) => { console.log('Confirm:', msg); return true; },
                prompt: (msg: any) => { console.log('Prompt:', msg); return ''; }
              };
              
              // タイムアウト付きでコードを実行
              return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                  reject(new Error('Code execution timeout (3s)'));
                }, 3000);
                
                try {
                  const func = new Function(
                    'window',
                    'document', 
                    'console',
                    'Math',
                    'Date',
                    'JSON',
                    'setTimeout',
                    'clearTimeout',
                    'setInterval',
                    'clearInterval',
                    'alert',
                    'confirm',
                    'prompt',
                    '"use strict"; ' + code
                  );
                  
                  const result = func(
                    safeWindow,
                    mockDocument,
                    safeWindow.console,
                    Math,
                    Date,
                    JSON,
                    safeWindow.setTimeout,
                    safeWindow.clearTimeout,
                    safeWindow.setInterval,
                    safeWindow.clearInterval,
                    safeWindow.alert,
                    safeWindow.confirm,
                    safeWindow.prompt
                  );
                  
                  clearTimeout(timeoutId);
                  resolve(result);
                } catch (error) {
                  clearTimeout(timeoutId);
                  reject(error);
                }
              });
            } catch (error) {
              console.error('Safe JavaScript execution error:', error);
              // エラーをUIに安全に表示
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              const errorDiv = document.createElement('div');
              errorDiv.style.cssText = 'background: #fee; border: 1px solid #fcc; color: #c33; padding: 8px; margin: 8px 0; border-radius: 4px; font-size: 12px;';
              errorDiv.textContent = 'JavaScript Error: ' + errorMessage;
              document.body.appendChild(errorDiv);
              throw error;
            }
          };
          
          const content = `
            <!DOCTYPE html>
            <html lang="ja">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Component Preview</title>
                <style>
                  * {
                    box-sizing: border-box;
                  }
                  body {
                    margin: 0;
                    padding: 16px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                    line-height: 1.5;
                    background: ${useDarkBackground ? '#1f2937' : '#fff'};
                    color: ${useDarkBackground ? '#f9fafb' : '#333'};
                    transition: background-color 0.2s, color 0.2s;
                  }
                  ${css}
                </style>
              </head>
              <body>
                ${sanitizedHtml}
                <script data-component-id="${suffix}">
                  // Web Worker経由でJavaScriptを安全に実行する関数を作成
                  window.executeJavaScriptSafely = ${executeJavaScriptSafely.toString()};
                  
                  try {
                    // バッククォートエスケープ（テンプレートリテラル衝突防止）
                    let jsCode = \`${js.replace(/`/g, '\\`')}\`;
                    
                    // IIFEでスコープを完全分離
                    function wrapWithIIFE(code, componentId) {
                      if (!code || !code.trim()) return code;
                      
                      try {
                        // IIFEでラップして完全にスコープ分離
                        return \`(function() {
  try {
    \${code}
  } catch (error) {
    console.error('Component JavaScript error:', error);
  }
})();\`;
                      } catch (error) {
                        console.error('Error in wrapWithIIFE:', error);
                        return code;
                      }
                    }
                    
                    // IIFEでスコープを分離
                    jsCode = wrapWithIIFE(jsCode, '${suffix}');
                    
                    if (jsCode && jsCode.trim()) {
                      // Web Worker経由でJavaScriptを安全に実行
                      window.executeJavaScriptSafely(jsCode);
                    }
                  } catch (error) {
                    console.error('JavaScript execution error:', error);
                    // エラーをUIに安全に表示
                    const errorDiv = document.createElement('div');
                    errorDiv.style.cssText = 'background: #fee; border: 1px solid #fcc; color: #c33; padding: 8px; margin: 8px 0; border-radius: 4px; font-size: 12px;';
                    errorDiv.textContent = 'JavaScript Error: ' + error.message;
                    document.body.appendChild(errorDiv);
                  }
                </script>
              </body>
            </html>
          `;
          
          try {
            // 前回のBlob URLがあれば解放
            if (iframe.dataset.blobUrl) {
              URL.revokeObjectURL(iframe.dataset.blobUrl);
            }
            
            // 新しいBlob URLを作成
            const blob = new Blob([content], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);
            
            // Blob URLをデータ属性に保存（後で解放するため）
            iframe.dataset.blobUrl = blobUrl;
            
            // iframeのsrcにBlob URLを設定
            iframe.src = blobUrl;
            
            // ロード完了後にBlob URLを解放
            iframe.onload = () => {
              setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
                delete iframe.dataset.blobUrl;
              }, 100);
            };
          } catch (error) {
            console.error('Failed to create blob URL:', error);
          }
        };

        // 非同期でコンテンツを設定
        setupContent().catch(error => {
          console.error('Failed to setup content:', error);
        });
      }
    };

    // 少し遅延させてiframeの準備を確実にする
    const timeoutId = setTimeout(updatePreview, 100);
    
    return () => {
      clearTimeout(timeoutId);
      // コンポーネントがアンマウントされる時にBlob URLをクリーンアップ
      if (iframe?.dataset.blobUrl) {
        URL.revokeObjectURL(iframe.dataset.blobUrl);
        delete iframe.dataset.blobUrl;
      }
    };
  }, [html, css, js, componentId, useDarkBackground]);

  return (
    <div className="w-full h-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-200">
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">プレビュー</span>
        <button
          type="button"
          onClick={() => setUseDarkBackground(!useDarkBackground)}
          className="inline-flex items-center justify-center p-1 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          title={useDarkBackground ? 'ライトモードで表示' : 'ダークモードで表示'}
        >
          {useDarkBackground ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>
      </div>
      <iframe
        ref={iframeRef}
        className="w-full border-0"
        sandbox="allow-scripts allow-same-origin"
        style={{ 
          minHeight: isModal ? '400px' : '300px',
          height: isModal ? 'calc(100% - 48px)' : 'auto', // ヘッダー部分（48px）を差し引いた高さ
          backgroundColor: useDarkBackground ? '#1f2937' : '#fff'
        }}
        title="Component Preview"
      />
    </div>
  );
};
