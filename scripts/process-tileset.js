/**
 * 图片处理脚本 - 为 react-super-tilemap 生成 tileset
 *
 * 功能：
 * 1. 转换格式（JPEG → PNG）
 * 2. 添加透明通道（替换背景色为透明）
 * 3. 网格裁剪（按指定尺寸分割成独立 tile）
 * 4. 生成 tileset 配置文件
 *
 * 使用：
 * node scripts/process-tileset.js <输入图片> <tile宽度> <tile高度> [背景色]
 *
 * 示例：
 * node scripts/process-tileset.js input.jpg 128 128 #aaaaaa
 */

import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage } from 'canvas'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 解析参数
const args = process.argv.slice(2)
if (args.length < 3) {
  console.log('使用方法: node process-tileset.js <输入图片> <tile宽度> <tile高度> [背景色]')
  console.log('示例: node process-tileset.js trees.jpg 128 128 #aaaaaa')
  process.exit(1)
}

const inputPath = args[0]
const tileWidth = parseInt(args[1])
const tileHeight = parseInt(args[2])
const bgColor = args[3] || '#aaaaaa' // 默认灰色背景

// 输出目录
const outputDir = path.join(process.cwd(), 'src', 'assets', 'tileset')
const configFile = path.join(process.cwd(), 'src', 'data', 'tileset-config.js')

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
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

async function processImage() {
  console.log(`加载图片: ${inputPath}`)
  const image = await loadImage(inputPath)

  const imgWidth = image.width
  const imgHeight = image.height

  console.log(`图片尺寸: ${imgWidth} x ${imgHeight}`)
  console.log(`Tile 尺寸: ${tileWidth} x ${tileHeight}`)

  const cols = Math.floor(imgWidth / tileWidth)
  const rows = Math.floor(imgHeight / tileHeight)

  console.log(`网格: ${cols} 列 x ${rows} 行 = ${cols * rows} tiles`)

  const bgRgb = parseColor(bgColor)
  const tolerance = 40 // 颜色容差

  const tiles = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tileCanvas = createCanvas(tileWidth, tileHeight)
      const ctx = tileCanvas.getContext('2d')

      ctx.drawImage(
        image,
        col * tileWidth, row * tileHeight, tileWidth, tileHeight,
        0, 0, tileWidth, tileHeight
      )

      const imageData = ctx.getImageData(0, 0, tileWidth, tileHeight)
      const data = imageData.data

      // 替换背景色为透明
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        if (colorDistance(r, g, b, bgRgb.r, bgRgb.g, bgRgb.b) < tolerance) {
          data[i + 3] = 0
        }
      }

      ctx.putImageData(imageData, 0, 0)

      const tileName = `tile_${row}_${col}.png`
      const tilePath = path.join(outputDir, tileName)
      const buffer = tileCanvas.toBuffer('image/png')
      fs.writeFileSync(tilePath, buffer)

      tiles.push({ name: tileName, row, col })
      process.stdout.write(`\r  生成: ${row * cols + col + 1}/${cols * rows} tiles`)
    }
  }

  console.log('\n')

  // 生成配置文件
  const configContent = `/**
 * Tileset 配置文件
 * 由 process-tileset.js 自动生成
 */

const TILE_WIDTH = ${tileWidth}
const TILE_HEIGHT = ${tileHeight}

// Tile 图片路径映射
const tileImages = {
${tiles.map(t => `  '${t.row}_${t.col}': '/src/assets/tileset/${t.name}'`).join(',\n')}
}

// 导出 spriteDefinition 格式（供 react-super-tilemap 使用）
export const spriteDefinition = Object.entries(tileImages).map(([key, src]) => ({
  key: \`tile_\${key}\`,
  imagesSrc: [src],
}))

export { TILE_WIDTH, TILE_HEIGHT, tileImages }
`

  fs.writeFileSync(configFile, configContent)
  console.log(`配置文件已生成: ${configFile}`)
  console.log(`\n完成! 共生成 ${tiles.length} 个 tiles`)
  console.log(`输出目录: ${outputDir}`)
}

processImage().catch(err => {
  console.error('处理失败:', err)
  process.exit(1)
})