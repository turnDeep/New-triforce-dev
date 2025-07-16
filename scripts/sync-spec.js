#!/usr/bin/env node

/**
 * Sync Spec - Kiroの仕様書をプロジェクトと同期
 */

const fs = require('fs').promises;
const path = require('path');

class SpecSynchronizer {
  constructor() {
    this.specsDir = path.join(process.cwd(), '.kiro/specs');
    this.srcDir = path.join(process.cwd(), 'src');
  }

  /**
   * 最新の仕様書を取得
   */
  async getLatestSpec() {
    const specs = await fs.readdir(this.specsDir);
    const validSpecs = specs.filter(s => s !== 'template' && s !== 'latest');
    
    if (validSpecs.length === 0) {
      throw new Error('仕様書が見つかりません');
    }
    
    // タイムスタンプでソート
    validSpecs.sort((a, b) => b.localeCompare(a));
    return path.join(this.specsDir, validSpecs[0]);
  }

  /**
   * 仕様書から型定義を生成
   */
  async generateTypes(specDir) {
    console.log('📝 型定義を生成中...');
    
    try {
      const schemaContent = await fs.readFile(
        path.join(specDir, '005-database-schema.md'),
        'utf-8'
      );
      
      // 簡易的な型定義生成（実際はより高度なパーサーが必要）
      const typeDefinitions = this.parseSchemaToTypes(schemaContent);
      
      await fs.mkdir(path.join(this.srcDir, 'types'), { recursive: true });
      await fs.writeFile(
        path.join(this.srcDir, 'types', 'generated.types.ts'),
        typeDefinitions
      );
      
      console.log('✅ 型定義を生成しました');
    } catch (error) {
      console.warn('⚠️ 型定義生成をスキップ:', error.message);
    }
  }

  /**
   * スキーマから TypeScript 型定義を生成
   */
  parseSchemaToTypes(schemaContent) {
    let types = `// 自動生成された型定義
// 生成日時: ${new Date().toISOString()}
// ⚠️ このファイルは自動生成されます。直接編集しないでください。

`;

    // interface定義を抽出
    const interfaceRegex = /interface\s+(\w+)\s*{([^}]+)}/g;
    let match;
    
    while ((match = interfaceRegex.exec(schemaContent)) !== null) {
      types += `export interface ${match[1]} ${match[0].substring(match[0].indexOf('{'))}\n\n`;
    }

    // type定義を抽出
    const typeRegex = /type\s+(\w+)\s*=\s*([^;]+);/g;
    
    while ((match = typeRegex.exec(schemaContent)) !== null) {
      types += `export ${match[0]}\n\n`;
    }

    return types;
  }

  /**
   * API仕様からルートスタブを生成
   */
  async generateApiStubs(specDir) {
    console.log('🔌 APIスタブを生成中...');
    
    try {
      const apiContent = await fs.readFile(
        path.join(specDir, '004-api-specification.md'),
        'utf-8'
      );
      
      const routes = this.parseApiRoutes(apiContent);
      
      await fs.mkdir(path.join(this.srcDir, 'api'), { recursive: true });
      
      for (const route of routes) {
        const stubContent = this.generateRouteStub(route);
        const fileName = route.path.replace(/\//g, '-').substring(1) + '.ts';
        
        await fs.writeFile(
          path.join(this.srcDir, 'api', fileName),
          stubContent
        );
      }
      
      console.log(`✅ ${routes.length}個のAPIスタブを生成しました`);
    } catch (error) {
      console.warn('⚠️ APIスタブ生成をスキップ:', error.message);
    }
  }

  /**
   * API仕様からルート情報を抽出
   */
  parseApiRoutes(apiContent) {
    const routes = [];
    const routeRegex = /(GET|POST|PUT|DELETE|PATCH)\s+(\/[\w\-\/{}]+)/g;
    let match;
    
    while ((match = routeRegex.exec(apiContent)) !== null) {
      routes.push({
        method: match[1],
        path: match[2]
      });
    }
    
    return routes;
  }

  /**
   * ルートスタブを生成
   */
  generateRouteStub(route) {
    return `// ${route.method} ${route.path}
// 自動生成されたAPIスタブ

import { Request, Response, NextFunction } from 'express';

export async function handler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // TODO: 実装を追加
    res.json({
      message: '${route.method} ${route.path} - Not implemented yet'
    });
  } catch (error) {
    next(error);
  }
}
`;
  }

  /**
   * タスクリストを生成
   */
  async generateTaskList(specDir) {
    console.log('📋 タスクリストを生成中...');
    
    try {
      const tasksContent = await fs.readFile(
        path.join(specDir, '006-implementation-tasks.md'),
        'utf-8'
      );
      
      const tasks = this.parseTasks(tasksContent);
      
      await fs.writeFile(
        path.join(process.cwd(), 'TASKS.md'),
        this.formatTaskList(tasks)
      );
      
      console.log(`✅ ${tasks.length}個のタスクを生成しました`);
    } catch (error) {
      console.warn('⚠️ タスクリスト生成をスキップ:', error.message);
    }
  }

  /**
   * タスクを解析
   */
  parseTasks(tasksContent) {
    const tasks = [];
    const lines = tasksContent.split('\n');
    let currentPhase = '';
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        currentPhase = line.substring(3).trim();
      } else if (line.match(/- \[ \]/)) {
        tasks.push({
          phase: currentPhase,
          description: line.replace(/- \[ \]/, '').trim(),
          completed: false
        });
      }
    }
    
    return tasks;
  }

  /**
   * タスクリストをフォーマット
   */
  formatTaskList(tasks) {
    let content = `# 実装タスクリスト
生成日時: ${new Date().toISOString()}

## 進捗サマリー
- 総タスク数: ${tasks.length}
- 完了: 0
- 進捗率: 0%

`;

    let currentPhase = '';
    for (const task of tasks) {
      if (task.phase !== currentPhase) {
        currentPhase = task.phase;
        content += `\n## ${currentPhase}\n\n`;
      }
      content += `- [ ] ${task.description}\n`;
    }

    return content;
  }

  /**
   * 実装進捗を更新
   */
  async updateProgress() {
    const progress = {
      syncedAt: new Date().toISOString(),
      specDir: await this.getLatestSpec(),
      generated: {
        types: true,
        apiStubs: true,
        taskList: true
      }
    };
    
    await fs.writeFile(
      path.join(this.specsDir, 'sync-progress.json'),
      JSON.stringify(progress, null, 2)
    );
  }

  /**
   * メイン同期処理
   */
  async sync() {
    try {
      console.log('🔄 仕様書を同期中...\n');
      
      const latestSpec = await this.getLatestSpec();
      console.log(`📁 対象仕様書: ${path.basename(latestSpec)}\n`);
      
      // latestシンボリックリンクを更新
      const latestLink = path.join(this.specsDir, 'latest');
      try {
        await fs.unlink(latestLink);
      } catch (e) {
        // リンクが存在しない場合は無視
      }
      await fs.symlink(latestSpec, latestLink);
      
      // 各種生成処理
      await this.generateTypes(latestSpec);
      await this.generateApiStubs(latestSpec);
      await this.generateTaskList(latestSpec);
      
      // 進捗を記録
      await this.updateProgress();
      
      console.log('\n✅ 同期完了！実装を開始できます。');
      console.log('\n次のコマンドを実行:');
      console.log('  claude');
      console.log('  > /project:implement-spec');
      
    } catch (error) {
      console.error('❌ 同期エラー:', error.message);
      process.exit(1);
    }
  }
}

// メイン実行
if (require.main === module) {
  const synchronizer = new SpecSynchronizer();
  synchronizer.sync();
}

module.exports = SpecSynchronizer;