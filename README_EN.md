**[中文](./README.md)** | English

---

# CleanMyProj (cmp)

<p align="center">
  <b>Project Cache Cleanup CLI Tool</b><br>
  Auto-detect project type · Scan cache usage · Interactive cleanup · Safe trash recovery
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-16+-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/npm-8+-CB3837?logo=npm&logoColor=white" alt="npm">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

## Features

- 🔍 **Smart Detection** — Auto-identify project type (Next.js / Vue / Python / Rust / Go and 14+ more)
- 📊 **Cache Scanning** — Recursively calculate cache directory sizes, sorted by usage
- ☑️ **Interactive Selection** — Checkbox list with "Select All", check items as needed
- 🛡️ **Double Confirmation** — Two-step Enter confirmation to prevent accidental deletion
- 🗑️ **Safe Deletion** — All files moved to system trash/recycle bin, fully recoverable
- ⚡ **Zero Config** — No configuration files needed, works out of the box

## Install

```bash
npm install -g cleanmyproj
```

## Quick Start

Run in your project root directory:

```bash
cmp
```

Terminal output example:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CleanMyProj — Project Cache Cleanup Tool
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Project Path: /Users/dev/my-project
  Detected Type: nextjs
  Frameworks: Next.js, React, TypeScript

  Found 5 cache items, total size: 2.37 GB

? Select items to clean (Space to toggle, Enter to confirm):
 ◻ ✦ Select All (All) — Total: 2.37 GB
 ◻   .next (Next.js build cache)                   1.24 GB
 ◻   node_modules                                   890.52 MB
 ◻   node_modules/.vite (Vite cache)               156.30 MB
 ◻   .eslintcache                                   12.80 MB
 ◻   node_modules/.cache (Webpack/Babel)             8.45 MB
```

## Commands

```bash
cmp [path]              # Scan and interactive cleanup (path defaults to cwd)
cmp --check             # Scan only, skip interactive cleanup
cmp --yes               # Skip confirmation, clean immediately (use with caution)
cmp --help              # Show help
cmp --version           # Show version
```

## Interactive Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Project Detection │ ──▶ │  Cache Scanning   │ ──▶ │ Select Items     │
└──────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                           │
                    ┌──────────────────┐     ┌────────────▼────────────┐
                    │  Safe Deletion    │ ◀── │ Double Confirmation (×2)│
                    │ (Move to Trash)   │     └─────────────────────────┘
                    └──────────────────┘
```

1. **Project Detection** — Auto-identify project type and frameworks used
2. **Cache Scanning** — Calculate disk usage of each cache directory
3. **Select Items** — Checkbox list, toggle with Spacebar, confirm with Enter
   - `✦ Select All` — Checking this selects all items below
4. **Double Confirmation** — First Enter shows a warning listing items to delete; second Enter executes
5. **Safe Deletion** — All files moved to system trash (not permanently deleted)

## Supported Project Types & Cache Targets

| Project Type | Cleanable Caches |
|-------------|-----------------|
| **Node.js (General)** | `node_modules`, npm/yarn/pnpm cache, `node_modules/.cache`, `.eslintcache`, `tsbuildinfo` |
| **Next.js** | `.next` build cache |
| **Nuxt** | `.nuxt`, `.output` |
| **Vite** | `node_modules/.vite` |
| **Gatsby** | `.cache`, `public` |
| **Angular** | `.angular`, `dist` |
| **SvelteKit** | `.svelte-kit` |
| **Python** | `__pycache__`, `.venv`, pip cache, `.eggs` |
| **Rust** | `target/`, cargo registry |
| **Go** | build cache, module cache |
| **Flutter** | `build/`, `.dart_tool`, pub cache |
| **Java / Gradle / Maven** | `build/`, `target/`, gradle cache, maven repo |
| **Docker** | docker system prune (images / containers / volumes) |
| **Turborepo** | `.turbo` local cache |

## Project Structure

```
CleanMyProj/
├── bin/cmp.js          # CLI entry point
├── src/
│   ├── types.ts        # Type definitions
│   ├── utils.ts        # Utilities (size formatting, dir size calculation)
│   ├── detectors.ts    # Project type detector
│   ├── scanners.ts     # Cache scanner
│   ├── cleaner.ts      # Safe cleanup (trash)
│   ├── ui.ts           # Interactive UI (checklist + double confirmation)
│   └── index.ts        # CLI main flow
├── dist/               # Compiled output
├── package.json
└── tsconfig.json
```

## Safety

- ✅ All deleted files go to **system trash** (macOS Trash / Windows Recycle Bin / Linux Trash)
- ✅ Accidentally deleted files can be recovered from trash manually
- ✅ All options are **unchecked** by default — you choose what to clean
- ✅ **Two confirmation steps** before any deletion occurs
- ✅ Never touches source code or config files — only cache and build artifacts

## Development

```bash
git clone <repo-url>
cd CleanMyProj
npm install
npm run build

# Test
node dist/index.js --check        # Check current project
node dist/index.js /path/to/proj  # Check a specific project
```

## FAQ

**Q: Can deleted files be recovered?**
A: Yes. All files are moved to the system trash/recycle bin. Open trash and restore manually.

**Q: Does it support monorepos?**
A: Yes. Run `cmp` in the monorepo root and it will scan all sub-project caches.

**Q: Will it delete my source code?**
A: No. Only cache directories and build artifacts are cleaned. Source code is never touched.

## License

[MIT](./LICENSE)
