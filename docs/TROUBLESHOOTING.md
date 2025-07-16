# トラブルシューティングガイド - 新三位一体版

新三位一体開発フレームワーク使用時に発生しうる問題とその解決策をまとめました。

## 🏗️ Kiro関連

### 問題: Kiroが起動しない

- **原因**: システム要件を満たしていない、ポート競合
- **解決策**:
1. **システム要件確認**:
  - メモリ: 8GB以上推奨
  - ディスク: 2GB以上の空き容量
1. **ポート確認**: Kiroはポート3333を使用
   
   ```bash
   lsof -i :3333  # Mac/Linux
   netstat -ano | findstr :3333  # Windows
   ```
1. **再インストール**: 最新版をダウンロードして再インストール

### 問題: 仕様書が生成されない

- **原因**: 要件が曖昧、Kiroの設定不備
- **解決策**:
1. **要件の具体化**:
   
   ```
   ❌ Bad: "ユーザー管理機能"
   ✅ Good: "メールアドレスとパスワードでログイン、プロフィール編集、退会機能を含むユーザー管理"
   ```
1. **Kiro設定確認**:
   
   ```bash
   cat .kiro/settings.json
   # specDrivenDevelopment.enabled が true か確認
   ```
1. **ログ確認**:
   
   ```bash
   cat .kiro/logs/latest.log
   ```

### 問題: 月50回の制限に達した

- **原因**: 無料枠の上限
- **解決策**:
1. **バッチ処理**: 複数の要件をまとめて1回で処理
1. **テンプレート活用**: 類似プロジェクトの仕様書を再利用
1. **手動作成**: 緊急時は仕様書を手動で作成
   
   ```bash
   cp templates/spec-template.md .kiro/specs/manual/
   ```

## 💻 Claude Code関連

### 問題: 実装が仕様書と異なる

- **原因**: 仕様書の同期ミス、Claude Codeの解釈エラー
- **解決策**:
1. **仕様書の再同期**:
   
   ```bash
   make sync-spec
   ```
1. **生成された型定義の確認**:
   
   ```bash
   cat src/types/generated.types.ts
   ```
1. **実装リセット**:
   
   ```bash
   git stash
   claude
   > /clear
   > /project:implement-spec
   ```

### 問題: 40回/5時間の制限に達した

- **原因**: Claude Codeの使用制限
- **解決策**:
1. **効率的な指示**: 複数のタスクをまとめて実行
1. **自動モード活用**: 人間の確認を減らして自動実行
1. **時間調整**: 5時間待つか、別のプロジェクトで作業

### 問題: エラーの無限ループ

- **原因**: 同じエラーを繰り返し解決できない
- **解決策**:
1. **Geminiへのエスカレーション**:
   
   ```bash
   gemini -p "think hard: [エラー詳細] このエラーが解決できない根本原因は？"
   ```
1. **コンテキストリセット**:
   
   ```bash
   claude
   > /clear
   > /memory refresh
   ```
1. **代替アプローチ**:
   
   ```bash
   /project:generate-alternative-implementation
   ```

## 🔍 Gemini CLI関連

### 問題: レート制限エラー

- **原因**: 1000回/日の制限超過
- **解決策**:
1. **APIキー使用**:
   
   ```bash
   export GEMINI_API_KEY="your-api-key"
   ```
1. **クエリ最適化**: 複数の質問を1つにまとめる
1. **キャッシュ活用**: 同じ質問を繰り返さない

### 問題: Web検索結果が古い

- **原因**: 検索クエリが不適切
- **解決策**:
1. **日付指定**:
   
   ```bash
   gemini -p "Next.js 14 App Router 2025年の最新情報"
   ```
1. **具体的なバージョン指定**:
   
   ```bash
   gemini -p "React 18.3.0 の新機能"
   ```

### 問題: PDFが読み込めない

- **原因**: PDFディレクトリの設定ミス
- **解決策**:
1. **ディレクトリ確認**:
   
   ```bash
   ls -la ~/PDF/
   ```
1. **権限設定**:
   
   ```bash
   chmod 755 ~/PDF
   chmod 644 ~/PDF/*.pdf
   ```
1. **Dev Containerのマウント確認**:
   
   ```json
   // .devcontainer/devcontainer.json
   "mounts": [{
     "source": "${localEnv:HOME}/PDF",
     "target": "/home/node/PDF",
     "type": "bind"
   }]
   ```

## 🔄 連携関連の問題

### 問題: 仕様書の同期が失敗する

- **原因**: ファイル形式の不一致、パーサーエラー
- **解決策**:
1. **仕様書の検証**:
   
   ```bash
   node scripts/kiro-bridge.js validate
   ```
1. **手動同期**:
   
   ```bash
   node scripts/sync-spec.js
   ```
1. **ログ確認**:
   
   ```bash
   cat .kiro/specs/sync-progress.json
   ```

### 問題: AIツール間の連携が機能しない

- **原因**: 設定ファイルの不整合
- **解決策**:
1. **設定ファイルの確認**:
   
   ```bash
   # 各設定ファイルが存在するか確認
   test -f .claude/memory.json && echo "✓ Claude設定OK"
   test -f .gemini/settings.json && echo "✓ Gemini設定OK"
   test -f .kiro/settings.json && echo "✓ Kiro設定OK"
   ```
1. **バージョン互換性**:
   
   ```bash
   claude --version
   gemini --version
   # Kiroのバージョンはアプリ内で確認
   ```

## 🐛 一般的なエラーと解決策

### TypeScriptエラー

```typescript
// エラー: Cannot find module '@/types'
// 解決策: tsconfig.jsonのpaths設定を確認
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### ESLintエラー

```bash
# 自動修正
npm run lint:fix

# 特定のルールを無効化
// eslint-disable-next-line @typescript-eslint/no-explicit-any
```

### テスト失敗

```bash
# 詳細なエラー情報
npm test -- --verbose

# 特定のテストのみ実行
npm test -- --testNamePattern="UserAuth"

# カバレッジ無視
/* istanbul ignore next */
```

## 📊 パフォーマンス問題

### ビルドが遅い

1. **依存関係の最適化**:
   
   ```bash
   npm run analyze-bundle
   ```
1. **不要なインポートの削除**:
   
   ```bash
   npm run lint:fix
   ```

### 開発サーバーが重い

1. **キャッシュクリア**:
   
   ```bash
   make clean
   ```
1. **メモリ割り当て増加**:
   
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run dev
   ```

## 🚨 緊急時の対処法

### 全てのAIが使用できない場合

1. **手動モード**: 従来の開発手法にフォールバック
1. **ローカルLLM**: Ollama等のローカルLLMを一時的に使用
1. **チーム開発**: 他の開発者と協力

### データ損失の回避

```bash
# 定期的なバックアップ
git add -A && git commit -m "WIP: $(date)"

# 仕様書のバックアップ
cp -r .kiro/specs .kiro/specs.backup.$(date +%Y%m%d)
```

## 📞 サポートとコミュニティ

### 公式ドキュメント

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Gemini CLI GitHub](https://github.com/google-gemini/gemini-cli)
- [Kiro Documentation](https://kiro.dev/docs)

### コミュニティ

- Discord: 各ツールの公式Discordサーバー
- GitHub Issues: バグ報告と機能リクエスト
- Stack Overflow: タグ `new-triforce-dev`

### ログとデバッグ

```bash
# 統合ログビューアー
tail -f .kiro/logs/latest.log .claude/logs/*.log

# デバッグモード
DEBUG=* npm run dev
```

-----

**問題が解決しない場合は、コミュニティフォーラムで質問するか、より詳細なログを添えてIssueを作成してください。**