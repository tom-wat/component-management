import React, { useRef, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { sanitizeHtml } from '../utils/helpers';

interface ComponentPreviewProps {
  html: string;
  css: string;
  js: string;
  isModal?: boolean; // モーダル内での表示かどうか
  isDarkMode?: boolean; // 親のダークモード状態
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({ 
  html, 
  css, 
  js,
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
    const updatePreview = () => {
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        
        // iframeが読み込まれるのを待つ
        const setupContent = () => {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          
          if (iframeDoc) {
            const sanitizedHtml = sanitizeHtml(html);
            
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
                  <script>
                    (function() {
                      try {
                        ${js}
                      } catch (error) {
                        console.error('JavaScript execution error:', error);
                        document.body.insertAdjacentHTML('beforeend', 
                          '<div style="background: #fee; border: 1px solid #fcc; color: #c33; padding: 8px; margin: 8px 0; border-radius: 4px; font-size: 12px;">JavaScript Error: ' + error.message + '</div>'
                        );
                      }
                    })();
                  </script>
                </body>
              </html>
            `;
            
            try {
              iframeDoc.open();
              iframeDoc.write(content);
              iframeDoc.close();
            } catch (error) {
              console.error('Failed to write to iframe:', error);
            }
          }
        };

        // iframeが既に読み込まれている場合はすぐに実行
        if (iframe.contentDocument?.readyState === 'complete') {
          setupContent();
        } else {
          // 読み込み完了を待つ
          iframe.onload = () => setupContent();
        }
      }
    };

    // 少し遅延させてiframeの準備を確実にする
    const timeoutId = setTimeout(updatePreview, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [html, css, js, useDarkBackground]);

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
