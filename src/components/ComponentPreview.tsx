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
        // シンプルな変数リネーミング方式
        const setupContent = () => {
          const sanitizedHtml = sanitizeHtml(html);
          
          // 最もシンプルな解決策：IIFEでスコープ分離のみ
          const suffix = componentId || Math.random().toString(36).substring(2, 8);
          
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
                  try {
                    // JavaScriptコードの基本的な構文チェックと修正
                    let jsCode = \`${js.replace(/`/g, '\\`')}\`;
                    
                    // 一般的な構文エラーを修正
                    const docPattern = new RegExp('document\\\\.\\\\(', 'g');
                    const listenerPattern = new RegExp('addEventListener\\\\("([^"]+)"\\\\s*,\\\\s*\\\\)\\\\s*{', 'g');
                    
                    // より安全な変数名一意化
                    function makeVariablesUnique(code, componentId) {
                      // DOM APIや予約語は変換しない
                      const reservedWords = new Set([
                        'document', 'window', 'console', 'setTimeout', 'setInterval', 
                        'clearTimeout', 'clearInterval', 'alert', 'confirm', 'prompt',
                        'addEventListener', 'removeEventListener', 'getElementById', 
                        'querySelector', 'querySelectorAll', 'createElement',
                        'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean',
                        'Math', 'Date', 'RegExp', 'Error', 'style', 'classList'
                      ]);
                      
                      // セミコロンで分割して1つずつ処理
                      const statements = code.split(';');
                      
                      return statements.map(statement => {
                        let trimmed = statement.trim();
                        if (!trimmed) return trimmed;
                        
                        // 変数宣言のみ一意化（最も安全）
                        const varDeclMatch = trimmed.match(/^(const|let|var)\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*=/);
                        if (varDeclMatch) {
                          const [, keyword, varName] = varDeclMatch;
                          if (!reservedWords.has(varName)) {
                            return trimmed.replace(varName, \`\${varName}_\${componentId}\`);
                          }
                        }
                        
                        return trimmed;
                      }).join('; ');
                    }
                    
                    jsCode = jsCode
                      .replace(docPattern, 'document.addEventListener(') // document.( を修正
                      .replace(listenerPattern, 'addEventListener("$1", function() {') // 不完全なaddEventListenerを修正
                    
                    // 変数名を一意化（コンポーネントIDを付加）
                    jsCode = makeVariablesUnique(jsCode, '${suffix}');
                    
                    console.log('Executing corrected JS:', jsCode);
                    
                    if (jsCode && jsCode.trim()) {
                      // Function constructorで実行
                      const executeFunction = new Function(jsCode);
                      executeFunction();
                    }
                  } catch (error) {
                    console.error('JavaScript execution error:', error);
                    document.body.insertAdjacentHTML('beforeend', 
                      '<div style="background: #fee; border: 1px solid #fcc; color: #c33; padding: 8px; margin: 8px 0; border-radius: 4px; font-size: 12px;">JavaScript Error: ' + error.message + '</div>'
                    );
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

        // すぐに実行（Blob URLは非同期で処理される）
        setupContent();
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
