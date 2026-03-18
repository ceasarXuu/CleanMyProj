import * as path from 'node:path';
import fs from 'node:fs';
import { type CacheItem, type ProjectInfo, type ProjectType, type ScanResult } from './types.js';
import { dirExists, fileExists, getDirSize } from './utils.js';

interface CacheTarget {
  id: string;
  label: string;
  paths: (root: string) => string[];
  description: string;
  impact: string;
  types: ProjectType[];
}

const CACHE_TARGETS: CacheTarget[] = [
  // === Node.js universal ===
  {
    id: 'node_modules',
    label: 'node_modules',
    paths: (r) => [path.join(r, 'node_modules')],
    description: 'npm/yarn/pnpm 安装的依赖包',
    impact: '需重新运行 npm install / yarn / pnpm install 恢复',
    types: [],
  },
  {
    id: 'npm-cache',
    label: 'npm cache',
    paths: () => [
      path.join(process.env.HOME || '', '.npm/_cacache'),
      path.join(process.env.HOME || '', '.npm/_logs'),
    ],
    description: 'npm 全局缓存（下载过的包的副本）',
    impact: '无影响，仅是下载缓存，下次 install 会自动重建',
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
    description: 'yarn 全局缓存',
    impact: '无影响，下次 yarn install 会重新下载包',
    types: [],
  },
  {
    id: 'pnpm-store',
    label: 'pnpm store',
    paths: () => [
      path.join(process.env.HOME || '', '.local/share/pnpm/store/v3'),
      path.join(process.env.HOME || '', '.pnpm-store'),
    ],
    description: 'pnpm 全局内容寻址存储',
    impact: '无影响，已安装的项目仍可用，新项目会重新下载',
    types: [],
  },
  // === Next.js ===
  {
    id: 'next-cache',
    label: '.next (Next.js build cache)',
    paths: (r) => [path.join(r, '.next')],
    description: 'Next.js 构建产物和缓存',
    impact: '需重新运行 next dev / next build 恢复',
    types: ['nextjs'],
  },
  // === Nuxt ===
  {
    id: 'nuxt-cache',
    label: '.nuxt (Nuxt build cache)',
    paths: (r) => [path.join(r, '.nuxt'), path.join(r, '.output')],
    description: 'Nuxt 构建产物和生成文件',
    impact: '需重新运行 nuxt dev / nuxt build 恢复',
    types: ['nuxt'],
  },
  // === Vite ===
  {
    id: 'vite-cache',
    label: 'node_modules/.vite (Vite cache)',
    paths: (r) => [path.join(r, 'node_modules/.vite')],
    description: 'Vite 预构建依赖缓存',
    impact: '无影响，下次 vite dev 会自动重新预构建',
    types: ['vite', 'node'],
  },
  // === Gatsby ===
  {
    id: 'gatsby-cache',
    label: '.cache (Gatsby cache)',
    paths: (r) => [path.join(r, '.cache'), path.join(r, 'public')],
    description: 'Gatsby 缓存和 public 构建输出',
    impact: '需重新运行 gatsby develop / gatsby build 恢复',
    types: ['gatsby'],
  },
  // === Angular ===
  {
    id: 'angular-cache',
    label: '.angular (Angular cache)',
    paths: (r) => [path.join(r, '.angular'), path.join(r, 'dist')],
    description: 'Angular CLI 缓存和 dist 产物',
    impact: '需重新运行 ng serve / ng build 恢复',
    types: ['angular'],
  },
  // === SvelteKit ===
  {
    id: 'svelte-cache',
    label: '.svelte-kit (SvelteKit cache)',
    paths: (r) => [path.join(r, '.svelte-kit')],
    description: 'SvelteKit 生成文件',
    impact: '需重新运行 svelte-kit dev / build 恢复',
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
    description: 'Turborepo 本地任务缓存',
    impact: '无影响，下次 turbo run 会重新执行任务',
    types: [],
  },
  // === Webpack ===
  {
    id: 'webpack-cache',
    label: 'node_modules/.cache (Webpack/Babel)',
    paths: (r) => [path.join(r, 'node_modules/.cache')],
    description: 'Webpack、Babel 等工具的持久化缓存',
    impact: '无影响，下次构建会自动重建，首次构建会稍慢',
    types: [],
  },
  // === TypeScript ===
  {
    id: 'tsbuildinfo',
    label: '*.tsbuildinfo',
    paths: (r) => [path.join(r, 'tsconfig.tsbuildinfo')],
    description: 'TypeScript 增量编译信息',
    impact: '无影响，下次 tsc 会重新全量编译',
    types: [],
  },
  // === ESLint ===
  {
    id: 'eslint-cache',
    label: '.eslintcache',
    paths: (r) => [path.join(r, '.eslintcache')],
    description: 'ESLint 缓存文件',
    impact: '无影响，下次 eslint 运行会重新扫描',
    types: [],
  },
  // === dist / build output ===
  {
    id: 'dist-output',
    label: 'dist (build output)',
    paths: (r) => [path.join(r, 'dist')],
    description: '编译产物输出目录',
    impact: '需重新运行 build 命令恢复，不影响源码',
    types: ['node', 'vite', 'vue', 'svelte', 'angular'],
  },
  {
    id: 'build-output',
    label: 'build (build output)',
    paths: (r) => [path.join(r, 'build')],
    description: '构建产物输出目录',
    impact: '需重新运行 build 命令恢复，不影响源码',
    types: ['node', 'angular'],
  },
  // === Python ===
  {
    id: 'python-pycache',
    label: '__pycache__ (Python bytecode)',
    paths: (r) => findDirs(r, '__pycache__'),
    description: 'Python 字节码缓存',
    impact: '无影响，下次运行 Python 会自动重新编译',
    types: ['python'],
  },
  {
    id: 'python-venv',
    label: '.venv / venv (Python virtual env)',
    paths: (r) => [path.join(r, '.venv'), path.join(r, 'venv'), path.join(r, 'env')],
    description: 'Python 虚拟环境（包含已安装的包）',
    impact: '需重新创建虚拟环境并 pip install，影响较大，谨慎清理',
    types: ['python'],
  },
  {
    id: 'pip-cache',
    label: 'pip cache',
    paths: () => [path.join(process.env.HOME || '', '.cache/pip')],
    description: 'pip 全局下载缓存',
    impact: '无影响，下次 pip install 会重新下载',
    types: ['python'],
  },
  {
    id: 'python-egg',
    label: '*.egg-info / .eggs',
    paths: (r) => findDirs(r, '.eggs'),
    description: 'Python 打包元数据',
    impact: '无影响，setup.py install 会自动重建',
    types: ['python'],
  },
  // === Rust ===
  {
    id: 'rust-target',
    label: 'target (Rust build)',
    paths: (r) => [path.join(r, 'target')],
    description: 'Rust 编译产物和构建缓存',
    impact: '需重新运行 cargo build，大型项目编译耗时较长',
    types: ['rust'],
  },
  {
    id: 'cargo-cache',
    label: 'cargo cache',
    paths: () => [
      path.join(process.env.HOME || '', '.cargo/registry'),
      path.join(process.env.HOME || '', '.cargo/git'),
    ],
    description: 'Cargo 全局注册表和 git 缓存',
    impact: '无影响，下次 cargo build 会重新下载依赖',
    types: ['rust'],
  },
  // === Go ===
  {
    id: 'go-cache',
    label: 'go build cache',
    paths: () => [path.join(process.env.HOME || '', '.cache/go-build')],
    description: 'Go 构建缓存',
    impact: '无影响，下次 go build 会重新编译，首次会稍慢',
    types: ['go'],
  },
  {
    id: 'go-mod-cache',
    label: 'go module cache',
    paths: () => [path.join(process.env.HOME || '', 'go/pkg/mod')],
    description: 'Go 模块缓存',
    impact: '无影响，下次 go mod download 会重新下载',
    types: ['go'],
  },
  // === Flutter ===
  {
    id: 'flutter-build',
    label: 'Flutter build',
    paths: (r) => [path.join(r, 'build'), path.join(r, '.dart_tool')],
    description: 'Flutter 构建产物和 Dart 工具文件',
    impact: '需重新运行 flutter build 恢复',
    types: ['flutter'],
  },
  {
    id: 'flutter-cache',
    label: 'Flutter pub cache',
    paths: () => [path.join(process.env.HOME || '', '.pub-cache')],
    description: 'Flutter/Dart 全局 pub 缓存',
    impact: '无影响，下次 flutter pub get 会重新下载',
    types: ['flutter'],
  },
  // === Java ===
  {
    id: 'gradle-cache',
    label: 'Gradle cache',
    paths: () => [path.join(process.env.HOME || '', '.gradle/caches')],
    description: 'Gradle 全局构建缓存',
    impact: '无影响，下次 gradle build 会重新下载依赖',
    types: ['java'],
  },
  {
    id: 'maven-cache',
    label: 'Maven cache',
    paths: () => [path.join(process.env.HOME || '', '.m2/repository')],
    description: 'Maven 本地仓库',
    impact: '无影响，下次 mvn build 会重新下载依赖',
    types: ['java'],
  },
  {
    id: 'java-build',
    label: 'build (Java/Kotlin output)',
    paths: (r) => [path.join(r, 'build'), path.join(r, 'target')],
    description: 'Gradle/Maven 构建产物',
    impact: '需重新运行 build 命令恢复',
    types: ['java'],
  },
  // === Docker ===
  {
    id: 'docker-system',
    label: 'Docker system (images/containers/volumes)',
    paths: () => [],
    description: 'Docker 未使用的镜像、容器、卷',
    impact: '仅清理未被使用的资源，不影响正在运行的容器',
    types: [],
  },
];

function findDirs(root: string, name: string, maxDepth = 3, currentDepth = 0): string[] {
  const results: string[] = [];
  if (currentDepth > maxDepth) return results;

  try {
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

export function scanProject(projectInfo: ProjectInfo): ScanResult {
  const items: CacheItem[] = [];
  const { type, rootPath } = projectInfo;

  for (const target of CACHE_TARGETS) {
    if (target.types.length > 0 && !target.types.includes(type)) {
      continue;
    }

    const resolvedPaths = target.paths(rootPath).filter((p) => {
      if (target.id === 'docker-system') return true;
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

    if (totalSize === 0 && target.id !== 'docker-system') continue;

    items.push({
      id: target.id,
      label: target.label,
      paths: resolvedPaths,
      size: totalSize,
      projectType: type,
      description: target.description,
      impact: target.impact,
    });
  }

  items.sort((a, b) => b.size - a.size);
  const totalSize = items.reduce((sum, item) => sum + item.size, 0);

  return { projectInfo, items, totalSize };
}
