**[English](./README_EN.md)** | 中文

---

<div align="center">

# CleanMyProj

**一键清理项目缓存，释放磁盘空间**

[![npm version](https://img.shields.io/npm/v/cleanmyproj?logo=npm&color=CB3837)](https://www.npmjs.com/package/cleanmyproj)
[![npm downloads](https://img.shields.io/npm/dm/cleanmyproj?logo=npm)](https://www.npmjs.com/package/cleanmyproj)
[![license](https://img.shields.io/github/license/ceasarXuu/CleanMyProj)](https://github.com/ceasarXuu/CleanMyProj/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ceasarXuu/CleanMyProj?style=social)](https://github.com/ceasarXuu/CleanMyProj)

自动检测项目类型 · 扫描缓存占用 · 交互式选择 · 安全移至回收站

</div>

---

## 为什么需要 CleanMyProj

开发久了，各种 `node_modules`、`.next`、`__pycache__`、`target` 散落在项目里，占用大量磁盘空间。手动查找和删除这些缓存目录既麻烦又容易误删。

**CleanMyProj** 帮你：

- 一个命令扫描项目中所有可清理的缓存
- 按占用大小排序，清晰展示哪些最占空间
- 勾选后统一移至系统回收站（不是直接删除）

## 安装

```bash
npm install -g cleanmyproj
```

## 使用

在任意项目根目录下执行：

```bash
cmp
```

### 典型输出

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
 ◻   .next (Next.js build cache)                    1.24 GB
 ◻   node_modules                                   890.52 MB
 ◻   node_modules/.vite (Vite cache)               156.30 MB
 ◻   .eslintcache                                    12.80 MB
 ◻   node_modules/.cache (Webpack/Babel)              8.45 MB
```

### 命令

```bash
cmp                     # 当前目录：扫描 → 交互选择 → 清理
cmp /path/to/project    # 指定项目路径
cmp --check             # 只看结果，不执行清理
cmp --yes               # 跳过确认直接清理（谨慎使用）
```

### 操作说明

| 按键 | 作用 |
|------|------|
| `空格` | 勾选 / 取消勾选 |
| `↑ ↓` | 上下移动光标 |
| `Enter` | 确认选择 |

选择后会经历**两次确认**：

1. 第一次 Enter → 显示将要清理的项目列表，要求确认
2. 第二次 Enter → 最终执行，文件移至系统回收站

## 支持的项目类型

| 类型 | 可清理内容 |
|------|-----------|
| **Node.js** | `node_modules`、npm / yarn / pnpm 全局缓存、`node_modules/.cache`、`.eslintcache` |
| **Next.js** | `.next` 构建缓存 |
| **Nuxt** | `.nuxt`、`.output` |
| **Vite** | `node_modules/.vite` |
| **Vue / Svelte** | `dist`、`.svelte-kit` |
| **Angular** | `.angular`、`dist` |
| **Gatsby** | `.cache`、`public` |
| **Python** | `__pycache__`、`.venv`、pip 缓存 |
| **Rust** | `target/`、cargo registry |
| **Go** | build cache、module cache |
| **Flutter** | `build/`、`.dart_tool`、pub cache |
| **Java** | `build/`、`target/`、Gradle 缓存、Maven 本地仓库 |
| **Docker** | 未使用的镜像、容器、卷 |
| **Turborepo** | `.turbo` 本地缓存 |

## 安全性

| 特性 | 说明 |
|------|------|
| 🗑️ 移至回收站 | 所有文件进入系统回收站（macOS 废纸篓 / Windows 回收站 / Linux Trash），可手动恢复 |
| ☑️ 默认不选 | 所有选项默认未勾选，由你决定清理哪些 |
| 🔒 双重确认 | 执行前需两次确认，防误操作 |
| 🚫 不碰源码 | 仅清理缓存和构建产物，不影响源代码和配置文件 |

## 常见问题

<details>
<summary>删除的文件能恢复吗？</summary>

可以。所有删除操作实质是「移动到回收站」，打开系统的回收站即可恢复。
</details>

<details>
<summary>支持 monorepo 吗？</summary>

支持。在 monorepo 根目录运行 `cmp`，会扫描所有子项目的缓存。
</details>

<details>
<summary>会误删源代码吗？</summary>

不会。CleanMyProj 只会清理预定义的缓存目录（如 `node_modules`、`.next`、`target` 等），不会删除任何源代码文件。
</details>

<details>
<summary>Windows 能用吗？</summary>

能。支持 macOS、Windows 和 Linux，文件会被移至各自的系统回收站。
</details>

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m 'feat: add something'`)
4. 推送分支 (`git push origin feature/your-feature`)
5. 提交 Pull Request

## 许可证

[MIT](./LICENSE) © [ceasarXuu](https://github.com/ceasarXuu)
