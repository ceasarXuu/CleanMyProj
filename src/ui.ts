import { checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { type CacheItem, type ProjectInfo, type ScanResult } from './types.js';
import { formatSize, colorSize } from './utils.js';
import { cleanItems } from './cleaner.js';

export function displayProjectInfo(projectInfo: ProjectInfo): void {
  console.log();
  console.log(chalk.bold.cyan('━'.repeat(60)));
  console.log(chalk.bold.cyan('  CleanMyProj — 项目缓存清理工具'));
  console.log(chalk.bold.cyan('━'.repeat(60)));
  console.log();
  console.log(chalk.gray('  项目路径: ') + chalk.white(projectInfo.rootPath));
  console.log(
    chalk.gray('  检测类型: ') +
      chalk.yellow(projectInfo.type === 'unknown' ? '未识别项目' : projectInfo.type)
  );
  if (projectInfo.frameworks.length > 0) {
    console.log(
      chalk.gray('  框架技术: ') + chalk.green(projectInfo.frameworks.join(', '))
    );
  }
  console.log();
}

export function displayScanSummary(scanResult: ScanResult): void {
  const { items, totalSize } = scanResult;

  if (items.length === 0) {
    console.log(chalk.green('  ✅ 未发现可清理的缓存，项目很干净！'));
    console.log();
    return;
  }

  console.log(
    chalk.gray('  共发现 ') +
      chalk.yellow.bold(items.length.toString()) +
      chalk.gray(' 项缓存，总计占用 ') +
      colorSize(formatSize(totalSize), totalSize)
  );
  console.log();
}

export async function selectItemsToClean(
  scanResult: ScanResult
): Promise<CacheItem[] | null> {
  const { items, totalSize } = scanResult;
  if (items.length === 0) return null;

  const choices = [
    {
      name: `${chalk.bold('✦ 全选 (All)')} ${chalk.gray('— 总计: ')}${colorSize(formatSize(totalSize), totalSize)}`,
      value: '__all__',
      checked: false,
    },
    ...items.map((item) => ({
      name: `  ${chalk.white(item.label.padEnd(40))} ${colorSize(formatSize(item.size).padStart(10), item.size)}\n      ${chalk.gray('▸ ' + item.description)}\n      ${chalk.dim('⚠ ' + item.impact)}`,
      value: item.id,
      checked: false,
    })),
  ];

  const selected = await checkbox({
    message: chalk.bold('选择要清理的项目 (空格勾选, Enter 确认):'),
    choices,
    loop: false,
  });

  if (!selected || selected.length === 0) return null;

  if (selected.includes('__all__')) {
    return [...items];
  }

  return items.filter((item) => selected.includes(item.id));
}

export async function confirmCleanup(selectedItems: CacheItem[]): Promise<boolean> {
  const totalSize = selectedItems.reduce((sum, item) => sum + item.size, 0);

  console.log();
  console.log(chalk.bold.yellow('  ⚠️  即将清理以下项目:'));
  console.log(chalk.gray('  ' + '─'.repeat(50)));

  for (const item of selectedItems) {
    console.log(
      chalk.white(`    • ${item.label} `) + colorSize(formatSize(item.size), item.size)
    );
    console.log(chalk.dim(`      ⚠ ${item.impact}`));
  }

  console.log(chalk.gray('  ' + '─'.repeat(50)));
  console.log(chalk.bold('    总计释放: ') + colorSize(formatSize(totalSize), totalSize));
  console.log();

  const firstConfirm = await confirm({
    message: chalk.red.bold('⚠️  文件将被移至回收站（系统废纸篓），确认继续？'),
    default: false,
  });

  if (!firstConfirm) {
    console.log(chalk.gray('\n  已取消清理操作。\n'));
    return false;
  }

  console.log();
  console.log(
    chalk.red.bold('  🔴 最终确认：此操作将删除所选缓存文件，虽然会移至回收站但请确认无误！')
  );
  console.log(chalk.gray('  如确认删除，请再次按 Enter；如需取消，请输入 n 或按 Ctrl+C'));
  console.log();

  const secondConfirm = await confirm({
    message: chalk.red.bold('确认执行清理？'),
    default: false,
  });

  if (!secondConfirm) {
    console.log(chalk.gray('\n  已取消清理操作。\n'));
    return false;
  }

  return true;
}

export async function executeCleanup(selectedItems: CacheItem[]): Promise<void> {
  const spinner = ora({ text: '正在清理缓存...', color: 'cyan' }).start();
  const results = await cleanItems(selectedItems);
  spinner.stop();

  console.log();
  console.log(chalk.bold.cyan('  清理结果:'));
  console.log(chalk.gray('  ' + '─'.repeat(50)));

  let totalCleaned = 0;
  let failCount = 0;

  for (const result of results) {
    if (result.success) {
      totalCleaned += result.size;
      console.log(
        chalk.green('  ✓ ') +
          chalk.white(result.label.padEnd(38)) +
          colorSize(formatSize(result.size), result.size)
      );
    } else {
      failCount++;
      console.log(
        chalk.red('  ✗ ') + chalk.white(result.label.padEnd(38)) + chalk.red('失败')
      );
      if (result.error) {
        console.log(chalk.gray(`    错误: ${result.error}`));
      }
    }
  }

  console.log(chalk.gray('  ' + '─'.repeat(50)));

  if (totalCleaned > 0) {
    console.log(
      chalk.green.bold('  ✅ 成功释放: ') + colorSize(formatSize(totalCleaned), totalCleaned)
    );
  }
  if (failCount > 0) {
    console.log(chalk.red(`  ❌ ${failCount} 项清理失败`));
  }

  console.log();
  console.log(chalk.gray('  已删除的文件可在系统回收站中恢复。'));
  console.log();
}
