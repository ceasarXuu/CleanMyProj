**[English](./README_EN.md)** | 中文

---

# CleanMyProj (cmp)

<p align="center">
  <b>项目缓存清理 CLI 工具</b><br>
  自动检测项目类型 · 扫描缓存占用 · 交互式选择清理 · 安全移至回收站
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-16+-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/npm-8+-CB3837?logo=npm&logoColor=white" alt="npm">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

## 特性

- 🔍 **智能检测** — 自动识别项目类型（Next.js / Vue / Python / Rust / Go 等 14+ 种）
- 📊 **缓存扫描** — 递归计算各类缓存目录，按占用量降序展示
- ☑️ **交互式选择** — 复选列表，一键全选，按需勾选
- 🛡️ **双重确认** — 两次 Enter 确认，防止误删
- 🗑️ **安全删除** — 统一移至系统回收站，支持恢复
- ⚡ **零配置** — 无需配置文件，开箱即用

## 安装

```bash
npm install -g cleanmyproj
```

## 快速开始

在项目根目录执行：

```bash
cmp
```

终端输出示例：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CleanMyProj — 项目缓存清理工具
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  项目路径: /Users/dev/my-project
  检测类型: nextjs
  框架技术: Next.js, React, TypeScript

  共发现 5 项缓存，总计占用 2.37 GB

? 选择要清理的项目 (空格勾选, Enter 确认):
 ◻ ✦ 全选 (All) — 总计: 2.37 GB
 ◻   .next (Next.js build cache)                   1.24 GB
 ◻   node_modules                                   890.52 MB
 ◻   node_modules/.vite (Vite cache)               156.30 MB
 ◻   .eslintcache                                   12.80 MB
 ◻   node_modules/.cache (Webpack/Babel)             8.45 MB
```

## 命令选项

```bash
cmp [path]              # 扫描并交互式清理（path 默认为当前目录）
cmp --check             # 仅检查缓存占用，不执行清理
cmp --yes               # 跳过确认直接清理（危险操作，请谨慎使用）
cmp --help              # 显示帮助信息
cmp --version           # 显示版本号
```

## 交互流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  项目检测   │ ──▶ │  缓存扫描   │ ──▶ │  选择清理项  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                  ┌─────────────┐     ┌────────▼────────┐
                  │  安全删除   │ ◀── │  双重确认 (×2)  │
                  │ (移至回收站)│     └─────────────────┘
                  └─────────────┘
```

1. **项目检测** — 自动识别项目类型和使用的框架
2. **缓存扫描** — 计算各类缓存目录的磁盘占用
3. **选择清理项** — 复选列表，空格键切换勾选状态，Enter 确认
   - `✦ 全选 (All)` — 勾选后自动选中后面所有项
4. **双重确认** — 第一次 Enter 弹出警告（列出将删除的项目），第二次 Enter 执行删除
5. **安全删除** — 所有文件移至系统回收站，非永久删除

## 支持的项目类型与缓存项

| 项目类型 | 可清理缓存 |
|---------|-----------|
| **Node.js（通用）** | `node_modules`, npm/yarn/pnpm cache, `node_modules/.cache`, `.eslintcache`, `tsbuildinfo` |
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
| **Docker** | docker system prune（images / containers / volumes） |
| **Turborepo** | `.turbo` local cache |

## 项目结构

```
CleanMyProj/
├── bin/cmp.js          # CLI 入口
├── src/
│   ├── types.ts        # 类型定义
│   ├── utils.ts        # 工具函数（格式化大小、目录大小计算）
│   ├── detectors.ts    # 项目类型检测器
│   ├── scanners.ts     # 缓存扫描器
│   ├── cleaner.ts      # 安全清理（trash）
│   ├── ui.ts           # 交互式 UI（checklist + 双重确认）
│   └── index.ts        # CLI 主流程
├── dist/               # 编译输出
├── package.json
└── tsconfig.json
```

## 安全说明

- ✅ 所有删除的文件会移至**系统回收站**（macOS 废纸篓 / Windows 回收站 / Linux Trash）
- ✅ 可以从回收站手动恢复误删的文件
- ✅ 默认所有选项均为**未勾选**状态，需手动选择
- ✅ 执行前有**两次确认**提示，Enter 键二次确认后才会真正执行
- ✅ 不会删除源代码和配置文件，仅清理缓存和构建产物

## 本地开发

```bash
git clone <repo-url>
cd CleanMyProj
npm install
npm run build

# 测试
node dist/index.js --check        # 检查当前项目
node dist/index.js /path/to/proj  # 检查指定项目
```

## 常见问题

**Q: 删除的文件能恢复吗？**
A: 可以。所有文件都会移至系统回收站，手动打开回收站即可恢复。

**Q: 支持 monorepo 吗？**
A: 支持。在 monorepo 根目录执行即可扫描所有子项目的缓存。

**Q: 会删除我的源代码吗？**
A: 不会。仅清理缓存目录和构建产物，不会触及源代码文件。

## 许可证

[MIT](./LICENSE)
