import type { PluginOption } from 'vite'
import type { ArchiverOptions } from 'archiver'

import path from 'path'
import fs from 'fs-extra'
import archiver from 'archiver'
import chalk from 'chalk'

export interface Options extends ArchiverOptions {
  /** 要压缩的目录（默认使用 Vite 的输出目录） */
  sourceDir?: string
  /** 输出的压缩文件路径（默认：输出目录.zip） */
  outputFile?: string
  /** 压缩格式（默认：zip） */
  format?: 'zip' | 'tar'
  /** 进度回调 */
  onProgress?: (data: { percent: string }) => void
}

export function viteArchive(options: Options = {}): PluginOption {
  let outputPath: string

  return {
    name: 'vite-plugin-archive',
    apply: 'build', // 仅在生产构建时生效
    configResolved(config) {
      // 获取 Vite 的输出目录（默认是 dist）
      outputPath = path.resolve(config.root, config.build.outDir)
    },
    closeBundle: async () => {
      const startTime = Date.now()

      const {
        sourceDir = outputPath, // 要压缩的目录
        outputFile = `${path.basename(outputPath)}.zip`, // 默认 ZIP 文件名
        format = 'zip', // 压缩格式
        onProgress, // 自定义进度回调
        ...archiveOptions // 其他 archiver 配置
      } = options

      // 检查源目录是否存在
      if (!fs.existsSync(sourceDir)) {
        throw new Error(`Source directory ${sourceDir} does not exist`)
      }

      const archive = archiver(format, {
        zlib: { level: 9 }, // 默认最高压缩率
        ...archiveOptions,
      })

      // 注册进度事件
      if (onProgress) {
        archive.on('progress', (data) => {
          onProgress({
            percent: ((data.fs.processedBytes / data.fs.totalBytes) * 100).toFixed(2),
            ...data,
          })
        })
      }

      return new Promise((resolve, reject) => {
        fs.ensureDirSync(path.dirname(outputFile))

        // 创建输出流
        const output = fs
          .createWriteStream(outputFile)
          .on('error', reject)
          .on('close', () => {
            console.log(`
${chalk.gray('ZIP 打包完成路径:')} ${chalk.green(outputFile)}
${chalk.gray('压缩耗时:')} ${chalk.blue(`${Date.now() - startTime}ms`)}
${chalk.gray('文件大小:')} ${chalk.yellow(`${(archive.pointer() / 1024 / 1024).toFixed(2)}MB`)}
              `)
            resolve()
          })

        archive.on('warning', (err) => {
          if (err.code === 'ENOENT') {
            console.warn('Archive warning:', err)
          } else {
            reject(err)
          }
        })

        archive.pipe(output)
        archive.glob('**/*', {
          cwd: sourceDir, // 设置根目录
          ignore: [path.basename(outputFile)],
        })
        archive.on('error', (err) => reject(err))
        archive.finalize()
      })
    },
  }
}
