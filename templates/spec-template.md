# 仕様書テンプレート

このテンプレートは、Kiroで仕様書を作成する際の標準フォーマットです。

## 001-project-overview.md

```markdown
# プロジェクト概要

## プロジェクト名
[プロジェクト名]

## 概要
[プロジェクトの目的と提供価値を2-3文で記述]

## 背景
[なぜこのプロジェクトが必要なのか]

## ターゲットユーザー
- 主要ユーザー: [誰が使うか]
- 使用シーン: [どんな時に使うか]
- 期待される効果: [使うことで何が改善されるか]

## スコープ
### 含まれるもの
- [機能1]
- [機能2]

### 含まれないもの
- [今回は実装しない機能]

## 成功指標
- [測定可能な成功条件1]
- [測定可能な成功条件2]
```

## 002-user-stories.md

```markdown
# ユーザーストーリー

## 認証機能

### US001: ユーザー登録
**As a** 新規ユーザー
**I want to** メールアドレスとパスワードで登録する
**So that** サービスを利用開始できる

**受け入れ基準（EARS記法）:**
```

Given ユーザーが未登録の状態で
When 有効なメールアドレスとパスワードを入力して登録ボタンを押したとき
Then アカウントが作成され、確認メールが送信される

```
**エッジケース:**
- 既に登録済みのメールアドレスの場合
- パスワードが要件を満たさない場合
- メール送信に失敗した場合
```

## 003-technical-design.md

```markdown
# 技術設計書

## アーキテクチャ概要
[システム全体のアーキテクチャ図]

## 技術スタック
- Frontend: Next.js 14 (App Router)
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: JWT + Refresh Token
- Styling: Tailwind CSS

## コンポーネント設計
### 認証コンポーネント
```typescript
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}
```

## データフロー

[認証フローの図]

## セキュリティ考慮事項

- パスワードのハッシュ化（bcrypt）
- JWTの有効期限（15分）
- Refresh Tokenの安全な保存
- CSRF対策

```
## 004-api-specification.md

```markdown
# API仕様

## 認証API

### POST /api/auth/register
ユーザー登録

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**

```json
{
  "message": "Registration successful. Please check your email.",
  "userId": "uuid-here"
}
```

**Errors:**

- 400: Invalid input
- 409: Email already exists
- 500: Server error

```
## 005-database-schema.md

```markdown
# データベース設計

## テーブル定義

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### TypeScript型定義

```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

```
## 006-implementation-tasks.md

```markdown
# 実装タスクリスト

## フェーズ1: 基盤構築（見積もり: 4時間）
- [ ] プロジェクト初期設定（Next.js, TypeScript, ESLint）
- [ ] データベースセットアップとマイグレーション
- [ ] 基本的なフォルダ構造の作成
- [ ] 環境変数の設定

## フェーズ2: 認証基盤（見積もり: 6時間）
- [ ] JWT utility関数の実装
- [ ] パスワードハッシュ化utility
- [ ] 認証ミドルウェアの作成
- [ ] エラーハンドリング基盤

## フェーズ3: API実装（見積もり: 8時間）
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] POST /api/auth/refresh
- [ ] POST /api/auth/logout
- [ ] GET /api/auth/me

## フェーズ4: フロントエンド（見積もり: 8時間）
- [ ] 認証Context/Providerの実装
- [ ] ログインページ
- [ ] 登録ページ
- [ ] プロフィールページ
- [ ] 保護されたルートの実装

## フェーズ5: テストと最適化（見積もり: 4時間）
- [ ] ユニットテストの作成
- [ ] 統合テストの作成
- [ ] パフォーマンス最適化
- [ ] セキュリティ監査

総見積もり時間: 30時間
```