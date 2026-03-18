import * as path from 'path';
import { CacheItem, ProjectInfo, ProjectType, ScanResult } from './types';
import { dirExists, fileExists, getDirSize, formatSize } from './utils';

/**
 * Define all possible cache targets for each project type
 */
interface CacheTarget {
  id: string;
  label: string;
  paths: (root: string) => string[];
  description: string;
  /** Which project types this target applies to (empty = all) */
  types: ProjectType[];
}

const CACHE_TARGETS: CacheTarget[] = [
  // === Node.js universal ===
  {
    id: 'node_modules',
    label: 'node_modules',
    paths: (r) => [path.join(r, 'node_modules')],
    description: 'Installed npm/yarn/pnpm dependencies',
    types: [],
  },
  {
    id: 'npm-cache',
    label: 'npm cache',
    paths: () => [
      path.join(process.env.HOME || '', '.npm/_cacache'),
      path.join(process.env.HOME || '', '.npm/_logs'),
    ],
    description: 'Global npm cache directory',
    types: [],
  },
  {
    id: 'yarn-cache',
    label: 'yarn cache',
    paths: () => [
      path.join(process.env.HOME || '', '.cache/yarn'),
      path.join(process.env.HOME || '', '.yarn/cache'),
      path.join(process.env.HOME || '', '.yarn/berry/cache'),
    ],
    description: 'Global yarn cache directory',
    types: [],
  },
  {
    id: 'pnpm-store',
    label: 'pnpm store',
    paths: () => [
      path.join(process.env.HOME || '', '.local/share/pnpm/store/v3'),
      path.join(process.env.HOME || '', '.pnpm-store'),
    ],
    description: 'Global pnpm content-addressable store',
    types: [],
  },

  // === Next.js ===
  {
    id: 'next-cache',
    label: '.next (Next.js build cache)',
    paths: (r) => [path.join(r, '.next')],
    description: 'Next.js build output and cache',
    types: ['nextjs'],
  },

  // === Nuxt ===
  {
    id: 'nuxt-cache',
    label: '.nuxt (Nuxt build cache)',
    paths: (r) => [path.join(r, '.nuxt'), path.join(r, '.output')],
    description: 'Nuxt build output and generated files',
    types: ['nuxt'],
  },

  // === Vite ===
  {
    id: 'vite-cache',
    label: 'node_modules/.vite (Vite cache)',
    paths: (r) => [path.join(r, 'node_modules/.vite')],
    description: 'Vite pre-bundling cache',
    types: ['vite', 'node'],
  },

  // === Gatsby ===
  {
    id: 'gatsby-cache',
    label: '.cache (Gatsby cache)',
    paths: (r) => [path.join(r, '.cache'), path.join(r, 'public')],
    description: 'Gatsby cache and public build output',
    types: ['gatsby'],
  },

  // === Angular ===
  {
    id: 'angular-cache',
    label: '.angular (Angular cache)',
    paths: (r) => [
      path.join(r, '.angular'),
      path.join(r, 'dist'),
    ],
    description: 'Angular CLI build cache and dist output',
    types: ['angular'],
  },

  // === SvelteKit ===
  {
    id: 'svelte-cache',
    label: '.svelte-kit (SvelteKit cache)',
    paths: (r) => [path.join(r, '.svelte-kit')],
    description: 'SvelteKit generated files',
    types: ['svelte'],
  },

  // === Turbo ===
  {
    id: 'turbo-cache',
    label: '.turbo (Turborepo cache)',
    paths: (r) => [
      path.join(r, '.turbo'),
      path.join(r, 'node_modules/.cache/turbo'),
    ],
    description: 'Turborepo local cache',
    types: [],
  },

  // === Webpack ===
  {
    id: 'webpack-cache',
    label: 'node_modules/.cache (Webpack/Babel)',
    paths: (r) => [path.join(r, 'node_modules/.cache')],
    description: 'Webpack, Babel, and other tool caches in node_modules',
    types: [],
  },

  // === TypeScript ===
  {
    id: 'tsbuildinfo',
    label: '*.tsbuildinfo',
    paths: (r) => [path.join(r, 'tsconfig.tsbuildinfo')],
    description: 'TypeScript incremental build info',
    types: [],
  },

  // === ESLint ===
  {
    id: 'eslint-cache',
    label: '.eslintcache',
    paths: (r) => [path.join(r, '.eslintcache')],
    description: 'ESLint cache file',
    types: [],
  },

  // === dist / build output ===
  {
    id: 'dist-output',
    label: 'dist (build output)',
    paths: (r) => [path.join(r, 'dist')],
    description: 'Compiled/build output directory',
    types: ['node', 'vite', 'vue', 'svelte', 'angular'],
  },
  {
    id: 'build-output',
    label: 'build (build output)',
    paths: (r) => [path.join(r, 'build')],
    description: 'Build output directory',
    types: ['node', 'angular'],
  },

  // === Python ===
  {
    id: 'python-pycache',
    label: '__pycache__ (Python bytecode)',
    paths: (r) => findDirs(r, '__pycache__'),
    description: 'Python compiled bytecode cache',
    types: ['python'],
  },
  {
    id: 'python-venv',
    label: '.venv / venv (Python virtual env)',
    paths: (r) => [path.join(r, '.venv'), path.join(r, 'venv'), path.join(r, 'env')],
    description: 'Python virtual environment',
    types: ['python'],
  },
  {
    id: 'pip-cache',
    label: 'pip cache',
    paths: () => [
      path.join(process.env.HOME || '', '.cache/pip'),
    ],
    description: 'Global pip cache',
    types: ['python'],
  },
  {
    id: 'python-egg',
    label: '*.egg-info / .eggs',
    paths: (r) => findDirs(r, '.eggs'),
    description: 'Python packaging metadata',
    types: ['python'],
  },

  // === Rust ===
  {
    id: 'rust-target',
    label: 'target (Rust build)',
    paths: (r) => [path.join(r, 'target')],
    description: 'Rust compiled artifacts and build cache',
    types: ['rust'],
  },
  {
    id: 'cargo-cache',
    label: 'cargo cache',
    paths: () => [
      path.join(process.env.HOME || '', '.cargo/registry'),
      path.join(process.env.HOME || '', '.cargo/git'),
    ],
    description: 'Global Cargo registry and git cache',
    types: ['rust'],
  },

  // === Go ===
  {
    id: 'go-cache',
    label: 'go build cache',
    paths: () => [
      path.join(process.env.HOME || '', '.cache/go-build'),
    ],
    description: 'Go build cache',
    types: ['go'],
  },
  {
    id: 'go-mod-cache',
    label: 'go module cache',
    paths: () => [
      path.join(process.env.HOME || '', 'go/pkg/mod'),
    ],
    description: 'Go module cache',
    types: ['go'],
  },

  // === Flutter ===
  {
    id: 'flutter-build',
    label: 'Flutter build',
    paths: (r) => [
      path.join(r, 'build'),
      path.join(r, '.dart_tool'),
    ],
    description: 'Flutter build output and Dart tool files',
    types: ['flutter'],
  },
  {
    id: 'flutter-cache',
    label: 'Flutter pub cache',
    paths: () => [
      path.join(process.env.HOME || '', '.pub-cache'),
    ],
    description: 'Global Flutter/Dart pub cache',
    types: ['flutter'],
  },

  // === Java ===
  {
    id: 'gradle-cache',
    label: 'Gradle cache',
    paths: () => [
      path.join(process.env.HOME || '', '.gradle/caches'),
    ],
    description: 'Global Gradle cache',
    types: ['java'],
  },
  {
    id: 'maven-cache',
    label: 'Maven cache',
    paths: () => [
      path.join(process.env.HOME || '', '.m2/repository'),
    ],
    description: 'Local Maven repository',
    types: ['java'],
  },
  {
    id: 'java-build',
    label: 'build (Java/Kotlin output)',
    paths: (r) => [
      path.join(r, 'build'),
      path.join(r, 'target'),
    ],
    description: 'Gradle/Maven build output',
    types: ['java'],
  },

  // === Docker ===
  {
    id: 'docker-system',
    label: 'Docker system (images/containers/volumes)',
    paths: () => [],
    description: 'Docker unused images, containers, volumes (runs docker system prune)',
    types: [],
  },
];

/**
 * Shallow-find directories matching a name under a root (max depth 3)
 */
function findDirs(root: string, name: string, maxDepth = 3, currentDepth = 0): string[] {
  const results: string[] = [];
  if (currentDepth > maxDepth) return results;

  try {
    const fs = require('fs');
    const entries = fs.readdirSync(root, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === name && entry.isDirectory()) {
        results.push(path.join(root, entry.name));
      } else if (
        entry.isDirectory() &&
        !entry.name.startsWith('.') &&
        entry.name !== 'node_modules'
      ) {
        results.push(
          ...findDirs(path.join(root, entry.name), name, maxDepth, currentDepth + 1)
        );
      }
    }
  } catch {
    // Skip inaccessible directories
  }
  return results;
}

/**
 * Scan project for all applicable cache items
 */
export function scanProject(projectInfo: ProjectInfo): ScanResult {
  const items: CacheItem[] = [];
  const { type, rootPath } = projectInfo;

  for (const target of CACHE_TARGETS) {
    // Check if this target applies to the detected project type
    if (target.types.length > 0 && !target.types.includes(type)) {
      continue;
    }

    const resolvedPaths = target.paths(rootPath).filter((p) => {
      if (target.id === 'docker-system') return true; // Special case
      if (target.id === 'npm-cache' || target.id === 'yarn-cache' || target.id === 'pnpm-store') {
        return dirExists(p);
      }
      return dirExists(p) || fileExists(p);
    });

    if (resolvedPaths.length === 0) continue;

    let totalSize = 0;
    for (const p of resolvedPaths) {
      totalSize += getDirSize(p);
    }

    // Skip empty / zero-size items
    if (totalSize === 0 && target.id !== 'docker-system') continue;

    items.push({
      id: target.id,
      label: target.label,
      paths: resolvedPaths,
      size: totalSize,
      projectType: type,
      description: target.description,
    });
  }

  // Sort by size descending
  items.sort((a, b) => b.size - a.size);

  const totalSize = items.reduce((sum, item) => sum + item.size, 0);

  return {
    projectInfo,
    items,
    totalSize,
  };
}
