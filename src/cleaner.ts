import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { CacheItem, CleanupResult } from './types';

/**
 * Clean a single cache item by moving it to trash
 */
export async function cleanItem(item: CacheItem): Promise<CleanupResult> {
  const result: CleanupResult = {
    id: item.id,
    label: item.label,
    paths: item.paths,
    size: item.size,
    success: false,
  };

  try {
    // Special handling for Docker
    if (item.id === 'docker-system') {
      execSync('docker system prune -af --volumes', { stdio: 'pipe' });
      result.success = true;
      return result;
    }

    // Use trash module for safe deletion (moves to OS trash/recycle bin)
    const trash = (await import('trash')).default;

    for (const targetPath of item.paths) {
      if (!fs.existsSync(targetPath)) continue;

      const stat = fs.statSync(targetPath);

      if (stat.isDirectory()) {
        // Trash the entire directory
        await trash([targetPath]);
      } else {
        // Trash individual file
        await trash([targetPath]);
      }
    }

    result.success = true;
  } catch (error: any) {
    result.success = false;
    result.error = error?.message || String(error);
  }

  return result;
}

/**
 * Clean multiple items sequentially
 */
export async function cleanItems(items: CacheItem[]): Promise<CleanupResult[]> {
  const results: CleanupResult[] = [];

  for (const item of items) {
    const result = await cleanItem(item);
    results.push(result);
  }

  return results;
}
