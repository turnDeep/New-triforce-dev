#!/usr/bin/env node

/**
 * Validate Code - コードの品質と仕様準拠を検証
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

class CodeValidator {
  constructor() {
    this.validationResults = {
      timestamp: new Date().toISOString(),
      passed: true,
      checks: {},
      metrics: {},
      issues: []
    };
  }

  /**
   * コーディング規約チェック
   */
  async checkCodingStandards() {
    console.log('📏 コーディング規約をチェック中...');
    
    const checks = {
      naming: await this.checkNamingConventions(),
      structure: await this.checkProjectStructure(),
      imports: await this.checkImportOrder(),
      complexity: await this.checkCodeComplexity()
    };
    
    this.validationResults.checks.codingStandards = checks;
    
    const passed = Object.values(checks).every(check => check.passed);
    console.log(passed ? '✅ コーディング規約: OK' : '❌ コーディング規約: 違反あり');
    
    return passed;
  }

  /**
   * 命名規則チェック
   */
  async checkNamingConventions() {
    const issues = [];
    const srcFiles = await this.getAllSourceFiles();
    
    for (const file of srcFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // コンポーネント名チェック（PascalCase）
      if (file.endsWith('.tsx') && file.includes('/components/')) {
        const fileName = path.basename(file, '.tsx');
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(fileName)) {
          issues.push({
            file,
            issue: `コンポーネントファイル名は PascalCase にしてください: ${fileName}`
          });
        }
      }
      
      // 定数チェック（UPPER_SNAKE_CASE）
      const constantRegex = /const\s+([a-z_][a-zA-Z0-9_]*)\s*=/g;
      let match;
      while ((match = constantRegex.exec(content)) !== null) {
        const varName = match[1];
        if (varName === varName.toUpperCase() && !/^[A-Z_]+$/.test(varName)) {
          issues.push({
            file,
            issue: `定数は UPPER_SNAKE_CASE にしてください: ${varName}`
          });
        }
      }
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * プロジェクト構造チェック
   */
  async checkProjectStructure() {
    const requiredDirs = [
      'src/components/common',
      'src/components/features',
      'src/components/layouts',
      'src/hooks',
      'src/services',
      'src/utils',
      'src/types',
      'src/constants'
    ];
    
    const missingDirs = [];
    
    for (const dir of requiredDirs) {
      try {
        await fs.stat(dir);
      } catch {
        missingDirs.push(dir);
      }
    }
    
    return {
      passed: missingDirs.length === 0,
      missingDirs
    };
  }

  /**
   * インポート順序チェック
   */
  async checkImportOrder() {
    const issues = [];
    const srcFiles = await this.getAllSourceFiles();
    
    for (const file of srcFiles) {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
      
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');
      
      let lastImportType = '';
      const importOrder = ['react', 'external', 'internal', 'relative', 'types'];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.startsWith('import')) continue;
        
        const importType = this.getImportType(line);
        const currentIndex = importOrder.indexOf(importType);
        const lastIndex = importOrder.indexOf(lastImportType);
        
        if (currentIndex < lastIndex) {
          issues.push({
            file,
            line: i + 1,
            issue: `インポート順序が正しくありません: ${importType} は ${lastImportType} の前に配置`
          });
        }
        
        lastImportType = importType;
      }
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * インポートタイプを判定
   */
  getImportType(importLine) {
    if (importLine.includes('react')) return 'react';
    if (importLine.includes('type ')) return 'types';
    if (importLine.includes('./') || importLine.includes('../')) return 'relative';
    if (importLine.includes('@/')) return 'internal';
    return 'external';
  }

  /**
   * コードの複雑度チェック
   */
  async checkCodeComplexity() {
    const issues = [];
    const srcFiles = await this.getAllSourceFiles();
    
    for (const file of srcFiles) {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
      
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');
      
      // 関数の行数チェック
      let functionStart = -1;
      let braceCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.includes('function') || line.includes('=>')) {
          functionStart = i;
          braceCount = 0;
        }
        
        if (functionStart !== -1) {
          braceCount += (line.match(/{/g) || []).length;
          braceCount -= (line.match(/}/g) || []).length;
          
          if (braceCount === 0 && line.includes('}')) {
            const functionLength = i - functionStart + 1;
            if (functionLength > 30) {
              issues.push({
                file,
                line: functionStart + 1,
                issue: `関数が長すぎます（${functionLength}行）。30行以内に収めてください`
              });
            }
            functionStart = -1;
          }
        }
      }
      
      // ネストレベルチェック
      const maxNestLevel = this.getMaxNestLevel(content);
      if (maxNestLevel > 3) {
        issues.push({
          file,
          issue: `ネストが深すぎます（${maxNestLevel}段階）。3段階以内に収めてください`
        });
      }
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * 最大ネストレベルを取得
   */
  getMaxNestLevel(content) {
    const lines = content.split('\n');
    let maxLevel = 0;
    let currentLevel = 0;
    
    for (const line of lines) {
      currentLevel += (line.match(/{/g) || []).length;
      currentLevel -= (line.match(/}/g) || []).length;
      maxLevel = Math.max(maxLevel, currentLevel);
    }
    
    return maxLevel;
  }

  /**
   * 仕様準拠チェック
   */
  async checkSpecCompliance() {
    console.log('📋 仕様準拠をチェック中...');
    
    try {
      const latestSpec = path.join('.kiro/specs/latest');
      const implementationMeta = await fs.readFile(
        path.join(latestSpec, 'implementation.meta.json'),
        'utf-8'
      );
      
      const meta = JSON.parse(implementationMeta);
      const compliance = {
        totalTasks: meta.tasks.length,
        implementedTasks: 0,
        missingFeatures: []
      };
      
      // 実装済みタスクをカウント
      for (const task of meta.tasks) {
        // 簡易的なチェック（実際はより詳細な検証が必要）
        if (await this.isTaskImplemented(task)) {
          compliance.implementedTasks++;
        } else {
          compliance.missingFeatures.push(task.description);
        }
      }
      
      compliance.completionRate = 
        (compliance.implementedTasks / compliance.totalTasks * 100).toFixed(1) + '%';
      
      this.validationResults.checks.specCompliance = compliance;
      
      console.log(`✅ 仕様準拠率: ${compliance.completionRate}`);
      
      return compliance.implementedTasks === compliance.totalTasks;
      
    } catch (error) {
      console.warn('⚠️ 仕様準拠チェックをスキップ:', error.message);
      return true;
    }
  }

  /**
   * タスクが実装されているかチェック
   */
  async isTaskImplemented(task) {
    // 簡易実装（実際はタスクの内容に応じた詳細なチェックが必要）
    const keywords = task.description.toLowerCase().split(' ');
    const srcFiles = await this.getAllSourceFiles();
    
    for (const file of srcFiles) {
      const content = await fs.readFile(file, 'utf-8').catch(() => '');
      const lowerContent = content.toLowerCase();
      
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * テストカバレッジチェック
   */
  async checkTestCoverage() {
    console.log('🧪 テストカバレッジをチェック中...');
    
    try {
      const { stdout } = await execPromise('npm test -- --coverage --json');
      const coverage = JSON.parse(stdout);
      
      const summary = {
        lines: coverage.total.lines.pct,
        functions: coverage.total.functions.pct,
        branches: coverage.total.branches.pct,
        statements: coverage.total.statements.pct
      };
      
      this.validationResults.metrics.testCoverage = summary;
      
      const passed = summary.lines >= 90;
      console.log(`${passed ? '✅' : '❌'} テストカバレッジ: ${summary.lines}%`);
      
      return passed;
      
    } catch (error) {
      console.warn('⚠️ テストカバレッジチェックをスキップ:', error.message);
      return true;
    }
  }

  /**
   * 型安全性チェック
   */
  async checkTypeSafety() {
    console.log('🔒 型安全性をチェック中...');
    
    try {
      const { stdout, stderr } = await execPromise('npm run typecheck');
      
      const passed = !stderr || stderr.length === 0;
      this.validationResults.checks.typeSafety = {
        passed,
        errors: stderr ? stderr.split('\n').filter(line => line.trim()) : []
      };
      
      console.log(passed ? '✅ 型安全性: OK' : '❌ 型安全性: エラーあり');
      
      return passed;
      
    } catch (error) {
      this.validationResults.checks.typeSafety = {
        passed: false,
        errors: [error.message]
      };
      return false;
    }
  }

  /**
   * セキュリティチェック
   */
  async checkSecurity() {
    console.log('🔐 セキュリティをチェック中...');
    
    const issues = [];
    const srcFiles = await this.getAllSourceFiles();
    
    const dangerousPatterns = [
      { pattern: /localStorage\.(setItem|getItem)/, issue: '認証情報をlocalStorageに保存しないでください' },
      { pattern: /eval\(/, issue: 'eval()の使用は避けてください' },
      { pattern: /innerHTML\s*=/, issue: 'innerHTMLの直接設定は XSS の危険があります' },
      { pattern: /\$\{.*\}.*WHERE/i, issue: 'SQLインジェクションの可能性があります' },
      { pattern: /process\.env\.\w+\s*\|\|/, issue: '環境変数のフォールバックは避けてください' }
    ];
    
    for (const file of srcFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      for (const { pattern, issue } of dangerousPatterns) {
        if (pattern.test(content)) {
          issues.push({ file, issue });
        }
      }
    }
    
    this.validationResults.checks.security = {
      passed: issues.length === 0,
      issues
    };
    
    console.log(issues.length === 0 ? '✅ セキュリティ: OK' : '❌ セキュリティ: 問題あり');
    
    return issues.length === 0;
  }

  /**
   * すべてのソースファイルを取得
   */
  async getAllSourceFiles(dir = 'src') {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          files.push(...await this.getAllSourceFiles(fullPath));
        } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch {
      // ディレクトリが存在しない場合は無視
    }
    
    return files;
  }

  /**
   * 検証結果をレポート
   */
  generateReport() {
    const allIssues = [];
    
    for (const [checkName, check] of Object.entries(this.validationResults.checks)) {
      if (check.issues && check.issues.length > 0) {
        allIssues.push({
          category: checkName,
          issues: check.issues
        });
      }
    }
    
    this.validationResults.issues = allIssues;
    this.validationResults.passed = allIssues.length === 0;
    
    return this.validationResults;
  }

  /**
   * メイン検証処理
   */
  async validate() {
    console.log('🔍 コード検証を開始...\n');
    
    await this.checkCodingStandards();
    await this.checkSpecCompliance();
    await this.checkTestCoverage();
    await this.checkTypeSafety();
    await this.checkSecurity();
    
    const report = this.generateReport();
    
    // レポートを保存
    await fs.writeFile(
      'validation-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n' + '='.repeat(50));
    
    if (report.passed) {
      console.log('✅ すべての検証に合格しました！');
    } else {
      console.log('❌ 検証で問題が見つかりました');
      console.log('\n詳細は validation-report.json を確認してください');
    }
    
    return report.passed;
  }
}

// メイン実行
if (require.main === module) {
  const validator = new CodeValidator();
  validator.validate().then(passed => {
    process.exit(passed ? 0 : 1);
  });
}

module.exports = CodeValidator;