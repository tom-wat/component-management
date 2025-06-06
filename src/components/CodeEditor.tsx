import React from 'react';
import { Copy } from 'lucide-react';
import { copyToClipboard } from '../utils/helpers';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'html' | 'css' | 'javascript';
  placeholder?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  placeholder = '',
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

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden transition-colors duration-200">
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getLanguageLabel()}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200"
          disabled={!value}
        >
          <Copy className="h-3 w-3 mr-1" />
          {copied ? 'コピー済み' : 'コピー'}
        </button>
      </div>
      
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-64 p-4 code-editor text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-inset border-none transition-colors duration-200"
        />
      </div>
    </div>
  );
};
