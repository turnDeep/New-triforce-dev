```markdown
# Geminiで実装を検証

現在の実装をGeminiで包括的に検証します。

```bash
# 変更されたファイルを収集
CHANGED_FILES=$(git diff --name-only --cached)
if [ -z "$CHANGED_FILES" ]; then
  CHANGED_FILES=$(git diff --name-only)
fi

# 仕様書との整合性チェック
SPEC_DIR=$(ls -t .kiro/specs/ | head -1)
REQUIREMENTS=$(cat .kiro/specs/$SPEC_DIR/002-user-stories.md 2>/dev/null || echo "要件なし")

# 検証項目を準備
gemini -p "以下の実装を包括的に検証してください:

変更ファイル:
$CHANGED_FILES

仕様書の要件:
$REQUIREMENTS

検証項目:
1. セキュリティ
   - 認証・認可の適切性
   - SQLインジェクション対策
   - XSS対策
   - 機密情報の取り扱い

2. パフォーマンス
   - 不要な再レンダリング
   - バンドルサイズ
   - DB クエリの最適化
   - メモリリーク

3. コード品質
   - CODING_STANDARDS.mdへの準拠
   - テストカバレッジ
   - エラーハンドリング
   - 型安全性

4. ベストプラクティス
   - 最新のライブラリ使用
   - デザインパターンの適切性
   - 将来の拡張性

具体的な問題点と改善案を提示してください。"

# テスト実行
echo "
=== 自動テスト実行 ===
"
npm test -- --coverage

# 型チェック
echo "
=== 型チェック ===
"
npm run typecheck

# リント
echo "
=== リントチェック ===
"
npm run lint

echo "
検証完了。Geminiの指摘事項に基づいて修正を行います。
"
```

引数: 検証対象（省略時は全体）
例: /project:verify-with-gemini

```

```