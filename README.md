# vite-plugin-archive

[![npm](https://img.shields.io/npm/v/vite-plugin-archive.svg)](https://www.npmjs.com/package/vite-plugin-archive)
[![license](https://img.shields.io/npm/l/vite-plugin-archive.svg)](https://github.com/yourusername/vite-plugin-archive/blob/main/LICENSE)

Vite 构建后自动打包生成 ZIP/TAR 压缩文件的插件

## 特性

- 📦 自动将构建产物打包为 ZIP/TAR 格式
- ⏱️ 显示压缩耗时和文件大小
- 🎨 支持彩色控制台输出
- ⚙️ 可自定义压缩格式/路径/过滤规则

## 安装

```bash
# 使用 npm
npm install vite-plugin-archive --save-dev

# 使用 pnpm
pnpm add vite-plugin-archive -D

# 使用 yarn
yarn add vite-plugin-archive -D
```

## 使用

### 基础配置

```javascript
// vite.config.js
import { viteArchive } from 'vite-plugin-archive'

export default {
  plugins: [
    viteArchive({
      outputFile: 'dist.zip',
    }),
  ],
}
```

### 高级配置

```javascript
// vite.config.js
import { viteArchive } from 'vite-plugin-archive'

export default {
  plugins: [
    viteArchive({
      format: 'tar', // 压缩格式 (默认: zip)
      sourceDir: 'custom-dist', // 指定源目录 (默认: Vite 的 build.outDir)
      outputFile: 'release.tar',
      onProgress: ({ percent }) => {
        console.log(`压缩进度: ${percent}%`)
      },
      ignore: ['*.map'], // 忽略所有 sourcemap 文件
      zlib: { level: 6 }, // 自定义压缩级别 (0-9)
    }),
  ],
}
```

## 配置选项

### 核心配置

| 参数         | 类型                                  | 必填 | 默认值                 | 说明                                                               |
| ------------ | ------------------------------------- | ---- | ---------------------- | ------------------------------------------------------------------ |
| `sourceDir`  | `string`                              | 否   | Vite 的 `build.outDir` | 要压缩的源目录路径（默认自动读取 Vite 构建输出目录，如 `dist/`）   |
| `outputFile` | `string`                              | 否   | `[sourceDir名].zip`    | 压缩文件输出路径（支持绝对/相对路径，如 `release/app-v1.0.0.zip`） |
| `format`     | `'zip'` \| `'tar'`                    | 否   | `'zip'`                | 压缩格式，可选 ZIP 或 TAR 归档                                     |
| `onProgress` | `(data: { percent: string }) => void` | 否   | -                      | 实时压缩进度回调（`percent` 为百分比字符串，如 `'75.25'`）         |

### Archiver 原生配置

支持所有 [archiver](https://archiverjs.com/docs/) 原生选项，常用参数如下：

| 参数              | 类型       | 默认值      | 说明                                                       |
| ----------------- | ---------- | ----------- | ---------------------------------------------------------- |
| `zlib.level`      | `0-9`      | `9`         | ZIP 压缩级别（0=不压缩，9=最高压缩）                       |
| `gzip`            | `boolean`  | `false`     | TAR 格式下是否启用 GZIP 压缩（生成 `.tar.gz`）             |
| `ignore`          | `string[]` | `[]`        | 忽略文件模式（使用 Glob 语法），如 `['**/*.map', 'temp/']` |
| `globOptions.cwd` | `string`   | `sourceDir` | 指定 Glob 匹配的基准目录                                   |

## 文件过滤规则

| Glob 参数   | 类型      | 默认值 | 说明                                                 |
| ----------- | --------- | ------ | ---------------------------------------------------- |
| `dot`       | `boolean` | `true` | 是否包含以 `.` 开头的隐藏文件（如 `.env`）           |
| `nodir`     | `boolean` | `true` | 是否排除空目录                                       |
| `matchBase` | `boolean` | `true` | 是否匹配文件名部分（如 `*.js` 匹配所有层级 JS 文件） |
