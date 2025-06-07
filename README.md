# Component Management Tool

UIコンポーネントの作成・管理・共有を行うWebアプリケーションです。

## 🆕 新機能: 管理者ページ

削除されたコンポーネントの管理と復元機能を追加しました。

### 管理者ページの機能
- **削除済みコンポーネント一覧**: 論理削除されたコンポーネントの表示
- **復元機能**: 削除されたコンポーネントの復活
- **完全削除**: コンポーネントの物理削除
- **一括削除**: 古いコンポーネントの一括完全削除
- **統計情報**: アクティブ・削除済みコンポーネント数の表示

## 🚀 セットアップ

### 1. バックエンド API の起動

```bash
# component-apiディレクトリで
cd ../component-api
npm run dev
```

### 2. フロントエンドのセットアップ

```bash
# 初回のみ: 管理者ページ機能のセットアップ
chmod +x setup-admin.sh
./setup-admin.sh

# 開発サーバー起動
npm run dev
```

## 📱 アクセス方法

- **メインページ**: http://localhost:3000/
- **管理者ページ**: http://localhost:3000/admin

## 🎯 使用方法

### メインページ
1. コンポーネントの作成・編集・削除
2. カテゴリ別フィルタリング
3. 検索機能
4. インポート・エクスポート

### 管理者ページ
1. 右上の「管理者パネル」ボタンをクリック
2. 削除されたコンポーネントの確認
3. 復元または完全削除の実行
4. 統計情報の確認

## 🔧 技術構成

### フロントエンド
- **React 18** + **TypeScript**
- **React Router DOM** - ページルーティング
- **Tailwind CSS** - スタイリング
- **Lucide React** - アイコン
- **Vite** - ビルドツール

### バックエンド
- **Cloudflare Workers** - サーバーレス実行環境
- **Cloudflare D1** - SQLiteデータベース
- **論理削除** - データの安全な管理

## 📋 API エンドポイント

### 一般ユーザー向け
- `GET /api/components` - コンポーネント一覧
- `POST /api/components` - コンポーネント作成
- `PUT /api/components/:id` - コンポーネント更新
- `DELETE /api/components/:id` - コンポーネント削除（論理削除）

### 管理者向け
- `GET /api/admin/stats` - 管理者統計情報
- `GET /api/admin/deleted-components` - 削除済みコンポーネント一覧
- `POST /api/admin/components/:id/restore` - コンポーネント復元
- `DELETE /api/admin/components/:id/purge` - コンポーネント完全削除
- `DELETE /api/admin/purge-old?days=30` - 古いコンポーネント一括削除

## 🛡️ セキュリティ

現在は認証なしの実装です。本番環境では以下の実装を推奨します：

- 管理者ページのアクセス制御
- API認証の追加
- CORS設定の厳密化

## 🚀 デプロイ

### Vercel (推奨)
```bash
npm run build
npx vercel --prod
```

### その他のプラットフォーム
`dist`ディレクトリをホスティングサービスにアップロード

## 📝 環境変数

`.env.local`ファイルを作成：
```bash
VITE_API_BASE_URL=http://localhost:8787
NODE_ENV=development
```

本番環境では`VITE_API_BASE_URL`をデプロイされたAPIのURLに変更してください。

## 🤝 開発に参加する

1. リポジトリをフォーク
2. フィーチャーブランチを作成
3. 変更をコミット
4. プルリクエストを送信

## 📄 ライセンス

MIT License
