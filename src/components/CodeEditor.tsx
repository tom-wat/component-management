import React from 'react';
import { Copy } from 'lucide-react';
import { copyToClipboard } from '../utils/storage';

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
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-300">
        <span className="text-sm font-medium text-gray-700">
          {getLanguageLabel()}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 focus:outline-none"
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
          className="w-full h-64 p-4 code-editor text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset border-none"
        />
      </div>
    </div>
  );
};
