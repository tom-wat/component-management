import React, { useRef, useEffect } from 'react';
import { sanitizeHtml } from '../utils/storage';

interface ComponentPreviewProps {
  html: string;
  css: string;
  js: string;
  isModal?: boolean; // モーダル内での表示かどうか
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({ 
  html, 
  css, 
  js,
  isModal = false
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
                      color: #333;
                      background: #fff;
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
  }, [html, css, js]);

  return (
    <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <span className="text-sm font-medium text-gray-700">プレビュー</span>
      </div>
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
        style={{ 
          minHeight: isModal ? '0' : '300px',
          backgroundColor: '#fff'
        }}
        title="Component Preview"
      />
    </div>
  );
};
