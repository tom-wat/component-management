# Component Management Tool

Web UIコンポーネントを管理するためのReactアプリケーション。HTML、CSS、JavaScriptコードスニペットを保存・管理・プレビューできます。

## 技術スタック

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **コードエディター**: CodeMirror
- **ルーティング**: React Router DOM
- **リンター**: ESLint

## 開発環境セットアップ

```bash
npm install      # 依存関係インストール
npm run dev      # 開発サーバー起動 (localhost:5173)
npm run build    # プロダクションビルド
npm run lint     # ESLintチェック
npm run preview  # ビルド結果プレビュー
```

## プロジェクト構成

```
src/
├── components/          # UIコンポーネント
│   ├── Header.tsx      # メインヘッダー（sticky対応）
│   ├── ComponentCard.tsx # コンポーネントカード（エクスポート機能付き）
│   ├── ComponentForm.tsx # 新規作成・編集フォーム
│   └── ...
├── pages/              # ページコンポーネント
│   ├── MainPage.tsx    # メインページ
│   ├── AdminPage.tsx   # 管理者ページ
│   └── DebugPage.tsx   # デバッグページ
├── hooks/              # カスタムフック
├── services/           # API関連
├── contexts/           # React Context
├── types/              # TypeScript型定義
└── utils/              # ユーティリティ関数
```

## コーディング規約

- **インデント**: 2スペース
- **セミコロン**: 必須
- **クォート**: シングルクォート優先
- **命名規則**:
  - 変数・関数: camelCase
  - コンポーネント: PascalCase
  - 定数: UPPER_SNAKE_CASE
  - ファイル: PascalCase (コンポーネント), camelCase (その他)

## 主要機能

### コンポーネント管理
- HTML/CSS/JavaScript コードの保存・編集
- リアルタイムプレビュー（iframe sandbox）
- カテゴリ・タグによる分類
- 検索・フィルタリング

### UI/UX
- ダークモード対応
- レスポンシブデザイン
- グリッド/リスト表示切り替え
- フルスクリーンプレビュー

### データ操作
- 個別コンポーネントのJSONエクスポート
- 一括エクスポート/インポート
- クラウド同期（オプション）

## 開発パターン

### 新しいコンポーネント作成時
1. `src/components/` に `.tsx` ファイル作成
2. 既存コンポーネントのパターンに従う
3. `memo` でパフォーマンス最適化を検討
4. TypeScript型を適切に定義

### API統合
- `src/services/` にAPI関数を配置
- `ApiResponse<T>` 型を使用
- エラーハンドリングを必ず実装

### 状態管理
- ローカル状態: `useState`
- グローバル状態: React Context
- カスタムフック活用

## よく使うコマンド

```bash
# 開発
npm run dev

# 型チェック
npx tsc --noEmit

# リント修正
npm run lint

# Git操作
git add . && git commit -m "message" && git push
```

## 特記事項

### レスポンシブ対応
- `zoom` プロパティでスケール調整
- モバイルではFABボタン使用

### ファイル名規則
- 日本語ファイル名対応
- 特殊文字 `<>:"/\|?*` のみアンダースコアに変換

### パフォーマンス
- コンポーネントは `memo` で最適化
- 大きなリストは仮想化を検討
- 画像は遅延読み込み

## 注意点

- `*.tsbuildinfo` はgitに含めない
- セキュリティ: iframe sandboxでコード実行
- 管理者機能はアクセス制御必須

## よく使う文言・ショートカット

### 基本操作
- `commit` - 変更をコミット
- `commit push` - コミット&プッシュ
- `lint` - ESLintチェック実行
- `build` - プロダクションビルド

### 開発依頼文言
- `fix` - バグ修正をお願いします
- `feature` - 新機能を追加してください
- `refactor` - コードをリファクタリングしてください
- `style` - スタイルを調整してください
- `responsive` - レスポンシブ対応をお願いします
- `darkmode` - ダークモード対応をお願いします
- `test` - テストを追加してください
- `docs` - ドキュメントを更新してください

### UI/UX改善
- `sticky` - 要素をstickyにしてください
- `modal` - モーダルを作成してください
- `loading` - ローディング状態を追加してください
- `error` - エラーハンドリングを改善してください
- `toast` - トースト通知を追加してください

### TypeScript関連
- `types` - TypeScript型を定義してください
- `interface` - インターフェースを作成してください
- `generic` - ジェネリック型を使用してください

### コンポーネント関連
- `component` - 新しいコンポーネントを作成してください
- `props` - プロパティの型定義をしてください
- `hook` - カスタムフックを作成してください
- `context` - React Contextを作成してください

### パフォーマンス
- `memo` - React.memoで最適化してください
- `callback` - useCallbackを使用してください
- `usememo` - useMemoを使用してください

### 共通パターン
- `export json` - JSONエクスポート機能を追加
- `import json` - JSONインポート機能を追加
- `search filter` - 検索・フィルタ機能を実装
- `pagination` - ページネーション機能を追加

## 参考ファイル

@package.json - 依存関係とスクリプト
@src/types/index.ts - TypeScript型定義
@src/components/Header.tsx - メインヘッダー実装例
@src/components/ComponentCard.tsx - カード実装例