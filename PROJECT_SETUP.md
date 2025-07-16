# 新三位一体開発環境セットアップガイド

このプロジェクトは、Kiro、Claude Code、Gemini CLIによる完全自動化された開発手法を採用しています。

## 🔧 セットアップ手順

### 1. 必要なツールの確認

```bash
# Node.js 20以上が必要
node --version

# npmまたはyarn
npm --version
```

### 2. Dev Container セットアップ（推奨）

#### 2.1 VS Codeで開く

```bash
git clone https://github.com/yourname/new-triforce-dev.git
cd new-triforce-dev
code .
```

#### 2.2 Dev Containerで起動

- VS Code右下の「Reopen in Container」をクリック
- または `Cmd/Ctrl+Shift+P` → 「Dev Containers: Reopen in Container」

#### 2.3 自動セットアップ

Dev Container起動時に以下が自動実行されます：

- Claude CodeとGemini CLIのインストール
- プロジェクトの依存関係インストール
- 必要なディレクトリ構造の作成

### 3. 手動セットアップ（Dev Containerを使わない場合）

#### 3.1 Claude Codeのインストール

```bash
npm install -g @anthropic-ai/claude-code
```

#### 3.2 Gemini CLIのインストール

```bash
npm install -g @google/gemini-cli
```

#### 3.3 プロジェクトセットアップ

```bash
make setup
```

### 4. Kiroのセットアップ（別途必要）

Kiroはデスクトップアプリケーションのため、別途インストールが必要です。

#### 4.1 ダウンロード

<https://kiro.dev/> から以下をダウンロード：

- Windows: `Kiro-Setup-x.x.x.exe`
- macOS: `Kiro-x.x.x.dmg`
- Linux: `Kiro-x.x.x.AppImage`

#### 4.2 インストール

1. ダウンロードしたインストーラーを実行
1. 指示に従ってインストール

#### 4.3 初回起動と認証

1. Kiroを起動
1. 以下のいずれかでサインイン：
- Google アカウント
- GitHub アカウント
- AWS SSO
- Builder ID

#### 4.4 プロジェクト連携

```bash
# Kiro連携の初期設定
make init-kiro
```

### 5. 認証設定

#### 5.1 Claude Code認証

```bash
claude
# ブラウザが開くので、Anthropicアカウントでログイン
# 課金設定が必要（使用量に応じた従量課金）
```

#### 5.2 Gemini CLI認証

```bash
gemini
# Googleアカウントでログイン
# 無料枠: 60req/分、1000req/日
```

### 6. 環境変数の設定

#### 6.1 ローカル環境変数

```bash
# .env.localを作成
cp .env.example .env.local

# 編集
code .env.local
```

必要な環境変数：

```env
# 必須ではないが、APIキー使用時に設定
ANTHROPIC_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here

# プロジェクト固有の設定
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### 6.2 Dev Container環境変数

Dev Containerを使用している場合、ローカルの環境変数が自動的に転送されます。

### 7. PDFリファレンスの準備

Gemini CLIがPDFを参照できるように設定：

```bash
# PDFディレクトリの作成（Dev Containerでは自動マウント）
mkdir -p ~/PDF

# コーディング規約をPDF化（pandocが必要）
pandoc CODING_STANDARDS.md -o ~/PDF/coding-standards.pdf
```

### 8. プロジェクト固有の設定

#### 8.1 メモリ設定

```bash
# Claudeのメモリ設定
cp memory.json.sample ~/.claude/memory.json
code ~/.claude/memory.json
```

#### 8.2 Gemini設定

```bash
# Geminiの設定
cp settings.json.sample ~/.gemini/settings.json
code ~/.gemini/settings.json
```

#### 8.3 Kiro設定

```bash
# Kiroの設定
cp kiro-settings.json.sample .kiro/settings.json
```

## 🚀 開発開始

### 最初のプロジェクト作成

1. **Kiroで要件定義**
   
   ```
   Kiro IDEを開く
   新規プロジェクト → "ユーザー認証システムを作りたい"
   ```
1. **仕様書の同期**
   
   ```bash
   make sync-spec
   ```
1. **Claude Codeで実装**
   
   ```bash
   claude
   > /project:implement-spec
   ```
1. **自動検証**
   
   ```bash
   make verify
   ```

## 📋 設定チェックリスト

- [ ] Node.js 20以上インストール済み
- [ ] Claude Codeインストール・認証済み
- [ ] Gemini CLIインストール・認証済み
- [ ] Kiroインストール・認証済み
- [ ] プロジェクトディレクトリ構造作成済み
- [ ] 環境変数設定済み
- [ ] PDFディレクトリ準備済み

## 🔍 トラブルシューティング

### Claude Codeが起動しない

```bash
# バージョン確認
claude --version

# 再インストール
npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code
```

### Gemini CLIのレート制限

- 無料枠を超えた場合は時間を置くか、APIキーを設定
- `GEMINI_API_KEY`環境変数にGoogle AI StudioのAPIキーを設定

### Kiroが仕様書を生成しない

- Kiroアプリケーションのログを確認
- `.kiro/specs/`ディレクトリの権限を確認
- Kiroを最新バージョンにアップデート

### Dev Containerのビルドエラー

- Docker Desktopが起動していることを確認
- `.devcontainer/devcontainer.json`の構文を確認
- VS Codeの「Dev Containers」拡張機能を最新に更新

## 📚 次のステップ

1. <docs/WORKFLOW.md> - 開発ワークフローの詳細
1. <docs/AI_ROLES.md> - 各AIの役割と責任
1. <CODING_STANDARDS.md> - コーディング規約

-----

**セットアップ完了後は、人間の介入を最小限に、AIが協調して開発を進めます！**