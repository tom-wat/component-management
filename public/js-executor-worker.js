// Web Worker for safe JavaScript execution
// DOM access is completely blocked in Web Workers

// 許可する安全なグローバル関数のリスト
const SAFE_GLOBALS = {
  console: {
    log: (...args) => console.log(...args),
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args),
    info: (...args) => console.info(...args)
  },
  setTimeout: (fn, delay) => setTimeout(fn, delay),
  clearTimeout: (id) => clearTimeout(id),
  setInterval: (fn, delay) => setInterval(fn, delay),
  clearInterval: (id) => clearInterval(id),
  Math: Math,
  Date: Date,
  JSON: JSON,
  Array: Array,
  Object: Object,
  String: String,
  Number: Number,
  Boolean: Boolean,
  RegExp: RegExp
};

// 危険な関数・オブジェクトを無効化
const BLOCKED_GLOBALS = [
  'eval', 'Function', 'XMLHttpRequest', 'fetch', 'importScripts',
  'postMessage', 'close', 'navigator', 'location', 'history'
];

// 実行結果を保存するグローバル変数
let executionResult = null;
let executionError = null;

// メッセージ受信時の処理
self.addEventListener('message', (event) => {
  const { code, id, timeout = 5000 } = event.data;
  
  // 実行結果をリセット
  executionResult = null;
  executionError = null;
  
  // タイムアウト設定
  const timeoutId = setTimeout(() => {
    self.postMessage({
      id,
      success: false,
      error: 'Code execution timeout (5s)',
      type: 'timeout'
    });
  }, timeout);
  
  try {
    // 危険な関数をブロック
    BLOCKED_GLOBALS.forEach(name => {
      if (typeof self[name] !== 'undefined') {
        Object.defineProperty(self, name, {
          value: () => {
            throw new Error(`${name} is not allowed in sandboxed environment`);
          },
          writable: false,
          configurable: false
        });
      }
    });
    
    // 安全なグローバル関数を設定
    Object.keys(SAFE_GLOBALS).forEach(name => {
      self[name] = SAFE_GLOBALS[name];
    });
    
    // DOM操作用のモックオブジェクトを作成
    const mockDocument = {
      getElementById: (id) => ({ 
        textContent: '',
        innerHTML: '',
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {}
      }),
      querySelector: (selector) => mockDocument.getElementById('mock'),
      querySelectorAll: (selector) => [mockDocument.getElementById('mock')],
      createElement: (tag) => ({
        textContent: '',
        innerHTML: '',
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
        appendChild: () => {},
        removeChild: () => {}
      }),
      addEventListener: () => {},
      removeEventListener: () => {}
    };
    
    // documentオブジェクトのモック
    self.document = mockDocument;
    
    // windowオブジェクトのモック
    self.window = {
      addEventListener: () => {},
      removeEventListener: () => {},
      setTimeout: self.setTimeout,
      clearTimeout: self.clearTimeout,
      setInterval: self.setInterval,
      clearInterval: self.clearInterval,
      console: self.console
    };
    
    // コードを実行
    // Function constructorの代わりにeval()を使用（Web Worker内では比較的安全）
    const result = eval(`
      (function() {
        "use strict";
        ${code}
      })()
    `);
    
    clearTimeout(timeoutId);
    
    // 成功時のレスポンス
    self.postMessage({
      id,
      success: true,
      result: result,
      type: 'success'
    });
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    // エラー時のレスポンス
    self.postMessage({
      id,
      success: false,
      error: error.message,
      stack: error.stack,
      type: 'error'
    });
  }
});

// エラーハンドリング
self.addEventListener('error', (event) => {
  self.postMessage({
    success: false,
    error: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    type: 'worker_error'
  });
});