import React from 'react';
import { Copy } from 'lucide-react';
import { copyToClipboard } from '../utils/helpers';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { indentUnit } from '@codemirror/language';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'html' | 'css' | 'javascript';
  placeholder?: string;
  isDarkMode?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  placeholder = '',
  isDarkMode = false,
}) => {
  const [copied, setCopied] = React.useState(false);
  

  const handleCopy = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getLanguageLabel = () => {
    switch (language) {
      case 'html': return 'HTML';
      case 'css': return 'CSS';
      case 'javascript': return 'JavaScript';
      default: return 'CODE';
    }
  };

  const getLanguageExtension = () => {
    const extensions = [];
    
    // 言語サポート
    switch (language) {
      case 'html': 
        extensions.push(html());
        break;
      case 'css': 
        extensions.push(css());
        break;
      case 'javascript': 
        extensions.push(javascript());
        break;
    }
    
    // インデントとエディタ設定
    extensions.push(
      indentUnit.of("  "), // 2スペースインデント
      EditorView.theme({
        '&': {
          fontSize: '14px',
          fontFamily: 'Monaco, Menlo, Ubuntu Mono, Consolas, Courier New, monospace',
        },
        '.cm-content': {
          padding: '16px',
          whiteSpace: 'pre-wrap !important',
          overflowWrap: 'normal',
          wordBreak: 'normal',
          tabSize: '2',
        },
        '.cm-line': {
          whiteSpace: 'pre-wrap !important',
        },
        '.cm-focused': {
          outline: 'none',
        },
        '.cm-editor': {
          borderRadius: '0',
        },
        '.cm-scroller': {
          fontFamily: 'Monaco, Menlo, Ubuntu Mono, Consolas, Courier New, monospace',
          fontSize: '14px',
          lineHeight: '1.5',
        }
      }),
      EditorView.lineWrapping
    );
    
    return extensions;
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden transition-colors duration-200">
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getLanguageLabel()}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200"
          disabled={!value}
        >
          <Copy className="h-3 w-3 mr-1" />
          {copied ? 'コピー済み' : 'コピー'}
        </button>
      </div>
      
      <div className="relative">
        <CodeMirror
          key={`${language}-editor`}
          value={value || ''}
          onChange={(val) => onChange(val || '')}
          extensions={getLanguageExtension()}
          theme={isDarkMode ? oneDark : undefined}
          placeholder={placeholder}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: false,
            tabSize: 2,
          }}
          className="text-sm"
          height="calc(100vh - 400px)"
          style={{ minHeight: "400px" }}
        />
      </div>
    </div>
  );
};
