#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'node:path';
import { detectProject } from './detectors.js';
import { scanProject } from './scanners.js';
import {
  displayProjectInfo,
  displayScanSummary,
  selectItemsToClean,
  confirmCleanup,
  executeCleanup,
} from './ui.js';
import { formatSize } from './utils.js';

const program = new Command();

program
  .name('cmpj')
  .description('CleanMyProj — 项目缓存清理工具，释放本地存储空间')
  .version('1.3.0')
  .argument('[path]', '项目路径（默认为当前目录）')
  .option('-c, --check', '仅检查缓存占用，不进入交互模式')
  .option('-y, --yes', '跳过确认直接清理（危险操作，请谨慎使用）')
  .action(async (projectPath: string | undefined, options: { check?: boolean; yes?: boolean }) => {
    try {
      const rootPath = path.resolve(projectPath || process.cwd());

      const projectInfo = detectProject(rootPath);
      displayProjectInfo(projectInfo);

      const scanResult = scanProject(projectInfo);
      displayScanSummary(scanResult);

      if (scanResult.items.length === 0) {
        process.exit(0);
      }

      if (options.check) {
        console.log(chalk.gray('  (--check 模式，不执行清理)'));
        console.log();
        process.exit(0);
      }

      const selectedItems = await selectItemsToClean(scanResult);

      if (!selectedItems || selectedItems.length === 0) {
        console.log(chalk.gray('\n  未选择任何项目，退出。\n'));
        process.exit(0);
      }

      if (options.yes) {
        console.log(chalk.yellow('\n  ⚠️  --yes 模式：跳过确认直接清理\n'));
      } else {
        const confirmed = await confirmCleanup(selectedItems);
        if (!confirmed) {
          process.exit(0);
        }
      }

      await executeCleanup(selectedItems);
    } catch (error: any) {
      console.error(chalk.red(`\n  ❌ 发生错误: ${error?.message || error}\n`));
      process.exit(1);
    }
  });

program.parse();
