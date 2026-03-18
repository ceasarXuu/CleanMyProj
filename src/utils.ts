import chalk from 'chalk';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Format bytes to human readable string (MB/GB)
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  if (i < 2) {
    return `${size.toFixed(1)} ${units[i]}`;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}

/**
 * Calculate total size of a directory recursively
 */
export function getDirSize(dirPath: string): number {
  if (!fs.existsSync(dirPath)) return 0;

  let totalSize = 0;
  try {
    const stat = fs.statSync(dirPath);
    if (stat.isFile()) return stat.size;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      try {
        if (entry.isSymbolicLink()) continue;
        if (entry.isDirectory()) {
          totalSize += getDirSize(fullPath);
        } else {
          totalSize += fs.statSync(fullPath).size;
        }
      } catch {
        // Skip files we can't read
      }
    }
  } catch {
    // Skip directories we can't access
  }
  return totalSize;
}

export function dirExists(p: string): boolean {
  try {
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

export function fileExists(p: string): boolean {
  try {
    return fs.existsSync(p) && fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

export function colorSize(sizeStr: string, bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return chalk.red.bold(sizeStr);
  if (bytes >= 100 * 1024 * 1024) return chalk.yellow.bold(sizeStr);
  if (bytes >= 10 * 1024 * 1024) return chalk.yellow(sizeStr);
  return chalk.green(sizeStr);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
