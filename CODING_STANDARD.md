# 📝 統一コーディング規約

## 目的

Kiro、Claude Code、Gemini CLIの3つのAIが一貫性のある高品質なコードを生成するための統一規約です。

## 🎯 基本原則

1. **可読性優先** - コードは書くより読まれる回数の方が多い
1. **一貫性** - プロジェクト全体で統一されたスタイル
1. **保守性** - 将来の変更が容易な設計
1. **テスタビリティ** - テストしやすい構造
1. **型安全性** - TypeScriptの型システムを最大限活用

## 📁 プロジェクト構造

```
src/
├── components/          # UIコンポーネント
│   ├── common/         # 共通コンポーネント
│   ├── features/       # 機能別コンポーネント
│   └── layouts/        # レイアウトコンポーネント
├── hooks/              # カスタムフック
├── services/           # ビジネスロジック・API通信
├── utils/              # ユーティリティ関数
├── types/              # 型定義
├── constants/          # 定数
└── styles/             # グローバルスタイル
```

## 🔤 命名規則

### ファイル名

```typescript
// コンポーネント: PascalCase
UserProfile.tsx
AuthenticationForm.tsx

// フック: camelCase
useAuth.ts
useLocalStorage.ts

// ユーティリティ: camelCase
dateFormatter.ts
validation.ts

// 型定義: types.ts で統一
user.types.ts
api.types.ts

// テスト: *.test.ts または *.spec.ts
UserProfile.test.tsx
dateFormatter.spec.ts
```

### 変数・関数名

```typescript
// 変数: camelCase
const userName = "John";
const isAuthenticated = true;

// 定数: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = "https://api.example.com";

// 関数: camelCase（動詞で始める）
const getUserData = async (userId: string) => {};
const validateEmail = (email: string) => {};
const handleSubmit = (event: FormEvent) => {};

// クラス: PascalCase
class UserService {}
class AuthenticationManager {}

// 型・インターフェース: PascalCase
interface UserData {
  id: string;
  name: string;
}

type UserId = string;
type UserRole = "admin" | "user" | "guest";

// Enum: PascalCase（値はUPPER_SNAKE_CASE）
enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED"
}
```

## 💡 TypeScript規約

### 型定義

```typescript
// ❌ Bad: any型の使用
const processData = (data: any) => {};

// ✅ Good: 明確な型定義
interface ProcessData {
  id: string;
  value: number;
}
const processData = (data: ProcessData) => {};

// ❌ Bad: 型アサーション
const value = data as string;

// ✅ Good: 型ガード
const isString = (value: unknown): value is string => {
  return typeof value === "string";
};
```

### インターフェース vs 型エイリアス

```typescript
// インターフェース: オブジェクトの形状定義
interface User {
  id: string;
  name: string;
  email: string;
}

// 型エイリアス: Union型、関数型、プリミティブのエイリアス
type UserId = string;
type UserRole = "admin" | "user";
type AsyncFunction<T> = () => Promise<T>;
```

## 🧩 コンポーネント規約

### React コンポーネント

```tsx
// ✅ Good: 関数コンポーネント + 明確な型定義
interface UserCardProps {
  user: User;
  onSelect?: (userId: string) => void;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onSelect,
  className 
}) => {
  const handleClick = () => {
    onSelect?.(user.id);
  };

  return (
    <div className={className} onClick={handleClick}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};

// デフォルトプロパティ
UserCard.defaultProps = {
  className: "",
};
```

### カスタムフック

```typescript
// ✅ Good: 明確な戻り値の型定義
interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 実装...

  return { user, isLoading, error, login, logout };
};
```

## 🔧 関数規約

### 関数の設計原則

```typescript
// ✅ Good: 単一責任の原則
const calculateTax = (amount: number, rate: number): number => {
  return amount * rate;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY"
  }).format(amount);
};

// ❌ Bad: 複数の責任
const calculateAndFormatTax = (amount: number, rate: number): string => {
  const tax = amount * rate;
  return `¥${tax.toFixed(2)}`;
};
```

### エラーハンドリング

```typescript
// ✅ Good: Result型パターン
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

const fetchUser = async (id: string): Promise<Result<User>> => {
  try {
    const response = await api.get(`/users/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error("Unknown error")
    };
  }
};

// 使用例
const result = await fetchUser("123");
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

## 📝 コメント規約

### JSDoc

```typescript
/**
 * ユーザー情報を取得する
 * @param userId - ユーザーID
 * @param options - 取得オプション
 * @returns ユーザー情報のPromise
 * @throws {NotFoundError} ユーザーが見つからない場合
 * @example
 * ```typescript
 * const user = await getUserById("123", { includeProfile: true });
 * ```
 */
export const getUserById = async (
  userId: string,
  options?: GetUserOptions
): Promise<User> => {
  // 実装
};
```

### インラインコメント

```typescript
// ✅ Good: なぜそうするのかを説明
// レート制限を回避するため、リトライ間隔を指数関数的に増加
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);

// ❌ Bad: コードを言い換えるだけ
// ユーザーIDを取得
const userId = user.id;
```

## 🧪 テスト規約

### テストファイル構造

```typescript
describe("UserService", () => {
  describe("getUserById", () => {
    it("正常系: 存在するユーザーIDで正しいユーザー情報を返す", async () => {
      // Arrange
      const userId = "123";
      const expectedUser = { id: userId, name: "Test User" };
      
      // Act
      const result = await userService.getUserById(userId);
      
      // Assert
      expect(result).toEqual(expectedUser);
    });

    it("異常系: 存在しないユーザーIDでエラーを返す", async () => {
      // Arrange
      const userId = "nonexistent";
      
      // Act & Assert
      await expect(userService.getUserById(userId))
        .rejects.toThrow(NotFoundError);
    });
  });
});
```

## 🎨 スタイル規約

### CSS/Styled Components

```typescript
// CSS Modules
.userCard {
  padding: 16px;
  border-radius: 8px;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &__title {
    font-size: 18px;
    font-weight: bold;
  }
}

// Styled Components
const UserCard = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;
```

## 📏 コード品質基準

### 複雑度

- 関数の行数: 最大30行
- 循環的複雑度: 最大10
- ネストレベル: 最大3段階
- ファイルの行数: 最大300行

### パフォーマンス

```typescript
// ✅ Good: メモ化を活用
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => 
    expensiveCalculation(data), [data]
  );
  
  return <div>{processedData}</div>;
});

// ✅ Good: 遅延読み込み
const HeavyComponent = lazy(() => import("./HeavyComponent"));
```

## 🔒 セキュリティ規約

```typescript
// ✅ Good: 入力値の検証
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input);
};

// ✅ Good: 環境変数の型安全な取得
const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません`);
  }
  return value;
};

// ❌ Bad: SQLインジェクションの脆弱性
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Good: パラメータ化クエリ
const query = "SELECT * FROM users WHERE id = ?";
const result = await db.query(query, [userId]);
```

## 📦 インポート順序

```typescript
// 1. React関連
import React, { useState, useEffect } from "react";

// 2. 外部ライブラリ
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// 3. 内部モジュール（絶対パス）
import { Button } from "@/components/common";
import { useAuth } from "@/hooks";

// 4. 相対パス
import { UserCard } from "./UserCard";
import styles from "./UserList.module.css";

// 5. 型定義
import type { User } from "@/types";
```

## 🚀 Git コミット規約

```bash
# フォーマット: <type>(<scope>): <subject>

feat(auth): ログイン機能を実装
fix(ui): ボタンのスタイル崩れを修正
docs(readme): インストール手順を追加
style(global): コードフォーマットを統一
refactor(api): API通信ロジックを整理
test(user): ユーザーサービスのテストを追加
chore(deps): 依存関係を更新
```

-----

**この規約は全てのAI（Kiro、Claude Code、Gemini CLI）が遵守し、一貫性のある高品質なコードベースを維持します。**