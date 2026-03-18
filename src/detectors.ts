import * as path from 'path';
import { ProjectInfo, ProjectType } from './types';
import { fileExists, dirExists } from './utils';

/**
 * Detect the type of project in the given directory
 */
export function detectProject(rootPath: string): ProjectInfo {
  const frameworks: string[] = [];
  let detectedType: ProjectType = 'unknown';

  // Check package.json for Node.js ecosystem projects
  const pkgPath = path.join(rootPath, 'package.json');
  if (fileExists(pkgPath)) {
    detectedType = 'node';

    try {
      const pkg = JSON.parse(
        require('fs').readFileSync(pkgPath, 'utf-8')
      );
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies,
      };

      if (allDeps['next']) {
        detectedType = 'nextjs';
        frameworks.push('Next.js');
      }
      if (allDeps['nuxt'] || allDeps['nuxt3']) {
        detectedType = 'nuxt';
        frameworks.push('Nuxt');
      }
      if (allDeps['vite']) {
        if (detectedType === 'node') detectedType = 'vite';
        frameworks.push('Vite');
      }
      if (allDeps['vue']) {
        if (detectedType === 'node') detectedType = 'vue';
        frameworks.push('Vue');
      }
      if (allDeps['@angular/core']) {
        detectedType = 'angular';
        frameworks.push('Angular');
      }
      if (allDeps['svelte']) {
        if (detectedType === 'node') detectedType = 'svelte';
        frameworks.push('Svelte');
      }
      if (allDeps['gatsby']) {
        detectedType = 'gatsby';
        frameworks.push('Gatsby');
      }
      if (allDeps['react']) {
        frameworks.push('React');
      }
      if (allDeps['typescript']) {
        frameworks.push('TypeScript');
      }
      if (allDeps['webpack']) {
        frameworks.push('Webpack');
      }
      if (allDeps['turbo']) {
        frameworks.push('Turborepo');
      }
    } catch {
      // Can't parse package.json
    }
  }

  // Python
  if (
    fileExists(path.join(rootPath, 'requirements.txt')) ||
    fileExists(path.join(rootPath, 'pyproject.toml')) ||
    fileExists(path.join(rootPath, 'setup.py')) ||
    fileExists(path.join(rootPath, 'Pipfile'))
  ) {
    if (detectedType === 'unknown') {
      detectedType = 'python';
    }
    frameworks.push('Python');
  }

  // Rust
  if (fileExists(path.join(rootPath, 'Cargo.toml'))) {
    detectedType = 'rust';
    frameworks.push('Rust');
  }

  // Go
  if (fileExists(path.join(rootPath, 'go.mod'))) {
    detectedType = 'go';
    frameworks.push('Go');
  }

  // Java/Gradle/Maven
  if (
    fileExists(path.join(rootPath, 'pom.xml')) ||
    fileExists(path.join(rootPath, 'build.gradle')) ||
    fileExists(path.join(rootPath, 'build.gradle.kts'))
  ) {
    if (detectedType === 'unknown') detectedType = 'java';
    frameworks.push('Java');
  }

  // Flutter
  if (fileExists(path.join(rootPath, 'pubspec.yaml'))) {
    detectedType = 'flutter';
    frameworks.push('Flutter');
  }

  // Docker
  if (
    fileExists(path.join(rootPath, 'Dockerfile')) ||
    fileExists(path.join(rootPath, 'docker-compose.yml')) ||
    fileExists(path.join(rootPath, 'docker-compose.yaml'))
  ) {
    frameworks.push('Docker');
  }

  // Turborepo / Monorepo
  if (fileExists(path.join(rootPath, 'turbo.json'))) {
    frameworks.push('Turborepo');
  }
  if (fileExists(path.join(rootPath, 'pnpm-workspace.yaml'))) {
    frameworks.push('pnpm Workspace');
  }
  if (fileExists(path.join(rootPath, 'lerna.json'))) {
    frameworks.push('Lerna');
  }

  return {
    type: detectedType,
    frameworks: [...new Set(frameworks)],
    rootPath,
  };
}
