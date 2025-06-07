#!/bin/bash

echo "🚀 管理者ページ機能 - セットアップスクリプト"
echo "============================================"

# 現在のディレクトリを確認
if [ ! -f "package.json" ]; then
    echo "❌ エラー: component managementディレクトリで実行してください"
    exit 1
fi

echo ""
echo "📦 React Router DOM をインストール中..."
npm install react-router-dom@^6.28.0

echo ""
echo "📦 TypeScript型定義をインストール中..."
npm install --save-dev @types/react-router-dom

echo ""
echo "✅ セットアップ完了！"
echo ""
echo "🚀 開発サーバーを起動するには:"
echo "   npm run dev"
echo ""
echo "📋 利用可能なページ:"
echo "   http://localhost:5173/        - メインページ（コンポーネント管理）"
echo "   http://localhost:5173/admin   - 管理者ページ（削除済み管理）"
echo ""
echo "⚠️  注意: 管理者ページを使用する前に、component-apiの開発サーバーが起動していることを確認してください"
echo "   cd ../component-api && npm run dev"
