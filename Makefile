.PHONY: setup dev test review clean help sync-spec implement verify init-kiro

# ヘルプ

help:
@echo “新三位一体開発コマンド:”
@echo “  make setup       - 初期セットアップ”
@echo “  make init-kiro   - Kiro連携の初期設定”
@echo “  make sync-spec   - Kiroの仕様書を同期”
@echo “  make implement   - 仕様書から実装開始”
@echo “  make verify      - Geminiで包括的検証”
@echo “  make dev         - 開発サーバー起動”
@echo “  make test        - テスト実行”
@echo “  make review      - コードレビュー”
@echo “  make clean       - キャッシュクリア”

# セットアップ

setup:
npm install
mkdir -p .claude/commands
mkdir -p .kiro/specs
mkdir -p .kiro/hooks
mkdir -p scripts
mkdir -p ~/PDF
@echo “✅ Claude CodeとGemini CLIがインストールされていることを確認してください”
@echo “  npm install -g @anthropic-ai/claude-code”
@echo “  npm install -g @google/gemini-cli”
@echo “”
@echo “⚠️ Kiroは別途インストールが必要です”
@echo “  https://kiro.dev/ からダウンロード”

# Kiro連携初期設定

init-kiro:
@echo “Kiro連携を初期化しています…”
mkdir -p .kiro/specs/template
cp templates/spec-template.md .kiro/specs/template/
@echo “CODING_STANDARDS.mdをPDF化…”
@if command -v pandoc &> /dev/null; then   
pandoc CODING_STANDARDS.md -o ~/PDF/coding-standards.pdf;   
else   
echo “⚠️ pandocがインストールされていません。手動でPDF化してください。”;   
fi
@echo “✅ Kiro連携の準備完了”

# Kiro仕様書同期

sync-spec:
@echo “Kiroの仕様書を同期しています…”
@if [ -d “.kiro/specs” ]; then   
LATEST=$$(ls -t .kiro/specs/ | grep -v template | head -1);   
if [ -n “$$LATEST” ]; then   
echo “最新仕様書: $$LATEST”;   
cp -r .kiro/specs/$$LATEST .kiro/specs/latest;   
node scripts/sync-spec.js;   
else   
echo “❌ 仕様書が見つかりません”;   
fi   
else   
echo “❌ .kiro/specsディレクトリが存在しません”;   
fi

# 仕様書から実装

implement:
@echo “仕様書に基づいて実装を開始します…”
claude
@echo “/project:implement-spec を実行してください”

# Geminiで検証

verify:
@echo “実装をGeminiで検証します…”
@git add -A
gemini -p “現在の変更内容を検証してください”
npm test – –coverage
npm run typecheck || true
npm run lint || true

# 開発

dev:
npm run dev

# テスト

test:
npm test
npm run typecheck
npm run lint

# レビュー

review:
@echo “変更内容をGeminiでレビューします…”
git diff –cached > /tmp/changes.diff
@if [ -s /tmp/changes.diff ]; then   
gemini -p “コードレビュー: $$(cat /tmp/changes.diff | head -500)”;   
else   
git diff > /tmp/changes.diff;   
gemini -p “コードレビュー: $$(cat /tmp/changes.diff | head -500)”;   
fi

# クリーンアップ

clean:
rm -rf node_modules
rm -rf .next
rm -rf dist
rm -f *.log
rm -f /tmp/changes.diff
npm cache clean –force