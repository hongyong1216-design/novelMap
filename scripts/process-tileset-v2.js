/**
 * 图片处理脚本 v2 - 智能裁剪 tileset
 *
 * 功能：
 * 1. 自动检测网格布局（列数、行数）
 * 2. 智能背景色检测（采样多个点）
 * 3. 支持边距/间距参数（避免裁剪超出边界的元素）
 * 4. 生成透明 PNG + 配置文件
 *
 * 使用：
 * node scripts/process-tileset-v2.js <输入图片> [选项]
 *
 * 选项：
 *   --cols <n>        列数（默认自动检测）
 *   --rows <n>        行数（默认自动检测）
 *   --margin <n>      裁剪时跳过的边距像素（默认 0）
 *   --spacing <n>     格子之间的间距像素（默认 0）
 *   --bg <color>      背景色，如 #aaaaaa（默认自动检测）
 *   --tolerance <n>   颜色容差（默认 40）
 *   --output <dir>    输出目录（默认 src/assets/tileset）
 *   --name <prefix>   文件名前缀（默认 tile）
 *
 * 示例：
 * node scripts/process-tileset-v2.js input.jpg --cols 5 --rows 4 --margin 10
 */

import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage } from 'canvas'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    input: args[0],
    cols: null,
    rows: null,
    margin: 0,
    spacing: 0,
    bgColor: null,
    tolerance: 40,
    output: 'src/assets/tileset',
    name: 'tile'
  }

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--cols') options.cols = parseInt(args[++i])
    else if (args[i] === '--rows') options.rows = parseInt(args[++i])
    else if (args[i] === '--margin') options.margin = parseInt(args[++i])
    else if (args[i] === '--spacing') options.spacing = parseInt(args[++i])
    else if (args[i] === '--bg') options.bgColor = args[++i]
    else if (args[i] === '--tolerance') options.tolerance = parseInt(args[++i])
    else if (args[i] === '--output') options.output = args[++i]
    else if (args[i] === '--name') options.name = args[++i]
  }

  if (!options.input) {
    console.log('使用方法: node process-tileset-v2.js <输入图片> [选项]')
    console.log('\n选项:')
    console.log('  --cols <n>        列数')
    console.log('  --rows <n>        行数')
    console.log('  --margin <n>      裁剪边距（跳过格子边缘的像素）')
    console.log('  --spacing <n>     格子间距')
    console.log('  --bg <color>      背景色，如 #aaaaaa')
    console.log('  --tolerance <n>   颜色容差（默认 40）')
    console.log('  --output <dir>    输出目录')
    console.log('  --name <prefix>   文件名前缀')
    console.log('\n示例:')
    console.log('  node process-tileset-v2.js trees.jpg --cols 5 --rows 4 --margin 20')
    process.exit(1)
  }

  return options
}

// 解析颜色
function parseColor(colorStr) {
  const hex = colorStr.replace('#', '')
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  }
}

// 颜色距离
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  )
}

// 自动检测背景色（采样边缘多个点）
function detectBackgroundColor(image, imgWidth, imgHeight) {
  const sampleCanvas = createCanvas(1, 1)
  const ctx = sampleCanvas.getContext('2d')

  // 采样点：左上、右上、左下、右下、左边缘、右边缘
  const samplePoints = [
    [0, 0],
    [imgWidth - 1, 0],
    [0, imgHeight - 1],
    [imgWidth - 1, imgHeight - 1],
    [0, Math.floor(imgHeight / 2)],
    [imgWidth - 1, Math.floor(imgHeight / 2)]
  ]

  const colors = samplePoints.map(([x, y]) => {
    ctx.drawImage(image, x, y, 1, 1, 0, 0, 1, 1)
    const data = ctx.getImageData(0, 0, 1, 1).data
    return { r: data[0], g: data[1], b: data[2] }
  })

  // 计算平均背景色
  const avgR = Math.round(colors.reduce((sum, c) => sum + c.r, 0) / colors.length)
  const avgG = Math.round(colors.reduce((sum, c) => sum + c.g, 0) / colors.length)
  const avgB = Math.round(colors.reduce((sum, c) => sum + c.b, 0) / colors.length)

  return { r: avgR, g: avgG, b: avgB }
}

// 自动检测网格布局（简单版本：基于尺寸推断）
function detectGrid(imgWidth, imgHeight) {
  // 常见 tileset 尺寸比例
  const commonSizes = [
    [16, 16], [32, 32], [48, 48], [64, 64], [128, 128],
    [256, 256], [512, 512]
  ]

  // 尝试找出最接近的 tile 尺寸
  for (const [w, h] of commonSizes) {
    if (imgWidth % w === 0 && imgHeight % h === 0) {
      return {
        cols: imgWidth / w,
        rows: imgHeight / h,
        tileWidth: w,
        tileHeight: h
      }
    }
  }

  // 如果不匹配常见尺寸，尝试估算
  // 假设 tile 是正方形，找到最大公约数
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)
  const tileSize = gcd(imgWidth, imgHeight)

  if (tileSize >= 16) {
    return {
      cols: imgWidth / tileSize,
      rows: imgHeight / tileSize,
      tileWidth: tileSize,
      tileHeight: tileSize
    }
  }

  // 默认：假设 64x64
  return {
    cols: Math.floor(imgWidth / 64),
    rows: Math.floor(imgHeight / 64),
    tileWidth: 64,
    tileHeight: 64
  }
}

async function processImage(options) {
  console.log('========================================')
  console.log('Tileset 处理脚本 v2')
  console.log('========================================\n')

  console.log(`加载图片: ${options.input}`)
  const image = await loadImage(options.input)

  const imgWidth = image.width
  const imgHeight = image.height

  console.log(`图片尺寸: ${imgWidth} x ${imgHeight}\n`)

  // 自动检测网格
  const grid = detectGrid(imgWidth, imgHeight)

  // 使用用户指定的 cols/rows 或自动检测结果
  const cols = options.cols || grid.cols
  const rows = options.rows || grid.rows

  // 计算 tile 尺寸（考虑 spacing）
  const tileWidth = Math.floor((imgWidth - (cols - 1) * options.spacing) / cols)
  const tileHeight = Math.floor((imgHeight - (rows - 1) * options.spacing) / rows)

  console.log(`网格布局:`)
  console.log(`  列数: ${cols}`)
  console.log(`  行数: ${rows}`)
  console.log(`  Tile 尺寸: ${tileWidth} x ${tileHeight}`)
  console.log(`  裁剪边距: ${options.margin} 像素`)
  console.log(`  格子间距: ${options.spacing} 像素`)
  console.log(`  总计: ${cols * rows} tiles\n`)

  // 检测或使用指定背景色
  let bgRgb
  if (options.bgColor) {
    bgRgb = parseColor(options.bgColor)
    console.log(`使用指定背景色: #${bgRgb.r.toString(16).padStart(2, '0')}${bgRgb.g.toString(16).padStart(2, '0')}${bgRgb.b.toString(16).padStart(2, '0')}`)
  } else {
    bgRgb = detectBackgroundColor(image, imgWidth, imgHeight)
    console.log(`自动检测背景色: #${bgRgb.r.toString(16).padStart(2, '0')}${bgRgb.g.toString(16).padStart(2, '0')}${bgRgb.b.toString(16).padStart(2, '0')}`)
  }
  console.log(`颜色容差: ${options.tolerance}\n`)

  // 输出目录
  const outputDir = path.join(process.cwd(), options.output)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const tiles = []

  // 裁剪每个 tile
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // 计算裁剪区域（考虑 spacing 和 margin）
      const srcX = col * (tileWidth + options.spacing) + options.margin
      const srcY = row * (tileHeight + options.spacing) + options.margin
      const actualWidth = tileWidth - 2 * options.margin
      const actualHeight = tileHeight - 2 * options.margin

      const tileCanvas = createCanvas(actualWidth, actualHeight)
      const ctx = tileCanvas.getContext('2d')

      // 绘制 tile 区域
      ctx.drawImage(
        image,
        srcX, srcY, actualWidth, actualHeight,
        0, 0, actualWidth, actualHeight
      )

      // 替换背景色为透明
      const imageData = ctx.getImageData(0, 0, actualWidth, actualHeight)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        if (colorDistance(r, g, b, bgRgb.r, bgRgb.g, bgRgb.b) < options.tolerance) {
          data[i + 3] = 0 // 设置透明
        }
      }

      ctx.putImageData(imageData, 0, 0)

      // 保存 tile
      const tileName = `${options.name}_${row}_${col}.png`
      const tilePath = path.join(outputDir, tileName)
      const buffer = tileCanvas.toBuffer('image/png')
      fs.writeFileSync(tilePath, buffer)

      tiles.push({
        name: tileName,
        row,
        col,
        width: actualWidth,
        height: actualHeight
      })

      process.stdout.write(`\r  处理进度: ${row * cols + col + 1}/${cols * rows} tiles`)
    }
  }

  console.log('\n\n生成的 tiles:')
  tiles.forEach(t => {
    const sizeKB = Math.round(fs.statSync(path.join(outputDir, t.name)).size / 1024)
    console.log(`  ${t.name}: ${t.width}x${t.height}, ${sizeKB}KB`)
  })

  // 生成配置文件
  const configFile = path.join(process.cwd(), 'src', 'data', 'tileset-config.js')
  const configContent = `/**
 * Tileset 配置文件
 * 由 process-tileset-v2.js 自动生成
 * 生成时间: ${new Date().toLocaleString('zh-CN')}
 */

const TILE_WIDTH = ${tileWidth - 2 * options.margin}
const TILE_HEIGHT = ${tileHeight - 2 * options.margin}
const GRID_COLS = ${cols}
const GRID_ROWS = ${rows}

// Tile 图片路径映射
const tileImages = {
${tiles.map(t => `  '${t.row}_${t.col}': '/src/assets/tileset/${t.name}'`).join(',\n')}
}

// 导出 spriteDefinition 格式（供 react-super-tilemap 使用）
export const spriteDefinition = Object.entries(tileImages).map(([key, src]) => ({
  key: \`tile_\${key}\`,
  imagesSrc: [src],
}))

export { TILE_WIDTH, TILE_HEIGHT, GRID_COLS, GRID_ROWS, tileImages }
`

  fs.writeFileSync(configFile, configContent)
  console.log(`\n========================================`)
  console.log(`处理完成!`)
  console.log(`========================================`)
  console.log(`输出目录: ${outputDir}`)
  console.log(`配置文件: ${configFile}`)
  console.log(`总计生成: ${tiles.length} 个 tiles`)
}

const options = parseArgs()
processImage(options).catch(err => {
  console.error('\n处理失败:', err.message)
  process.exit(1)
})