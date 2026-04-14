/**
 * 图片处理脚本 v3 - 泛洪填充去背景 + 固定尺寸输出
 *
 * 核心改进：
 * - 使用边缘泛洪填充（flood fill from edges）替代全局颜色匹配
 * - 不会误删内部与背景色相近的像素
 * - 边缘像素按颜色距离设置渐变 alpha（平滑过渡）
 * - 输出固定 128x128 透明 PNG
 *
 * 模式：
 *   --mode sheet   图集切割（默认）
 *   --mode single  单图去背景
 *
 * 使用：
 *   node scripts/process-tileset-v3.js input.jpg --mode sheet --cols 5 --rows 4
 *   node scripts/process-tileset-v3.js tree.png --mode single
 */

import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage } from 'canvas'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── 参数解析 ───────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    input: args[0],
    mode: 'sheet',
    cols: null,
    rows: null,
    size: 128,
    bgColor: null,
    tolerance: 35,
    output: 'src/assets/tileset',
    name: 'tile',
    padding: 4
  }

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--mode': options.mode = args[++i]; break
      case '--cols': options.cols = parseInt(args[++i]); break
      case '--rows': options.rows = parseInt(args[++i]); break
      case '--size': options.size = parseInt(args[++i]); break
      case '--bg': options.bgColor = args[++i]; break
      case '--tolerance': options.tolerance = parseInt(args[++i]); break
      case '--output': options.output = args[++i]; break
      case '--name': options.name = args[++i]; break
      case '--padding': options.padding = parseInt(args[++i]); break
    }
  }

  if (!options.input) {
    console.log('使用方法: node scripts/process-tileset-v3.js <输入图片> [选项]\n')
    console.log('模式:')
    console.log('  --mode sheet     图集切割（默认）')
    console.log('  --mode single    单图去背景\n')
    console.log('选项:')
    console.log('  --cols <n>       列数（sheet 模式，默认自动）')
    console.log('  --rows <n>       行数（sheet 模式，默认自动）')
    console.log('  --size <n>       输出尺寸（默认 128）')
    console.log('  --bg <color>     背景色，如 #aaaaaa（默认自动检测）')
    console.log('  --tolerance <n>  颜色容差（默认 35）')
    console.log('  --output <dir>   输出目录（默认 src/assets/tileset）')
    console.log('  --name <prefix>  文件名前缀（默认 tile）')
    console.log('  --padding <n>    内容边距（默认 4）\n')
    console.log('示例:')
    console.log('  node scripts/process-tileset-v3.js trees.jpg --mode sheet --cols 5 --rows 4')
    console.log('  node scripts/process-tileset-v3.js tree.png --mode single')
    process.exit(1)
  }

  return options
}

// ─── 工具函数 ───────────────────────────────────────────

function parseColor(colorStr) {
  const hex = colorStr.replace('#', '')
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  }
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

/**
 * 采样图片边缘中未透明的像素来检测背景色
 * 支持多次调用（每次泛洪后重新检测剩余的背景色）
 */
function detectBackgroundColor(imageData, width, height) {
  const data = imageData.data
  const samples = []

  // 采样四条边的未透明像素
  for (let x = 0; x < width; x++) {
    for (const y of [0, height - 1]) {
      const i = (y * width + x) * 4
      if (data[i + 3] > 128) {
        samples.push({ r: data[i], g: data[i + 1], b: data[i + 2] })
      }
    }
  }
  for (let y = 1; y < height - 1; y++) {
    for (const x of [0, width - 1]) {
      const i = (y * width + x) * 4
      if (data[i + 3] > 128) {
        samples.push({ r: data[i], g: data[i + 1], b: data[i + 2] })
      }
    }
  }

  if (samples.length === 0) return null

  // 用中位数
  samples.sort((a, b) => (a.r + a.g + a.b) - (b.r + b.g + b.b))
  const mid = Math.floor(samples.length / 2)
  return samples[mid]
}

// ─── 核心：泛洪填充去背景 ──────────────────────────────

/**
 * 从图片四条边开始 BFS 泛洪填充，标记背景像素为透明
 * 边缘像素按颜色距离设置渐变 alpha
 */
function floodFillRemoveBackground(imageData, width, height, bgColor, tolerance) {
  const data = imageData.data
  const totalPixels = width * height
  const visited = new Uint8Array(totalPixels) // 0=未访问, 1=已访问

  // 渐变过渡区间：tolerance ~ tolerance * 1.5
  const softEdge = tolerance * 1.5

  // BFS 队列：从四条边的所有像素开始
  const queue = []

  // 将四条边的像素加入队列
  for (let x = 0; x < width; x++) {
    queue.push(x)                          // 上边
    queue.push((height - 1) * width + x)   // 下边
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push(y * width)                  // 左边
    queue.push(y * width + (width - 1))    // 右边
  }

  // 先标记边缘种子点
  for (const idx of queue) {
    visited[idx] = 1
  }

  // BFS
  let head = 0
  while (head < queue.length) {
    const idx = queue[head++]
    const pi = idx * 4
    const r = data[pi]
    const g = data[pi + 1]
    const b = data[pi + 2]

    const dist = colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b)

    if (dist < tolerance) {
      // 完全背景 → 完全透明
      data[pi + 3] = 0

      // 扩展到 4 邻域
      const x = idx % width
      const y = Math.floor(idx / width)
      const neighbors = []
      if (x > 0) neighbors.push(idx - 1)
      if (x < width - 1) neighbors.push(idx + 1)
      if (y > 0) neighbors.push(idx - width)
      if (y < height - 1) neighbors.push(idx + width)

      for (const ni of neighbors) {
        if (!visited[ni]) {
          visited[ni] = 1
          queue.push(ni)
        }
      }
    } else if (dist < softEdge) {
      // 过渡区域 → 渐变 alpha（平滑边缘）
      const alpha = Math.round(((dist - tolerance) / (softEdge - tolerance)) * 255)
      data[pi + 3] = Math.min(data[pi + 3], alpha)
      // 过渡区域不继续扩展，作为边界
    }
    // dist >= softEdge → 保持不变，不扩展
  }

  return imageData
}

// ─── Auto-crop：裁剪透明边距 ────────────────────────────

function autoCrop(imageData, width, height) {
  const data = imageData.data
  let minX = width, minY = height, maxX = 0, maxY = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3]
      if (alpha > 0) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  // 没有内容
  if (maxX < minX || maxY < minY) {
    return { x: 0, y: 0, width: width, height: height }
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  }
}

// ─── 中心裁剪：从 tile 中心向外扩展，遇透明间隙停止 ────

/**
 * 用于图集模式：只保留距离 tile 中心最近的内容区域
 * 避免把邻格溢出的树木内容包含进来
 */
function centerCrop(imageData, width, height) {
  const data = imageData.data

  // 计算每列和每行的非透明像素数
  const colCounts = new Uint32Array(width)
  const rowCounts = new Uint32Array(height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 10) {
        colCounts[x]++
        rowCounts[y]++
      }
    }
  }

  // 设定"空白"阈值：一列/行中非透明像素少于 3% 认为是间隙
  const colThreshold = Math.max(2, height * 0.03)
  const rowThreshold = Math.max(2, width * 0.03)

  // 从中心向左右扩展，找到内容边界
  const cx = Math.floor(width / 2)
  const cy = Math.floor(height / 2)

  // 向左扫描：找到连续空白列（间隙宽度 >= gapSize 认为是边界）
  const gapSize = Math.max(3, Math.floor(Math.min(width, height) * 0.02))

  let left = 0
  for (let x = cx; x >= gapSize; x--) {
    let gapCount = 0
    for (let dx = 0; dx < gapSize; dx++) {
      if (colCounts[x - dx] < colThreshold) gapCount++
    }
    if (gapCount >= gapSize) {
      left = x - gapSize + 1
      // 找到间隙右边缘作为裁剪左边界
      for (let xx = x; xx >= 0; xx--) {
        if (colCounts[xx] >= colThreshold) { left = xx + 1; break }
      }
      break
    }
  }

  let right = width - 1
  for (let x = cx; x < width - gapSize; x++) {
    let gapCount = 0
    for (let dx = 0; dx < gapSize; dx++) {
      if (colCounts[x + dx] < colThreshold) gapCount++
    }
    if (gapCount >= gapSize) {
      right = x + gapSize - 1
      for (let xx = x; xx < width; xx++) {
        if (colCounts[xx] >= colThreshold) { right = xx - 1; break }
      }
      break
    }
  }

  let top = 0
  for (let y = cy; y >= gapSize; y--) {
    let gapCount = 0
    for (let dy = 0; dy < gapSize; dy++) {
      if (rowCounts[y - dy] < rowThreshold) gapCount++
    }
    if (gapCount >= gapSize) {
      top = y - gapSize + 1
      for (let yy = y; yy >= 0; yy--) {
        if (rowCounts[yy] >= rowThreshold) { top = yy + 1; break }
      }
      break
    }
  }

  let bottom = height - 1
  for (let y = cy; y < height - gapSize; y++) {
    let gapCount = 0
    for (let dy = 0; dy < gapSize; dy++) {
      if (rowCounts[y + dy] < rowThreshold) gapCount++
    }
    if (gapCount >= gapSize) {
      bottom = y + gapSize - 1
      for (let yy = y; yy < height; yy++) {
        if (rowCounts[yy] >= rowThreshold) { bottom = yy - 1; break }
      }
      break
    }
  }

  // 在裁剪区域内做精确的 auto-crop（去除边缘透明像素）
  let minX = right, maxX = left, minY = bottom, maxY = top
  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { x: 0, y: 0, width: width, height: height }
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  }
}

// ─── 对整张图去背景（返回去背景后的 canvas）───────────

function removeBackgroundFromFull(image, bgColor, tolerance) {
  const width = image.width
  const height = image.height
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)

  let imageData = ctx.getImageData(0, 0, width, height)

  if (bgColor) {
    // 用户指定了背景色，单次泛洪
    console.log(`背景色(指定): rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`)
    imageData = floodFillRemoveBackground(imageData, width, height, bgColor, tolerance)
  } else {
    // 自动检测：可能有多层背景色（如深灰网格线 + 浅白格子内部）
    // 多次泛洪，直到没有新的背景被移除（最多 3 次）
    let pass = 0
    while (pass < 3) {
      pass++
      const bg = detectBackgroundColor(imageData, width, height)
      if (bg === null) break

      // 只去除"灰色/白色"背景：要求低饱和度 + 亮度 > 150
      const maxChannel = Math.max(bg.r, bg.g, bg.b)
      const minChannel = Math.min(bg.r, bg.g, bg.b)
      const saturation = maxChannel - minChannel
      const brightness = (bg.r + bg.g + bg.b) / 3

      if (saturation > 30 || brightness < 140) {
        // 颜色饱和度太高或太暗，不像背景色，停止
        if (pass === 1) {
          console.log(`背景色: rgb(${bg.r}, ${bg.g}, ${bg.b}) (饱和度=${saturation}, 亮度=${brightness.toFixed(0)}，不像背景色)`)
        }
        break
      }

      // 检查检测到的背景色是否值得去除（至少 5% 的边缘像素匹配）
      const data = imageData.data
      let edgeMatch = 0, edgeTotal = 0
      for (let x = 0; x < width; x++) {
        for (const y of [0, height - 1]) {
          const i = (y * width + x) * 4
          if (data[i + 3] > 0) { // 只检查未透明的
            edgeTotal++
            const dist = colorDistance(data[i], data[i + 1], data[i + 2], bg.r, bg.g, bg.b)
            if (dist < tolerance) edgeMatch++
          }
        }
      }
      for (let y = 1; y < height - 1; y++) {
        for (const x of [0, width - 1]) {
          const i = (y * width + x) * 4
          if (data[i + 3] > 0) {
            edgeTotal++
            const dist = colorDistance(data[i], data[i + 1], data[i + 2], bg.r, bg.g, bg.b)
            if (dist < tolerance) edgeMatch++
          }
        }
      }

      const matchRatio = edgeTotal > 0 ? edgeMatch / edgeTotal : 0
      if (matchRatio < 0.03) {
        // 边缘几乎没有匹配的背景色了，停止
        if (pass === 1) {
          console.log(`背景色: rgb(${bg.r}, ${bg.g}, ${bg.b}) (边缘匹配率过低: ${(matchRatio * 100).toFixed(1)}%，跳过)`)
        }
        break
      }

      console.log(`背景色 pass${pass}: rgb(${bg.r}, ${bg.g}, ${bg.b}) (边缘匹配: ${(matchRatio * 100).toFixed(1)}%)`)
      imageData = floodFillRemoveBackground(imageData, width, height, bg, tolerance)
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return { canvas }
}

// ─── 从已去背景的 canvas 中裁剪一个 tile ────────────────

function cropAndResizeTile(srcCanvas, srcX, srcY, srcW, srcH, outputSize, padding, insetRatio) {
  // 1. 如果有 inset（图集模式），缩小裁剪区域以排除邻格溢出内容
  if (insetRatio > 0) {
    const insetX = Math.round(srcW * insetRatio)
    const insetY = Math.round(srcH * insetRatio)
    srcX += insetX
    srcY += insetY
    srcW -= 2 * insetX
    srcH -= 2 * insetY
  }

  // 2. 提取区域
  const tmpCanvas = createCanvas(srcW, srcH)
  const tmpCtx = tmpCanvas.getContext('2d')
  tmpCtx.drawImage(srcCanvas, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH)

  // 3. Auto-crop（找到非透明内容的 bounding box）
  const imageData = tmpCtx.getImageData(0, 0, srcW, srcH)
  const crop = autoCrop(imageData, srcW, srcH)

  // 3. 如果没有内容，返回空 tile
  if (crop.width <= 0 || crop.height <= 0) {
    return createCanvas(outputSize, outputSize)
  }

  // 4. 缩放到目标尺寸，居中放置
  const outCanvas = createCanvas(outputSize, outputSize)
  const outCtx = outCanvas.getContext('2d')

  const innerSize = outputSize - 2 * padding
  const scale = Math.min(innerSize / crop.width, innerSize / crop.height)
  const drawWidth = Math.round(crop.width * scale)
  const drawHeight = Math.round(crop.height * scale)
  const offsetX = Math.round((outputSize - drawWidth) / 2)
  const offsetY = Math.round((outputSize - drawHeight) / 2)

  outCtx.drawImage(
    tmpCanvas,
    crop.x, crop.y, crop.width, crop.height,
    offsetX, offsetY, drawWidth, drawHeight
  )

  return outCanvas
}

// ─── 处理单个图片（single 模式）──────────────────────────

function processSingleImage(image, bgColor, tolerance, outputSize, padding) {
  const { canvas } = removeBackgroundFromFull(image, bgColor, tolerance)
  const outCanvas = cropAndResizeTile(canvas, 0, 0, image.width, image.height, outputSize, padding, 0)
  return { canvas: outCanvas }
}

// ─── 投影分析：找到透明间隙来确定实际切割边界 ─────────

/**
 * 在去背景后的图片上，通过列/行投影找到内容间的间隙
 * 返回 n+1 个边界值（包含 0 和 totalSize）
 */
function findContentBoundaries(imageData, width, height, axis, count) {
  const data = imageData.data

  // 计算每列/行的非透明像素数
  const profileLen = axis === 'x' ? width : height
  const profile = new Float64Array(profileLen)

  if (axis === 'x') {
    for (let x = 0; x < width; x++) {
      let cnt = 0
      for (let y = 0; y < height; y++) {
        if (data[(y * width + x) * 4 + 3] > 10) cnt++
      }
      profile[x] = cnt
    }
  } else {
    for (let y = 0; y < height; y++) {
      let cnt = 0
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 10) cnt++
      }
      profile[y] = cnt
    }
  }

  // 找到所有间隙（连续 profile 值接近 0 的区域）
  const threshold = (axis === 'x' ? height : width) * 0.02 // 2% 算空白
  const gaps = []
  let inGap = false
  let gapStart = 0

  for (let i = 0; i < profileLen; i++) {
    if (profile[i] <= threshold && !inGap) {
      inGap = true
      gapStart = i
    } else if (profile[i] > threshold && inGap) {
      inGap = false
      gaps.push({ start: gapStart, end: i, mid: Math.round((gapStart + i) / 2), width: i - gapStart })
    }
  }
  if (inGap) {
    gaps.push({ start: gapStart, end: profileLen, mid: Math.round((gapStart + profileLen) / 2), width: profileLen - gapStart })
  }

  // 需要 count-1 个分隔线
  const neededGaps = count - 1
  if (gaps.length < neededGaps) {
    // 间隙不够，回退到均匀分割
    console.log(`  警告: ${axis}轴只找到 ${gaps.length} 个间隙，需要 ${neededGaps} 个，使用均匀分割`)
    const boundaries = [0]
    for (let i = 1; i < count; i++) {
      boundaries.push(Math.round(i * profileLen / count))
    }
    boundaries.push(profileLen)
    return boundaries
  }

  // 过滤掉边缘间隙（接触图片边界的间隙不是树之间的分隔）
  const internalGaps = gaps.filter(g => g.start > 0 && g.end < profileLen)

  // 合并相邻间隙（间隔 < 10px 的视为同一间隙）
  const mergedGaps = []
  for (const gap of internalGaps) {
    if (mergedGaps.length > 0) {
      const last = mergedGaps[mergedGaps.length - 1]
      if (gap.start - last.end < 10) {
        last.end = gap.end
        last.mid = Math.round((last.start + gap.end) / 2)
        last.width = last.end - last.start
        continue
      }
    }
    mergedGaps.push({ ...gap })
  }

  if (mergedGaps.length < neededGaps) {
    // 内部间隙不够，回退到均匀分割
    console.log(`  警告: ${axis}轴内部间隙不足(${mergedGaps.length}/${neededGaps})，使用均匀分割`)
    const boundaries = [0]
    for (let i = 1; i < count; i++) {
      boundaries.push(Math.round(i * profileLen / count))
    }
    boundaries.push(profileLen)
    return boundaries
  }

  // 选取最宽的 neededGaps 个间隙，按位置排序
  const sortedByWidth = [...mergedGaps].sort((a, b) => b.width - a.width)
  const selectedGaps = sortedByWidth.slice(0, neededGaps).sort((a, b) => a.mid - b.mid)

  const boundaries = [0]
  for (const gap of selectedGaps) {
    boundaries.push(gap.mid)
  }
  // 避免末尾重复（当最后一个 gap.mid 恰好等于 profileLen 时）
  if (boundaries[boundaries.length - 1] !== profileLen) {
    boundaries.push(profileLen)
  }

  boundaries.push(profileLen)
  return boundaries
}

// ─── 自动检测网格 ───────────────────────────────────────

function detectGrid(imgWidth, imgHeight) {
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)
  const tileSize = gcd(imgWidth, imgHeight)

  if (tileSize >= 64) {
    return {
      cols: imgWidth / tileSize,
      rows: imgHeight / tileSize
    }
  }

  // 尝试常见布局
  for (const size of [512, 256, 128, 64]) {
    if (imgWidth % size === 0 && imgHeight % size === 0) {
      return { cols: imgWidth / size, rows: imgHeight / size }
    }
  }

  // 回退：尝试合理的 tile 数量
  for (const cols of [8, 6, 5, 4, 3, 2]) {
    if (imgWidth % cols === 0) {
      const tileW = imgWidth / cols
      for (const rows of [8, 6, 5, 4, 3, 2]) {
        if (imgHeight % rows === 0) {
          return { cols, rows }
        }
      }
    }
  }

  return { cols: 1, rows: 1 }
}

// ─── 主流程 ─────────────────────────────────────────────

async function main() {
  const options = parseArgs()

  console.log('========================================')
  console.log('Tileset 处理脚本 v3 (泛洪填充去背景)')
  console.log('========================================\n')

  console.log(`加载图片: ${options.input}`)
  const image = await loadImage(options.input)
  const imgWidth = image.width
  const imgHeight = image.height
  console.log(`图片尺寸: ${imgWidth} x ${imgHeight}`)
  console.log(`模式: ${options.mode}`)
  console.log(`输出尺寸: ${options.size}x${options.size}`)
  console.log(`颜色容差: ${options.tolerance}`)
  console.log(`内容边距: ${options.padding}\n`)

  // 解析背景色
  const bgColor = options.bgColor ? parseColor(options.bgColor) : null

  const outputDir = path.join(process.cwd(), options.output)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const tiles = []

  if (options.mode === 'single') {
    // ── 单图模式 ──
    console.log('处理单图...')
    const result = processSingleImage(image, bgColor, options.tolerance, options.size, options.padding)

    const tileName = `${options.name}.png`
    const tilePath = path.join(outputDir, tileName)
    fs.writeFileSync(tilePath, result.canvas.toBuffer('image/png'))
    console.log(`输出: ${tilePath}`)
    tiles.push({ name: tileName, row: 0, col: 0 })

  } else {
    // ── 图集模式 ──
    const grid = detectGrid(imgWidth, imgHeight)
    const cols = options.cols || grid.cols
    const rows = options.rows || grid.rows

    console.log(`网格: ${cols} 列 x ${rows} 行`)
    console.log(`总计: ${cols * rows} tiles\n`)

    console.log('步骤 1/3: 整张图去背景...')
    const { canvas: cleanCanvas } = removeBackgroundFromFull(image, bgColor, options.tolerance)
    const cleanCtx = cleanCanvas.getContext('2d')
    const cleanData = cleanCtx.getImageData(0, 0, imgWidth, imgHeight)

    console.log('步骤 2/3: 分析行列边界...')
    // 先找行边界（全图水平投影，通常比较可靠）
    const rowBounds = findContentBoundaries(cleanData, imgWidth, imgHeight, 'y', rows)
    console.log(`  行边界: [${rowBounds.join(', ')}]`)

    // 对每行单独做列投影，找到该行内各棵树的边界
    const rowColBounds = []
    for (let row = 0; row < rows; row++) {
      const y0 = rowBounds[row]
      const y1 = rowBounds[row + 1]
      const rowH = y1 - y0
      // 提取该行区域的像素数据
      const rowData = cleanCtx.getImageData(0, y0, imgWidth, rowH)
      const bounds = findContentBoundaries(rowData, imgWidth, rowH, 'x', cols)
      rowColBounds.push(bounds)
      console.log(`  行${row} 列边界: [${bounds.join(', ')}]`)
    }

    console.log('步骤 3/3: 切割并缩放...')
    for (let row = 0; row < rows; row++) {
      const colBounds = rowColBounds[row]
      for (let col = 0; col < cols; col++) {
        const srcX = colBounds[col]
        const srcY = rowBounds[row]
        const srcX2 = colBounds[col + 1]
        const srcY2 = rowBounds[row + 1]

        const outCanvas = cropAndResizeTile(
          cleanCanvas,
          srcX, srcY, srcX2 - srcX, srcY2 - srcY,
          options.size, options.padding, 0
        )

        const tileName = `${options.name}_${row}_${col}.png`
        const tilePath = path.join(outputDir, tileName)
        fs.writeFileSync(tilePath, outCanvas.toBuffer('image/png'))

        tiles.push({ name: tileName, row, col })
        process.stdout.write(`\r  处理进度: ${row * cols + col + 1}/${cols * rows} tiles`)
      }
    }

    console.log('\n')

    // 生成配置文件
    const configFile = path.join(process.cwd(), 'src', 'data', 'tileset-config.js')
    const configContent = `/**
 * Tileset 配置文件
 * 由 process-tileset-v3.js 自动生成
 * 生成时间: ${new Date().toLocaleString('zh-CN')}
 */

const TILE_WIDTH = ${options.size}
const TILE_HEIGHT = ${options.size}
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
    console.log(`配置文件已更新: ${configFile}`)
  }

  console.log('\n========================================')
  console.log('处理完成!')
  console.log('========================================')
  console.log(`输出目录: ${outputDir}`)
  console.log(`总计: ${tiles.length} 个 tiles (${options.size}x${options.size})`)
}

main().catch(err => {
  console.error('\n处理失败:', err.message)
  console.error(err.stack)
  process.exit(1)
})
