# セキュリティ実装ドキュメント

このドキュメントでは、コンポーネント管理ツールに実装されたセキュリティ機能について説明します。

## 実装済みセキュリティ機能

### 1. 認証システム (AuthService)

**ファイル**: `src/services/authService.ts`

- **JWT トークンベース認証**
  - アクセストークンとリフレッシュトークンによる二重認証
  - トークン有効期限の自動チェック（5分前に自動更新）
  - トークンの自動リフレッシュ機能

- **セキュアなAPI通信**
  - Bearer トークンによる認証ヘッダー
  - Cookie セッション併用によるセキュリティ強化
  - CSRF対策ヘッダー (`X-Requested-With`, `X-App-Name`)

- **タブ間同期**
  - BroadcastChannel による認証状態の同期
  - 一つのタブでログアウトすると全タブで無効化

### 2. セキュアAPI通信フック (useSecureAPI)

**ファイル**: `src/hooks/useSecureAPI.ts`

- **自動認証ヘッダー付与**
- **401エラー時の自動ログアウト**
- **エラーハンドリングと型安全性**
- **ローディング状態管理**

### 3. 認証コンテキスト (AuthContext)

**ファイル**: `src/contexts/AuthContext.tsx`

- **アプリケーション全体の認証状態管理**
- **React Context による状態共有**
- **認証状態の永続化と復元**

### 4. ログインフォーム (LoginForm)

**ファイル**: `src/components/LoginForm.tsx`

- **パスワード表示/非表示切り替え**
- **フォームバリデーション**
- **ローディング状態表示**
- **エラーメッセージ表示**

## API セキュリティ仕様

### 認証エンドポイント

```typescript
// ログイン
POST /api/auth/login
{
  "password": "admin_password"
}

// レスポンス
{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token", 
  "tokenExpiresIn": 3600
}

// トークンリフレッシュ
POST /api/auth/refresh
{
  "refreshToken": "refresh_token"
}

// ログアウト
POST /api/auth/logout

// 認証状態確認
GET /api/auth/status
```

### セキュリティヘッダー

```typescript
{
  "X-Requested-With": "XMLHttpRequest",
  "X-App-Name": "component-management",
  "Authorization": "Bearer jwt_token",
  "Content-Type": "application/json"
}
```

## セキュリティ設計思想

### 1. 多層防御
- JWT + Cookie の二重認証
- CSRF対策ヘッダー
- 自動ログアウト機能

### 2. ユーザビリティとセキュリティの両立
- 自動トークンリフレッシュによるシームレスな UX
- タブ間同期による一貫した認証状態
- 適切なエラーハンドリング

### 3. 型安全性
- TypeScript による厳密な型定義
- API レスポンスの型安全性
- エラーハンドリングの型安全性

## 実装時の注意点

### 1. トークン管理
- アクセストークンはメモリ内のみで管理（XSS対策）
- リフレッシュトークンも適切に管理
- トークン有効期限の適切な設定

### 2. エラーハンドリング
- 認証エラー時の適切なフォールバック
- ネットワークエラー時の再試行ロジック
- ユーザーフレンドリーなエラーメッセージ

### 3. 開発環境での配慮
- 開発環境での自動ログイン機能
- 環境変数による設定の外部化
- デバッグ用のログ出力

## 削除理由

このセキュリティ機能は以下の理由により UI から削除されました：

1. **シンプルさの優先**: アプリケーションの複雑性を削減
2. **開発効率**: 認証なしでの迅速な開発・テストを可能に
3. **用途の明確化**: 内部ツールとしての位置づけ

ただし、本番環境での使用を考慮する場合は、このドキュメントを参考に認証機能を再実装することを推奨します。

## 再実装時の参考

セキュリティ機能を再度有効にする場合は、以下のファイルを参考にしてください：

- `src/services/authService.ts` - 認証サービス
- `src/hooks/useSecureAPI.ts` - セキュア API フック  
- `src/contexts/AuthContext.tsx` - 認証コンテキスト
- `src/components/LoginForm.tsx` - ログインフォーム

これらのファイルは実装済みであり、必要に応じて再統合可能です。