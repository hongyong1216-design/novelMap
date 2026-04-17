/**
 * 多尺寸精灵图切割工具 — 混合策略
 *
 * 处理流程：
 * 1. 去除棋盘格背景 + 暗色网格线 → 真正的 alpha 透明
 * 2. 投影分析检测行列间隙 → 定义网格
 * 3. 对每个网格区域检查内容 → 标记有/无
 * 4. 泛洪分组相邻有内容的格子 → 多格精灵
 * 5. 提取每个精灵，输出带正确宽高比的 PNG + spriteDefinition
 *
 * 使用：
 *   node scripts/process-multisize-sprites.js <输入图片> [选项]
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
    output: 'src/assets/sprites',
    name: 'sprite',
    tileSize: 128,
    padding: 4,
    config: null,
    bgTolerance: 30,
    gridLineBrightness: 80,
    contentThreshold: 0.01,
    gapThreshold: 0.10,
    minGapPx: 1,
  }

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--output': options.output = args[++i]; break
      case '--name': options.name = args[++i]; break
      case '--tile-size': options.tileSize = parseInt(args[++i]); break
      case '--padding': options.padding = parseInt(args[++i]); break
      case '--config': options.config = args[++i]; break
      case '--bg-tolerance': options.bgTolerance = parseInt(args[++i]); break
      case '--content-threshold': options.contentThreshold = parseFloat(args[++i]); break
    }
  }

  if (!options.input) {
    console.log(`
多尺寸精灵图切割工具
====================

使用: node scripts/process-multisize-sprites.js <输入图片> [选项]

选项:
  --output <dir>        输出目录（默认 src/assets/sprites）
  --name <prefix>       文件名前缀（默认 sprite）
  --tile-size <n>       输出基础瓦片像素（默认 128）
  --padding <n>         精灵内边距 px（默认 4）
  --config <path>       配置输出路径
  --bg-tolerance <n>    背景色容差（默认 30）

示例:
  node scripts/process-multisize-sprites.js mountains.png --name mountain --tile-size 128
`)
    process.exit(1)
  }

  if (!options.config) {
    options.config = `src/data/${options.name}-sprites-config.js`
  }

  return options
}

// ─── 背景去除 ───────────────────────────────────────────

function detectBackgroundColors(data, W, H) {
  const corners = [
    { x0: 0, y0: 0 },
    { x0: W - 20, y0: 0 },
    { x0: 0, y0: H - 20 },
    { x0: W - 20, y0: H - 20 },
  ]

  const colorCounts = {}
  for (const { x0, y0 } of corners) {
    for (let y = y0; y < y0 + 20 && y < H; y++) {
      for (let x = x0; x < x0 + 20 && x < W; x++) {
        const i = (y * W + x) * 4
        const r = Math.round(data[i] / 5) * 5
        const g = Math.round(data[i + 1] / 5) * 5
        const b = Math.round(data[i + 2] / 5) * 5
        const key = `${r},${g},${b}`
        colorCounts[key] = (colorCounts[key] || 0) + 1
      }
    }
  }

  const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])
  return sorted.slice(0, 2).map(([key]) => {
    const [r, g, b] = key.split(',').map(Number)
    return { r, g, b }
  })
}

function removeBackground(data, W, H, bgColors, tolerance) {
  const total = W * H
  const visited = new Uint8Array(total)
  const queue = []

  function colorDist(pi, bg) {
    return Math.sqrt((data[pi] - bg.r) ** 2 + (data[pi + 1] - bg.g) ** 2 + (data[pi + 2] - bg.b) ** 2)
  }

  for (let x = 0; x < W; x++) {
    queue.push(x); queue.push((H - 1) * W + x)
  }
  for (let y = 1; y < H - 1; y++) {
    queue.push(y * W); queue.push(y * W + W - 1)
  }
  for (const idx of queue) visited[idx] = 1

  const softEdge = tolerance * 1.4
  let head = 0
  while (head < queue.length) {
    const idx = queue[head++]
    const pi = idx * 4
    const minDist = Math.min(...bgColors.map(bg => colorDist(pi, bg)))
    if (minDist < tolerance) {
      data[pi + 3] = 0
      const x = idx % W, y = Math.floor(idx / W)
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = x + dx, ny = y + dy
        if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
          const ni = ny * W + nx
          if (!visited[ni]) { visited[ni] = 1; queue.push(ni) }
        }
      }
    } else if (minDist < softEdge) {
      const alpha = Math.round(((minDist - tolerance) / (softEdge - tolerance)) * 255)
      data[pi + 3] = Math.min(data[pi + 3], alpha)
    }
  }
}

function removeGridLines(data, W, H, maxBrightness) {
  const total = W * H
  const queue = []
  const visited = new Uint8Array(total)

  // 从已透明像素的邻居开始
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = y * W + x
      if (data[idx * 4 + 3] === 0) continue
      let hasTransN = false
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = x + dx, ny = y + dy
        if (nx >= 0 && nx < W && ny >= 0 && ny < H && data[(ny * W + nx) * 4 + 3] === 0) {
          hasTransN = true; break
        }
      }
      if (hasTransN) { visited[idx] = 1; queue.push(idx) }
    }
  }

  let head = 0, removed = 0
  while (head < queue.length) {
    const idx = queue[head++]
    const pi = idx * 4
    if (data[pi + 3] === 0) continue
    const r = data[pi], g = data[pi + 1], b = data[pi + 2]
    const brightness = (r + g + b) / 3
    const sat = Math.max(r, g, b) - Math.min(r, g, b)
    if (brightness < maxBrightness && sat < 15) {
      data[pi + 3] = 0
      removed++
      const x = idx % W, y = Math.floor(idx / W)
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = x + dx, ny = y + dy
        if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
          const ni = ny * W + nx
          if (!visited[ni] && data[ni * 4 + 3] > 0) { visited[ni] = 1; queue.push(ni) }
        }
      }
    }
  }
  return removed
}

// ─── 网格检测 ───────────────────────────────────────────

/**
 * 在去背景后的图片上，通过投影分析找到行列间隙
 */
function detectGridGaps(data, W, H, gapThreshold, minGapPx) {
  // 每列非透明像素比率
  const colRatio = new Float64Array(W)
  for (let x = 0; x < W; x++) {
    let cnt = 0
    for (let y = 0; y < H; y++) {
      if (data[(y * W + x) * 4 + 3] > 20) cnt++
    }
    colRatio[x] = cnt / H
  }

  // 每行非透明像素比率
  const rowRatio = new Float64Array(H)
  for (let y = 0; y < H; y++) {
    let cnt = 0
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > 20) cnt++
    }
    rowRatio[y] = cnt / W
  }

  function findGaps(profile, totalLen, threshold, minWidth) {
    const gaps = []
    let inGap = false, start = 0
    for (let i = 0; i < totalLen; i++) {
      if (profile[i] <= threshold) {
        if (!inGap) { inGap = true; start = i }
      } else {
        if (inGap) {
          if (i - start >= minWidth) gaps.push({ start, end: i })
          inGap = false
        }
      }
    }
    if (inGap && totalLen - start >= minWidth) gaps.push({ start, end: totalLen })
    return gaps
  }

  return {
    colGaps: findGaps(colRatio, W, gapThreshold, minGapPx),
    rowGaps: findGaps(rowRatio, H, gapThreshold, minGapPx),
  }
}

/**
 * 在局部矩形区域内检测间隙（列或行方向）
 * axis='x' → 检测列间隙, axis='y' → 检测行间隙
 */
function detectSubGaps(data, W, colStart, colEnd, rowStart, rowEnd, axis, gapThreshold, minGapPx) {
  if (axis === 'x') {
    const w = colEnd - colStart
    const h = rowEnd - rowStart
    const gaps = []
    let inGap = false, start = 0
    for (let x = colStart; x < colEnd; x++) {
      let cnt = 0
      for (let y = rowStart; y < rowEnd; y++) {
        if (data[(y * W + x) * 4 + 3] > 20) cnt++
      }
      const ratio = cnt / h
      if (ratio <= gapThreshold) {
        if (!inGap) { inGap = true; start = x }
      } else {
        if (inGap) {
          if (x - start >= minGapPx) gaps.push({ start, end: x })
          inGap = false
        }
      }
    }
    if (inGap && colEnd - start >= minGapPx) gaps.push({ start, end: colEnd })
    return gaps
  } else {
    const w = colEnd - colStart
    const gaps = []
    let inGap = false, start = 0
    for (let y = rowStart; y < rowEnd; y++) {
      let cnt = 0
      for (let x = colStart; x < colEnd; x++) {
        if (data[(y * W + x) * 4 + 3] > 20) cnt++
      }
      const ratio = cnt / w
      if (ratio <= gapThreshold) {
        if (!inGap) { inGap = true; start = y }
      } else {
        if (inGap) {
          if (y - start >= minGapPx) gaps.push({ start, end: y })
          inGap = false
        }
      }
    }
    if (inGap && rowEnd - start >= minGapPx) gaps.push({ start, end: rowEnd })
    return gaps
  }
}

/**
 * 从间隙列表提取内容区间
 */
function gapsToRegions(gaps, totalSize) {
  const regions = []
  let cursor = 0

  if (gaps.length > 0 && gaps[0].start <= 2) {
    cursor = gaps[0].end
  }

  for (const gap of gaps) {
    if (gap.start > cursor) {
      regions.push({ start: cursor, end: gap.start })
    }
    cursor = Math.max(cursor, gap.end)
  }

  if (cursor < totalSize - 2) {
    regions.push({ start: cursor, end: totalSize })
  }

  return regions
}

// ─── 泛洪分组 ──────────────────────────────────────────

function floodFillGroups(grid, numRows, numCols) {
  const visited = Array.from({ length: numRows }, () => Array(numCols).fill(false))
  const groups = []

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (visited[r][c] || !grid[r][c]) continue
      const group = []
      const queue = [[r, c]]
      visited[r][c] = true
      while (queue.length > 0) {
        const [cr, cc] = queue.shift()
        group.push({ row: cr, col: cc })
        for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          const nr = cr + dr, nc = cc + dc
          if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols && !visited[nr][nc] && grid[nr][nc]) {
            visited[nr][nc] = true
            queue.push([nr, nc])
          }
        }
      }
      groups.push(group)
    }
  }
  return groups
}

// ─── 精灵提取 ──────────────────────────────────────────

function preciseContentBounds(data, W, px0, py0, px1, py1) {
  let minX = px1, maxX = px0, minY = py1, maxY = py0
  for (let y = py0; y < py1; y++) {
    for (let x = px0; x < px1; x++) {
      if (data[(y * W + x) * 4 + 3] > 20) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < minX) return null
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
}

function extractSprite(srcCanvas, bounds, tileW, tileH, tileSize, padding) {
  const outW = tileW * tileSize
  const outH = tileH * tileSize
  const outCanvas = createCanvas(outW, outH)
  const ctx = outCanvas.getContext('2d')

  const { x, y, w, h } = bounds
  const innerW = outW - padding * 2
  const innerH = outH - padding * 2
  const scale = Math.min(innerW / w, innerH / h)
  const drawW = Math.round(w * scale)
  const drawH = Math.round(h * scale)
  const offsetX = Math.round((outW - drawW) / 2)
  const offsetY = outH - padding - drawH

  ctx.drawImage(srcCanvas, x, y, w, h, offsetX, offsetY, drawW, drawH)
  return outCanvas
}

// ─── 主流程 ─────────────────────────────────────────────

async function main() {
  const options = parseArgs()

  console.log('============================================')
  console.log('多尺寸精灵图切割工具')
  console.log('============================================\n')

  console.log(`加载图片: ${options.input}`)
  const image = await loadImage(options.input)
  const W = image.width, H = image.height
  console.log(`图片尺寸: ${W} x ${H}\n`)

  const srcCanvas = createCanvas(W, H)
  const srcCtx = srcCanvas.getContext('2d')
  srcCtx.drawImage(image, 0, 0)
  const imgData = srcCtx.getImageData(0, 0, W, H)
  const data = imgData.data

  // ── 步骤 1: 去除背景 ──
  console.log('步骤 1/5: 去除背景...')
  const bgColors = detectBackgroundColors(data, W, H)
  console.log(`  棋盘格颜色: ${bgColors.map(c => `rgb(${c.r},${c.g},${c.b})`).join(' + ')}`)
  removeBackground(data, W, H, bgColors, options.bgTolerance)

  const gridRemoved = removeGridLines(data, W, H, options.gridLineBrightness)
  console.log(`  网格线移除: ${gridRemoved} px`)

  srcCtx.putImageData(imgData, 0, 0)

  let transCount = 0
  for (let i = 3; i < data.length; i += 4) if (data[i] === 0) transCount++
  console.log(`  透明像素: ${(transCount / (W * H) * 100).toFixed(1)}%\n`)

  // 保存去背景后的中间结果（调试用）
  const debugPath = path.join(process.cwd(), options.output, '_debug_cleaned.png')
  const debugDir = path.dirname(debugPath)
  if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true })
  fs.writeFileSync(debugPath, srcCanvas.toBuffer('image/png'))
  console.log(`  调试图已保存: ${debugPath}\n`)

  // ── 步骤 2: 全局网格检测 ──
  console.log('步骤 2/5: 检测全局网格...')
  const { colGaps, rowGaps } = detectGridGaps(data, W, H, options.gapThreshold, options.minGapPx)
  console.log(`  列间隙: ${colGaps.length} 条`)
  console.log(`  行间隙: ${rowGaps.length} 条`)

  const globalColRegions = gapsToRegions(colGaps, W)
  const globalRowRegions = gapsToRegions(rowGaps, H)
  console.log(`  全局列区间: ${globalColRegions.length}`)
  console.log(`  全局行区间: ${globalRowRegions.length}`)

  // 打印列区间
  for (const r of globalColRegions) {
    console.log(`    列 [${r.start}-${r.end}] 宽度 ${r.end - r.start}px`)
  }
  for (const r of globalRowRegions) {
    console.log(`    行 [${r.start}-${r.end}] 高度 ${r.end - r.start}px`)
  }
  console.log()

  // ── 步骤 3: 在每个大区域内做精细网格检测 ──
  console.log('步骤 3/5: 精细网格检测...')

  const allCells = []

  for (const colR of globalColRegions) {
    for (const rowR of globalRowRegions) {
      // 在此矩形区域内检测子列间隙
      const subColGaps = detectSubGaps(data, W, colR.start, colR.end, rowR.start, rowR.end, 'x', 0.10, 1)
      const subColRegions = gapsToRegions(subColGaps, colR.end)
        .filter(r => r.start >= colR.start && r.end <= colR.end)
      const subCols = subColRegions.length > 0 ? subColRegions : [{ start: colR.start, end: colR.end }]

      // 在此矩形区域内检测子行间隙
      const subRowGaps = detectSubGaps(data, W, colR.start, colR.end, rowR.start, rowR.end, 'y', 0.10, 1)
      const subRowRegions = gapsToRegions(subRowGaps, rowR.end)
        .filter(r => r.start >= rowR.start && r.end <= rowR.end)
      const subRows = subRowRegions.length > 0 ? subRowRegions : [{ start: rowR.start, end: rowR.end }]

      console.log(`  区域 [${colR.start}-${colR.end}]x[${rowR.start}-${rowR.end}]: ${subCols.length}列 × ${subRows.length}行`)

      for (const sc of subCols) {
        for (const sr of subRows) {
          const w = sc.end - sc.start
          const h = sr.end - sr.start
          // 过滤掉太小的残留格（宽或高 < 50px）
          if (w < 50 || h < 50) continue
          allCells.push({ px0: sc.start, py0: sr.start, px1: sc.end, py1: sr.end })
        }
      }
    }
  }

  console.log(`  总网格单元: ${allCells.length}\n`)

  // ── 步骤 4: 检查内容 + 分组 ──
  console.log('步骤 4/5: 检查内容并分组...')

  // 检查每个 cell 是否有内容
  for (const cell of allCells) {
    const { px0, py0, px1, py1 } = cell
    let contentPx = 0
    const area = (px1 - px0) * (py1 - py0)
    for (let y = py0; y < py1; y++) {
      for (let x = px0; x < px1; x++) {
        if (data[(y * W + x) * 4 + 3] > 20) contentPx++
      }
    }
    cell.hasContent = contentPx / area > options.contentThreshold && contentPx > 200
  }

  const withContent = allCells.filter(c => c.hasContent)
  console.log(`  有内容: ${withContent.length} / ${allCells.length}`)

  // 每个有内容的 cell 就是一个独立精灵（网格检测已经正确分割了）
  const groups = withContent.map(c => [c])

  console.log(`  精灵数: ${groups.length}\n`)

  // ── 步骤 5: 提取精灵 ──
  console.log('步骤 5/5: 提取精灵...\n')

  const outputDir = path.join(process.cwd(), options.output)
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  // 计算基础格尺寸：用出现次数最多的 cell 尺寸（众数）
  const sizeKey = (c) => `${Math.round((c.px1 - c.px0) / 10) * 10}x${Math.round((c.py1 - c.py0) / 10) * 10}`
  const sizeCounts = {}
  for (const c of allCells) {
    const k = sizeKey(c)
    sizeCounts[k] = (sizeCounts[k] || 0) + 1
  }
  const mostCommon = Object.entries(sizeCounts).sort((a, b) => b[1] - a[1])[0]
  const [baseW, baseH] = mostCommon[0].split('x').map(Number)
  const baseCellW = baseW || 128
  const baseCellH = baseH || 128
  console.log(`  基础格: ${baseCellW}px x ${baseCellH}px (出现 ${mostCommon[1]} 次)`)

  const results = []

  // 按位置排序
  groups.sort((a, b) => {
    const ay = Math.min(...a.map(c => c.py0))
    const by = Math.min(...b.map(c => c.py0))
    if (Math.abs(ay - by) > 30) return ay - by
    return Math.min(...a.map(c => c.px0)) - Math.min(...b.map(c => c.px0))
  })

  for (let idx = 0; idx < groups.length; idx++) {
    const group = groups[idx]

    // 计算精灵的像素 bounding box
    const gpx0 = Math.min(...group.map(c => c.px0))
    const gpy0 = Math.min(...group.map(c => c.py0))
    const gpx1 = Math.max(...group.map(c => c.px1))
    const gpy1 = Math.max(...group.map(c => c.py1))

    // 精确内容 bounds
    const bounds = preciseContentBounds(data, W, gpx0, gpy0, gpx1, gpy1)
    if (!bounds || bounds.w < 5 || bounds.h < 5) continue

    // 计算占格数
    const tileW = Math.max(1, Math.round(bounds.w / baseCellW))
    const tileH = Math.max(1, Math.round(bounds.h / baseCellH))

    const spriteCanvas = extractSprite(srcCanvas, bounds, tileW, tileH, options.tileSize, options.padding)

    const fileName = `${options.name}_${results.length}.png`
    const filePath = path.join(outputDir, fileName)
    fs.writeFileSync(filePath, spriteCanvas.toBuffer('image/png'))

    results.push({
      idx: results.length,
      fileName,
      tileW,
      tileH,
      outW: spriteCanvas.width,
      outH: spriteCanvas.height,
      contentW: bounds.w,
      contentH: bounds.h,
    })

    console.log(`  [${String(results.length - 1).padStart(2)}] ${fileName.padEnd(20)} 占格:${String(tileW).padStart(2)}x${tileH}  内容:${bounds.w}x${bounds.h}px  输出:${spriteCanvas.width}x${spriteCanvas.height}px`)
  }

  console.log()

  // ── 生成配置 ──
  const configPath = path.join(process.cwd(), options.config)
  const configDir = path.dirname(configPath)
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true })

  const spriteEntries = results.map(s => {
    const sizeProp = (s.tileW === 1 && s.tileH === 1)
      ? ''
      : `\n  size: { width: ${s.tileW}, height: ${s.tileH} },`
    return `{
  key: '${options.name}_${s.idx}',
  imagesSrc: ['/${options.output}/${s.fileName}'],${sizeProp}
}`
  })

  const configContent = `/**
 * 多尺寸精灵配置
 * 由 process-multisize-sprites.js 自动生成
 * 生成时间: ${new Date().toLocaleString('zh-CN')}
 * 源图: ${path.basename(options.input)}
 * 共 ${results.length} 个精灵
 */

export const ${options.name}SpriteDefinition = [
  ${spriteEntries.join(',\n  ')}
]

// 按占格大小分类
export const ${options.name}BySize = {
${[...new Set(results.map(s => `${s.tileW}x${s.tileH}`))]
  .sort()
  .map(size => {
    const [w, h] = size.split('x').map(Number)
    const names = results.filter(s => s.tileW === w && s.tileH === h).map(s => `'${options.name}_${s.idx}'`)
    return `  '${size}': [${names.join(', ')}],`
  }).join('\n')}
}
`

  fs.writeFileSync(configPath, configContent)
  console.log(`配置文件: ${configPath}`)

  const sizeStats = {}
  for (const s of results) {
    const key = `${s.tileW}x${s.tileH}`
    sizeStats[key] = (sizeStats[key] || 0) + 1
  }

  console.log('\n============================================')
  console.log('处理完成!')
  console.log('============================================')
  console.log(`输出目录: ${outputDir}`)
  console.log(`总计: ${results.length} 个精灵`)
  console.log('尺寸分布:')
  for (const [size, count] of Object.entries(sizeStats).sort()) {
    console.log(`  ${size}: ${count} 个`)
  }
  console.log(`\n使用方式:\n  import { ${options.name}SpriteDefinition } from '../data/${path.basename(options.config, '.js')}'\n`)
}

main().catch(err => {
  console.error('\n处理失败:', err.message)
  console.error(err.stack)
  process.exit(1)
})
