/**
 * 精灵图处理脚本 — 白色背景去除 + 裁剪 + 缩放
 *
 * 专为 AI 生成的白色纯背景图片设计，处理流程简洁高效：
 *   1. 泛洪填充去白色背景（从四边向内，带边缘渐变）
 *   2. Auto-crop 透明边距
 *   3. 按占格比例缩放到 tileW*128 x tileH*128（居中 + 底部对齐）
 *   4. 输出透明 PNG
 *
 * 三种模式：
 *   grid   — 一张图切成 cols×rows 个等大精灵（默认 1x1 占格）
 *   single — 一张图 = 一个精灵（占格从参数或文件名提取）
 *   folder — 扫描文件夹批量处理（占格从文件名提取，无标注默认 1x1）
 *
 * 文件名规范：<任意描述>_<宽>x<高>.png → 占 宽×高 格
 *
 * 使用示例：
 *   node scripts/process-sprites.js input.png --mode grid --cols 4 --rows 4 --name mountain
 *   node scripts/process-sprites.js big.png --mode single --size 2x3 --name mountain
 *   node scripts/process-sprites.js src/assets/raw/mountain/ --mode folder --name mountain
 */

import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage } from 'canvas'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TILE_PX = 128

// ─── 参数解析 ───────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    input: args[0],
    mode: 'single',
    cols: 4,
    rows: 4,
    size: null,       // e.g. '2x3'
    name: 'sprite',
    tolerance: 30,
    output: null,     // auto: src/assets/sprites/<name>
    config: null,     // auto: src/data/<name>-sprites-config.js
    padding: 4,
  }

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--mode': options.mode = args[++i]; break
      case '--cols': options.cols = parseInt(args[++i]); break
      case '--rows': options.rows = parseInt(args[++i]); break
      case '--size': options.size = args[++i]; break
      case '--name': options.name = args[++i]; break
      case '--tolerance': options.tolerance = parseInt(args[++i]); break
      case '--output': options.output = args[++i]; break
      case '--config': options.config = args[++i]; break
      case '--padding': options.padding = parseInt(args[++i]); break
    }
  }

  if (!options.input) {
    console.log(`
精灵图处理脚本（白色背景专用）
================================

使用: node scripts/process-sprites.js <输入图片或文件夹> [选项]

模式:
  --mode grid     网格切割：一张图切成 cols×rows 个精灵
  --mode single   单图处理：一张图 = 一个精灵（默认）
  --mode folder   文件夹批量：扫描文件夹，按文件名规则处理

选项:
  --cols <n>         列数（grid 模式，默认 4）
  --rows <n>         行数（grid 模式，默认 4）
  --size <WxH>       占格大小（single 模式，如 2x3，默认从文件名提取）
  --name <prefix>    精灵名称前缀（默认 sprite）
  --tolerance <n>    白色背景容差（默认 30）
  --output <dir>     输出目录（默认 src/assets/sprites/<name>）
  --config <path>    配置文件路径（默认 src/data/<name>-sprites-config.js）
  --padding <n>      内容边距 px（默认 4）

文件名规范:
  <描述>_<宽>x<高>.png   → 占 宽×高 格
  <描述>.png              → 默认 1x1

示例:
  node scripts/process-sprites.js grid.png --mode grid --cols 4 --rows 4 --name mountain
  node scripts/process-sprites.js big_2x3.png --mode single --size 2x3 --name mountain
  node scripts/process-sprites.js src/assets/raw/mountain/ --mode folder --name mountain
`)
    process.exit(1)
  }

  if (!options.output) {
    options.output = `src/assets/sprites/${options.name}`
  }
  if (!options.config) {
    options.config = `src/data/${options.name}-sprites-config.js`
  }

  return options
}

// ─── 工具函数 ───────────────────────────────────────────

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

/** 将名称转为合法的 JS 变量名（camelCase） */
function toCamelCase(str) {
  return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
}

/** 从文件名提取占格大小，如 "雪山_2x3.png" → {w:2, h:3} */
function parseSizeFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename))
  const match = base.match(/(\d+)x(\d+)$/)
  if (match) {
    return { w: parseInt(match[1]), h: parseInt(match[2]) }
  }
  return { w: 1, h: 1 }
}

/** 解析 "WxH" 字符串 */
function parseSize(sizeStr) {
  if (!sizeStr) return null
  const match = sizeStr.match(/^(\d+)x(\d+)$/)
  if (match) {
    return { w: parseInt(match[1]), h: parseInt(match[2]) }
  }
  return null
}

// ─── 核心：泛洪填充去白色背景 ──────────────────────────

/**
 * 从图片四条边 BFS 泛洪，将白色背景标记为透明
 * 边缘像素按颜色距离做渐变 alpha（平滑过渡）
 */
function floodFillRemoveWhite(imageData, width, height, tolerance) {
  const data = imageData.data
  const totalPixels = width * height
  const visited = new Uint8Array(totalPixels)

  const bgR = 255, bgG = 255, bgB = 255
  const softEdge = tolerance * 1.5

  // BFS 队列：从四条边开始
  const queue = []
  for (let x = 0; x < width; x++) {
    queue.push(x)
    queue.push((height - 1) * width + x)
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push(y * width)
    queue.push(y * width + (width - 1))
  }
  for (const idx of queue) visited[idx] = 1

  let head = 0
  while (head < queue.length) {
    const idx = queue[head++]
    const pi = idx * 4
    const r = data[pi], g = data[pi + 1], b = data[pi + 2]

    const dist = colorDistance(r, g, b, bgR, bgG, bgB)

    if (dist < tolerance) {
      data[pi + 3] = 0

      const x = idx % width
      const y = Math.floor(idx / width)
      if (x > 0 && !visited[idx - 1]) { visited[idx - 1] = 1; queue.push(idx - 1) }
      if (x < width - 1 && !visited[idx + 1]) { visited[idx + 1] = 1; queue.push(idx + 1) }
      if (y > 0 && !visited[idx - width]) { visited[idx - width] = 1; queue.push(idx - width) }
      if (y < height - 1 && !visited[idx + width]) { visited[idx + width] = 1; queue.push(idx + width) }
    } else if (dist < softEdge) {
      const alpha = Math.round(((dist - tolerance) / (softEdge - tolerance)) * 255)
      data[pi + 3] = Math.min(data[pi + 3], alpha)
    }
  }

  return imageData
}

// ─── Auto-crop：找到非透明内容的 bounding box ──────────

function autoCrop(imageData, width, height) {
  const data = imageData.data
  let minX = width, minY = height, maxX = 0, maxY = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < minX || maxY < minY) return null
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
}

// ─── 处理单张图片：去白底 → crop → 缩放输出 ────────────

function processOneImage(image, tileW, tileH, tolerance, padding) {
  const width = image.width
  const height = image.height

  // 1. 去白色背景
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)
  let imageData = ctx.getImageData(0, 0, width, height)
  imageData = floodFillRemoveWhite(imageData, width, height, tolerance)
  ctx.putImageData(imageData, 0, 0)

  // 2. Auto-crop
  const crop = autoCrop(imageData, width, height)
  if (!crop || crop.w < 2 || crop.h < 2) {
    console.log('    警告: 未检测到内容，跳过')
    return null
  }

  // 3. 缩放到目标尺寸（居中 + 底部对齐）
  const outW = tileW * TILE_PX
  const outH = tileH * TILE_PX
  const outCanvas = createCanvas(outW, outH)
  const outCtx = outCanvas.getContext('2d')

  const innerW = outW - padding * 2
  const innerH = outH - padding * 2
  const scale = Math.min(innerW / crop.w, innerH / crop.h)
  const drawW = Math.round(crop.w * scale)
  const drawH = Math.round(crop.h * scale)
  const offsetX = Math.round((outW - drawW) / 2)   // 水平居中
  const offsetY = outH - padding - drawH             // 底部对齐

  outCtx.drawImage(canvas, crop.x, crop.y, crop.w, crop.h, offsetX, offsetY, drawW, drawH)

  return outCanvas
}

// ─── grid 模式：切割 + 逐个处理 ─────────────────────────

async function processGrid(options) {
  const { input, cols, rows, name, tolerance, padding, output } = options

  console.log(`加载图片: ${input}`)
  const image = await loadImage(input)
  console.log(`图片尺寸: ${image.width} x ${image.height}`)
  console.log(`网格: ${cols} 列 × ${rows} 行 = ${cols * rows} 个精灵\n`)

  const cellW = Math.floor(image.width / cols)
  const cellH = Math.floor(image.height / rows)
  console.log(`单格像素: ${cellW} x ${cellH}\n`)

  const outputDir = path.join(process.cwd(), output)
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const results = []
  let count = 0

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // 提取单格区域
      const cellCanvas = createCanvas(cellW, cellH)
      const cellCtx = cellCanvas.getContext('2d')
      cellCtx.drawImage(image, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH)

      // 作为独立图片处理（1x1 占格）
      const result = processOneImage(cellCanvas, 1, 1, tolerance, padding)
      if (!result) continue

      const fileName = `${name}_${count}.png`
      const filePath = path.join(outputDir, fileName)
      fs.writeFileSync(filePath, result.toBuffer('image/png'))

      results.push({
        idx: count,
        fileName,
        tileW: 1,
        tileH: 1,
      })

      process.stdout.write(`\r  处理进度: ${count + 1}/${cols * rows}`)
      count++
    }
  }

  console.log('\n')
  return results
}

// ─── single 模式：单图处理 ──────────────────────────────

async function processSingle(options) {
  const { input, size, name, tolerance, padding, output } = options

  const tileSize = parseSize(size) || parseSizeFromFilename(input)

  console.log(`加载图片: ${input}`)
  const image = await loadImage(input)
  console.log(`图片尺寸: ${image.width} x ${image.height}`)
  console.log(`占格: ${tileSize.w}x${tileSize.h}\n`)

  const outputDir = path.join(process.cwd(), output)
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const result = processOneImage(image, tileSize.w, tileSize.h, tolerance, padding)
  if (!result) {
    console.log('未检测到内容')
    return []
  }

  const fileName = `${name}_0.png`
  const filePath = path.join(outputDir, fileName)
  fs.writeFileSync(filePath, result.toBuffer('image/png'))
  console.log(`输出: ${filePath} (${result.width}x${result.height}px)`)

  return [{
    idx: 0,
    fileName,
    tileW: tileSize.w,
    tileH: tileSize.h,
  }]
}

// ─── folder 模式：批量处理文件夹 ────────────────────────

async function processFolder(options) {
  const { input, name, tolerance, padding, output } = options

  const inputDir = path.resolve(process.cwd(), input)
  if (!fs.existsSync(inputDir) || !fs.statSync(inputDir).isDirectory()) {
    console.error(`错误: ${inputDir} 不是有效的文件夹`)
    process.exit(1)
  }

  const files = fs.readdirSync(inputDir)
    .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort()

  if (files.length === 0) {
    console.error(`错误: ${inputDir} 中没有找到图片文件`)
    process.exit(1)
  }

  console.log(`扫描文件夹: ${inputDir}`)
  console.log(`找到 ${files.length} 张图片\n`)

  const outputDir = path.join(process.cwd(), output)
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const results = []
  let count = 0

  for (const file of files) {
    const filePath = path.join(inputDir, file)
    const tileSize = parseSizeFromFilename(file)

    console.log(`  [${count}] ${file} → ${tileSize.w}x${tileSize.h} 占格`)

    const image = await loadImage(filePath)
    const result = processOneImage(image, tileSize.w, tileSize.h, tolerance, padding)
    if (!result) continue

    const fileName = `${name}_${count}.png`
    const outPath = path.join(outputDir, fileName)
    fs.writeFileSync(outPath, result.toBuffer('image/png'))

    results.push({
      idx: count,
      fileName,
      tileW: tileSize.w,
      tileH: tileSize.h,
    })
    count++
  }

  console.log()
  return results
}

// ─── 生成配置文件 ────────────────────────────────────────

function generateConfig(results, options) {
  const { name, output, config } = options

  const spriteEntries = results.map(s => {
    const sizeProp = (s.tileW === 1 && s.tileH === 1)
      ? ''
      : `\n  size: { width: ${s.tileW}, height: ${s.tileH} },`
    return `{
  key: '${name}_${s.idx}',
  imagesSrc: ['/${output}/${s.fileName}'],${sizeProp}
}`
  })

  // 按占格大小分类
  const sizeGroups = {}
  for (const s of results) {
    const key = `${s.tileW}x${s.tileH}`
    if (!sizeGroups[key]) sizeGroups[key] = []
    sizeGroups[key].push(`'${name}_${s.idx}'`)
  }

  const varName = toCamelCase(name)

  const configContent = `/**
 * 精灵配置
 * 由 process-sprites.js 自动生成
 * 生成时间: ${new Date().toLocaleString('zh-CN')}
 * 共 ${results.length} 个精灵
 */

export const ${varName}SpriteDefinition = [
  ${spriteEntries.join(',\n  ')}
]

// 按占格大小分类
export const ${varName}BySize = {
${Object.keys(sizeGroups).sort().map(size => {
    return `  '${size}': [${sizeGroups[size].join(', ')}],`
  }).join('\n')}
}
`

  const configPath = path.join(process.cwd(), config)
  const configDir = path.dirname(configPath)
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true })
  fs.writeFileSync(configPath, configContent)
  console.log(`配置文件: ${configPath}`)
}

// ─── 主流程 ─────────────────────────────────────────────

async function main() {
  const options = parseArgs()

  console.log('============================================')
  console.log('精灵图处理脚本（白色背景专用）')
  console.log('============================================\n')

  console.log(`模式: ${options.mode}`)
  console.log(`名称: ${options.name}`)
  console.log(`容差: ${options.tolerance}`)
  console.log(`输出: ${options.output}\n`)

  let results

  switch (options.mode) {
    case 'grid':
      results = await processGrid(options)
      break
    case 'single':
      results = await processSingle(options)
      break
    case 'folder':
      results = await processFolder(options)
      break
    default:
      console.error(`未知模式: ${options.mode}`)
      process.exit(1)
  }

  if (results.length === 0) {
    console.log('没有生成任何精灵')
    return
  }

  // 生成配置文件
  generateConfig(results, options)

  // 统计
  const sizeStats = {}
  for (const s of results) {
    const key = `${s.tileW}x${s.tileH}`
    sizeStats[key] = (sizeStats[key] || 0) + 1
  }

  console.log('\n============================================')
  console.log('处理完成!')
  console.log('============================================')
  console.log(`输出目录: ${path.join(process.cwd(), options.output)}`)
  console.log(`总计: ${results.length} 个精灵`)
  console.log('尺寸分布:')
  for (const [size, count] of Object.entries(sizeStats).sort()) {
    console.log(`  ${size}: ${count} 个`)
  }
  console.log(`\n使用方式:`)
  const varName = toCamelCase(options.name)
  console.log(`  import { ${varName}SpriteDefinition } from '../data/${path.basename(options.config, '.js')}'`)
}

main().catch(err => {
  console.error('\n处理失败:', err.message)
  console.error(err.stack)
  process.exit(1)
})
