```markdown
# 仕様書から実装

Kiroが生成した仕様書に基づいて実装を開始します。

```bash
# 最新の仕様書を確認
SPEC_DIR=$(ls -t .kiro/specs/ | head -1)
echo "実装対象仕様書: $SPEC_DIR"

# 仕様書の内容を読み込み
OVERVIEW=$(cat .kiro/specs/$SPEC_DIR/001-project-overview.md 2>/dev/null || echo "")
STORIES=$(cat .kiro/specs/$SPEC_DIR/002-user-stories.md 2>/dev/null || echo "")
DESIGN=$(cat .kiro/specs/$SPEC_DIR/003-technical-design.md 2>/dev/null || echo "")
TASKS=$(cat .kiro/specs/$SPEC_DIR/006-implementation-tasks.md 2>/dev/null || echo "")

# Geminiで技術スタックの最新情報を確認
gemini -p "仕様書に基づく実装を開始します。以下の技術スタックの最新ベストプラクティスを教えてください:

仕様概要:
$OVERVIEW

使用予定技術:
$DESIGN

特に注意すべきセキュリティ面、パフォーマンス面の考慮事項を含めて。"

# 実装タスクリストを表示
echo "
=== 実装タスクリスト ===
$TASKS

=== 実装開始 ===
"

# プロジェクト構造を初期化
mkdir -p src/{components,services,hooks,utils,types,constants}
mkdir -p src/components/{common,features,layouts}

# 基本的な型定義を生成
echo "// 仕様書に基づく型定義
$DESIGN
" > src/types/index.ts

echo "
実装を開始します。タスクリストに従って段階的に進めます。
各ステップでGeminiが自動的に検証を行います。
"
```

引数: なし（最新の仕様書を自動的に使用）
例: /project:implement-spec

```

```