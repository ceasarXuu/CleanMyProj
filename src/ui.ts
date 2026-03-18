import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { CacheItem, CleanupResult, ProjectInfo, ScanResult } from './types';
import { formatSize, colorSize } from './utils';
import { cleanItems } from './cleaner';

/**
 * Display project info header
 */
export function displayProjectInfo(projectInfo: ProjectInfo): void {
  console.log();
  console.log(chalk.bold.cyan('━'.repeat(60)));
  console.log(chalk.bold.cyan('  CleanMyProj — 项目缓存清理工具'));
  console.log(chalk.bold.cyan('━'.repeat(60)));
  console.log();
  console.log(
    chalk.gray('  项目路径: ') + chalk.white(projectInfo.rootPath)
  );
  console.log(
    chalk.gray('  检测类型: ') +
      chalk.yellow(
        projectInfo.type === 'unknown' ? '未识别项目' : projectInfo.type
      )
  );
  if (projectInfo.frameworks.length > 0) {
    console.log(
      chalk.gray('  框架技术: ') +
        chalk.green(projectInfo.frameworks.join(', '))
    );
  }
  console.log();
}

/**
 * Display scan results summary
 */
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

/**
 * Let user select items to clean via interactive checklist
 * Returns selected items (or null if user cancels)
 */
export async function selectItemsToClean(
  scanResult: ScanResult
): Promise<CacheItem[] | null> {
  const { items, totalSize } = scanResult;

  if (items.length === 0) return null;

  // Build choices for inquirer checkbox
  const choices: Array<{
    name: string;
    value: string;
    checked: boolean;
  }> = [];

  // "All" option at the top
  choices.push({
    name: `${chalk.bold('✦ 全选 (All)')} ${chalk.gray('— 总计: ')}${colorSize(formatSize(totalSize), totalSize)}`,
    value: '__all__',
    checked: false,
  });

  // Individual items
  for (const item of items) {
    const sizeStr = formatSize(item.size).padStart(10);
    choices.push({
      name: `  ${chalk.white(item.label.padEnd(40))} ${colorSize(sizeStr, item.size)}  ${chalk.gray(item.description)}`,
      value: item.id,
      checked: false,
    });
  }

  const answer = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: chalk.bold('选择要清理的项目 (空格勾选, Enter 确认):'),
      choices,
      loop: false,
    },
  ]);

  if (!answer.selected || answer.selected.length === 0) {
    return null;
  }

  let selectedItems: CacheItem[];

  if (answer.selected.includes('__all__')) {
    // Select all items
    selectedItems = [...items];
  } else {
    selectedItems = items.filter((item) => answer.selected.includes(item.id));
  }

  return selectedItems;
}

/**
 * Double confirmation before cleanup
 * Returns true if user confirms, false if cancelled
 */
export async function confirmCleanup(
  selectedItems: CacheItem[]
): Promise<boolean> {
  const totalSize = selectedItems.reduce((sum, item) => sum + item.size, 0);

  console.log();
  console.log(chalk.bold.yellow('  ⚠️  即将清理以下项目:'));
  console.log(chalk.gray('  ' + '─'.repeat(50)));

  for (const item of selectedItems) {
    console.log(
      chalk.white(`    • ${item.label} `) +
        colorSize(formatSize(item.size), item.size)
    );
  }

  console.log(chalk.gray('  ' + '─'.repeat(50)));
  console.log(
    chalk.bold(`    总计释放: `) +
      colorSize(formatSize(totalSize), totalSize)
  );
  console.log();

  // First confirmation
  const answer1 = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: chalk.red.bold('⚠️  文件将被移至回收站（系统废纸篓），确认继续？'),
      default: false,
    },
  ]);

  if (!answer1.proceed) {
    console.log(chalk.gray('\n  已取消清理操作。\n'));
    return false;
  }

  // Second confirmation - strict
  console.log();
  console.log(
    chalk.red.bold('  🔴 最终确认：此操作将删除所选缓存文件，虽然会移至回收站但请确认无误！')
  );
  console.log(chalk.gray('  如确认删除，请再次按 Enter；如需取消，请输入 n 或按 Ctrl+C'));
  console.log();

  const answer2 = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'finalConfirm',
      message: chalk.red.bold('确认执行清理？'),
      default: false,
    },
  ]);

  if (!answer2.finalConfirm) {
    console.log(chalk.gray('\n  已取消清理操作。\n'));
    return false;
  }

  return true;
}

/**
 * Execute cleanup and display results
 */
export async function executeCleanup(selectedItems: CacheItem[]): Promise<void> {
  const spinner = ora({
    text: '正在清理缓存...',
    color: 'cyan',
  }).start();

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
        chalk.red('  ✗ ') +
          chalk.white(result.label.padEnd(38)) +
          chalk.red('失败')
      );
      if (result.error) {
        console.log(chalk.gray(`    错误: ${result.error}`));
      }
    }
  }

  console.log(chalk.gray('  ' + '─'.repeat(50)));

  if (totalCleaned > 0) {
    console.log(
      chalk.green.bold(`  ✅ 成功释放: `) +
        colorSize(formatSize(totalCleaned), totalCleaned)
    );
  }
  if (failCount > 0) {
    console.log(chalk.red(`  ❌ ${failCount} 项清理失败`));
  }

  console.log();
  console.log(chalk.gray('  已删除的文件可在系统回收站中恢复。'));
  console.log();
}
