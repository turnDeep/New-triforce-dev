```markdown
# Kiroで仕様書を初期化

Kiroを使用して新しい機能の仕様書を生成します。

```bash
# Kiroの仕様書ディレクトリを準備
mkdir -p .kiro/specs/$(date +%Y%m%d_%H%M%S)

# 要件をKiro形式に変換
echo "プロジェクト要件: $ARGUMENTS" > .kiro/specs/latest/requirements.txt

# Geminiで要件の技術的実現可能性を事前確認
gemini -p "以下の要件の技術的実現可能性を検証してください:
$ARGUMENTS

考慮事項:
1. 実装の複雑度
2. 必要な技術スタック
3. 予想される課題
4. 推奨アーキテクチャ"

# Kiro連携スクリプトを実行
node scripts/kiro-bridge.js init "$ARGUMENTS"

echo "
=== 次のステップ ===
1. Kiro IDEで生成された仕様書を確認
2. 'make sync-spec' で仕様書を同期
3. '/project:implement-spec' で実装開始
"
```

引数: 実装したい機能の説明
例: /project:init-spec ユーザー認証システム（JWT、リフレッシュトークン対応）

```

```