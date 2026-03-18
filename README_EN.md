**[中文](./README.md)** | English

---

<div align="center">

# CleanMyProj

**One command to clean project caches and free up disk space**

[![npm version](https://img.shields.io/npm/v/cleanmyproj?logo=npm&color=CB3837)](https://www.npmjs.com/package/cleanmyproj)
[![npm downloads](https://img.shields.io/npm/dm/cleanmyproj?logo=npm)](https://www.npmjs.com/package/cleanmyproj)
[![license](https://img.shields.io/github/license/ceasarXuu/CleanMyProj)](https://github.com/ceasarXuu/CleanMyProj/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ceasarXuu/CleanMyProj?style=social)](https://github.com/ceasarXuu/CleanMyProj)

Auto-detect project type · Scan cache usage · Interactive selection · Safe trash recovery

</div>

---

## Why CleanMyProj

Over time, `node_modules`, `.next`, `__pycache__`, `target` and other caches pile up across your projects, eating disk space. Finding and removing them manually is tedious and risky.

**CleanMyProj** helps you:

- Scan all cleanable caches with a single command
- Sort by size so you know what's hogging space
- Move selected items to system trash (not permanent deletion)

## Install

```bash
npm install -g cleanmyproj
```

## Usage

Run in any project root directory:

```bash
cmp
```

### Example Output

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
 ◻   .next (Next.js build cache)                    1.24 GB
 ◻   node_modules                                   890.52 MB
 ◻   node_modules/.vite (Vite cache)               156.30 MB
 ◻   .eslintcache                                    12.80 MB
 ◻   node_modules/.cache (Webpack/Babel)              8.45 MB
```

### Commands

```bash
cmp                     # Current dir: scan → select → clean
cmp /path/to/project    # Specify project path
cmp --check             # Scan only, no interactive cleanup
cmp --yes               # Skip confirmation, clean immediately
```

### Controls

| Key | Action |
|-----|--------|
| `Space` | Toggle selection |
| `↑ ↓` | Navigate |
| `Enter` | Confirm |

After selection, there are **two confirmation steps**:

1. First Enter → shows a list of items to be deleted, asks for confirmation
2. Second Enter → executes cleanup, files moved to system trash

## Supported Project Types

| Type | Cleanable Targets |
|------|------------------|
| **Node.js** | `node_modules`, npm / yarn / pnpm cache, `node_modules/.cache`, `.eslintcache` |
| **Next.js** | `.next` build cache |
| **Nuxt** | `.nuxt`, `.output` |
| **Vite** | `node_modules/.vite` |
| **Vue / Svelte** | `dist`, `.svelte-kit` |
| **Angular** | `.angular`, `dist` |
| **Gatsby** | `.cache`, `public` |
| **Python** | `__pycache__`, `.venv`, pip cache |
| **Rust** | `target/`, cargo registry |
| **Go** | build cache, module cache |
| **Flutter** | `build/`, `.dart_tool`, pub cache |
| **Java** | `build/`, `target/`, Gradle cache, Maven repo |
| **Docker** | unused images, containers, volumes |
| **Turborepo** | `.turbo` local cache |

## Safety

| Feature | Detail |
|---------|--------|
| 🗑️ Trash only | All files go to system trash (macOS Trash / Windows Recycle Bin / Linux Trash), fully recoverable |
| ☑️ Opt-in | Everything is unchecked by default — you decide what to clean |
| 🔒 Double confirm | Two confirmation steps before any deletion |
| 🚫 Source-safe | Only cache directories and build artifacts are targeted, never source code |

## FAQ

<details>
<summary>Can I recover deleted files?</summary>

Yes. All deletions are actually "move to trash" operations. Open your system's trash/recycle bin to restore.
</details>

<details>
<summary>Does it support monorepos?</summary>

Yes. Run `cmp` at the monorepo root and it will scan all sub-project caches.
</details>

<details>
<summary>Will it delete my source code?</summary>

No. CleanMyProj only targets predefined cache directories (`node_modules`, `.next`, `target`, etc.). Source code is never touched.
</details>

<details>
<summary>Does it work on Windows?</summary>

Yes. It supports macOS, Windows, and Linux. Files are moved to each OS's native trash system.
</details>

## Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'feat: add something'`)
4. Push (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

[MIT](./LICENSE) © [ceasarXuu](https://github.com/ceasarXuu)
