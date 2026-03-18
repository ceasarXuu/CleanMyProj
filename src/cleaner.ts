import * as fs from 'node:fs';
import { execSync } from 'node:child_process';
import trash from 'trash';
import { type CacheItem, type CleanupResult } from './types.js';

export async function cleanItem(item: CacheItem): Promise<CleanupResult> {
  const result: CleanupResult = {
    id: item.id,
    label: item.label,
    paths: item.paths,
    size: item.size,
    success: false,
  };

  try {
    if (item.id === 'docker-system') {
      execSync('docker system prune -af --volumes', { stdio: 'pipe' });
      result.success = true;
      return result;
    }

    for (const targetPath of item.paths) {
      if (!fs.existsSync(targetPath)) continue;
      await trash(targetPath);
    }

    result.success = true;
  } catch (error: any) {
    result.success = false;
    result.error = error?.message || String(error);
  }

  return result;
}

export async function cleanItems(items: CacheItem[]): Promise<CleanupResult[]> {
  const results: CleanupResult[] = [];
  for (const item of items) {
    results.push(await cleanItem(item));
  }
  return results;
}
