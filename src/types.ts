export interface CacheItem {
  /** Unique identifier for this cache item */
  id: string;
  /** Display label shown in checklist */
  label: string;
  /** Absolute path(s) to the cache directory/file */
  paths: string[];
  /** Total size in bytes */
  size: number;
  /** Which project type this cache belongs to */
  projectType: ProjectType;
  /** Brief description of what this cache is */
  description: string;
}

export type ProjectType =
  | 'node'
  | 'nextjs'
  | 'nuxt'
  | 'vite'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'gatsby'
  | 'python'
  | 'rust'
  | 'go'
  | 'java'
  | 'flutter'
  | 'docker'
  | 'unknown';

export interface ProjectInfo {
  type: ProjectType;
  /** Detected framework names for display */
  frameworks: string[];
  /** Root path of the project */
  rootPath: string;
}

export interface CleanupResult {
  id: string;
  label: string;
  paths: string[];
  size: number;
  success: boolean;
  error?: string;
}

export interface ScanResult {
  projectInfo: ProjectInfo;
  items: CacheItem[];
  totalSize: number;
}
