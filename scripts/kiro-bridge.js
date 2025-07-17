#!/usr/bin/env node

/**
 * Kiro Bridge - Kiroとの連携を管理するスクリプト
 * Kiroはデスクトップアプリのため、ファイルベースで連携
 */

const fs = require('fs').promises;
const path = require('path');

class KiroBridge {
  constructor() {
    this.specsDir = path.join(process.cwd(), '.kiro/specs');
    this.hooksDir = path.join(process.cwd(), '.kiro/hooks');
  }

  /**
   * 新しい仕様書プロジェクトを初期化
   */
  async init(requirements) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const projectDir = path.join(this.specsDir, timestamp);
    
    await fs.mkdir(projectDir, { recursive: true });
    
    // 要件ファイルを作成
    const requirementsContent = `# プロジェクト要件

## 概要
${requirements}

## 生成日時
${new Date().toISOString()}

## 期待される成果物
- ユーザーストーリー
- 技術設計書
- API仕様
- データベース設計
- 実装タスクリスト

## 制約事項
- 無料枠での実装を前提
- Claude Code（40回/5h）での実装可能な規模
- Gemini CLI（1000回/日）での検証

## 備考
このファイルをKiro IDEで開いて、仕様書生成を開始してください。
`;
    
    await fs.writeFile(
      path.join(projectDir, '000-requirements.md'),
      requirementsContent
    );
    
    // Kiro用の設定ファイルを作成
    const kiroConfig = {
      projectName: `spec-${timestamp}`,
      requirements: requirements,
      outputDir: projectDir,
      hooks: [
        {
          name: "spec-validation",
          trigger: "spec-save",
          action: "validate-consistency"
        },
        {
          name: "claude-notification",
          trigger: "spec-complete",
          action: "notify-implementation-ready"
        }
      ]
    };
    
    await fs.writeFile(
      path.join(projectDir, 'kiro.config.json'),
      JSON.stringify(kiroConfig, null, 2)
    );
    
    console.log(`✅ Kiroプロジェクトを初期化しました: ${projectDir}`);
    console.log('\n次のステップ:');
    console.log('1. Kiro IDEを開く');
    console.log(`2. ${projectDir}/000-requirements.md を開く`);
    console.log('3. 仕様書生成を実行');
    console.log('4. 完了後、make sync-spec で同期');
    
    return projectDir;
  }

  /**
   * 仕様書の完成度をチェック
   */
  async validateSpec(specDir) {
    const requiredFiles = [
      '001-project-overview.md',
      '002-user-stories.md',
      '003-technical-design.md',
      '004-api-specification.md',
      '005-database-schema.md',
      '006-implementation-tasks.md'
    ];
    
    const validation = {
      complete: true,
      missing: [],
      files: {}
    };
    
    for (const file of requiredFiles) {
      const filePath = path.join(specDir, file);
      try {
        const stat = await fs.stat(filePath);
        validation.files[file] = {
          exists: true,
          size: stat.size,
          modified: stat.mtime
        };
      } catch {
        validation.complete = false;
        validation.missing.push(file);
        validation.files[file] = {
          exists: false
        };
      }
    }
    
    return validation;
  }

  /**
   * 仕様書から実装用のメタデータを生成
   */
  async generateImplementationMetadata(specDir) {
    const metadata = {
      generatedAt: new Date().toISOString(),
      specDir: specDir,
      tasks: [],
      dependencies: [],
      estimatedTime: 0
    };
    
    try {
      // タスクリストを解析
      const tasksContent = await fs.readFile(
        path.join(specDir, '006-implementation-tasks.md'),
        'utf-8'
      );
      
      // タスクを抽出（簡易パーサー）
      const taskRegex = /- \[ \] (.+)/g;
      let match;
      while ((match = taskRegex.exec(tasksContent)) !== null) {
        metadata.tasks.push({
          description: match[1],
          completed: false,
          estimatedHours: 1 // デフォルト値
        });
      }
      
      metadata.estimatedTime = metadata.tasks.length;
      
      // 技術設計から依存関係を抽出
      const designContent = await fs.readFile(
        path.join(specDir, '003-technical-design.md'),
        'utf-8'
      );
      
      // npm パッケージを抽出
      const packageRegex = /@?[\w-/]+@[\d.]+/g;
      const packages = designContent.match(packageRegex) || [];
      metadata.dependencies = [...new Set(packages)];
      
    } catch (error) {
      console.warn('⚠️ メタデータ生成中に一部エラー:', error.message);
    }
    
    await fs.writeFile(
      path.join(specDir, 'implementation.meta.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    return metadata;
  }

  /**
   * Kiroのhooksを設定
   */
  async setupHooks() {
    const hooks = [
      {
        name: 'spec-validation',
        content: `#!/bin/bash
# 仕様書の整合性をチェック
node scripts/kiro-bridge.js validate $SPEC_DIR
`
      },
      {
        name: 'implementation-ready',
        content: `#!/bin/bash
# 実装準備完了を通知
echo "✅ 仕様書が完成しました。実装を開始できます。"
make sync-spec
`
      }
    ];
    
    for (const hook of hooks) {
      const hookPath = path.join(this.hooksDir, `${hook.name}.sh`);
      await fs.writeFile(hookPath, hook.content);
      await fs.chmod(hookPath, '755');
    }
    
    console.log('✅ Kiro hooksを設定しました');
  }
}

// CLIコマンド処理
async function main() {
  const bridge = new KiroBridge();
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  try {
    switch (command) {
      case 'init':
        await bridge.init(args.join(' '));
        break;
        
      case 'validate':
        const specDir = args[0] || path.join(bridge.specsDir, 'latest');
        const validation = await bridge.validateSpec(specDir);
        console.log('仕様書検証結果:', JSON.stringify(validation, null, 2));
        if (!validation.complete) {
          console.error('❌ 不足ファイル:', validation.missing.join(', '));
          process.exit(1);
        }
        break;
        
      case 'metadata':
        const metaSpecDir = args[0] || path.join(bridge.specsDir, 'latest');
        const metadata = await bridge.generateImplementationMetadata(metaSpecDir);
        console.log('実装メタデータ:', JSON.stringify(metadata, null, 2));
        break;
        
      case 'setup-hooks':
        await bridge.setupHooks();
        break;
        
      default:
        console.log(`
使用方法:
  node scripts/kiro-bridge.js <command> [args]

コマンド:
  init <requirements>  - 新しい仕様書プロジェクトを初期化
  validate [dir]       - 仕様書の完成度をチェック
  metadata [dir]       - 実装用メタデータを生成
  setup-hooks         - Kiro hooksを設定
`);
    }
  } catch (error) {
    console.error('❌ エラー:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = KiroBridge;