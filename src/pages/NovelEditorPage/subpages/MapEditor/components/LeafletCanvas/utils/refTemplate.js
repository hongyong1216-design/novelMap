// AI 参考图(邻居重叠模板)生成 —— 移植自 FrameRonin MapStitch 的 Gs/Si 逻辑
//
// 原理: 目标格与 8 个邻居格(含对角)在世界坐标上互相重叠 CELL_OVERLAP,
// 把每个已有图片的邻居"整张"按相对偏移画进目标格大小的画布,
// canvas 边界自动裁掉画布外的部分 → 只留下落在目标格内的重叠像素。
// 结果是一张"边缘实、中间透明"的 PNG: 交给 AI 补全透明区, 新图边缘天然与邻居无缝。
import { CELL_OVERLAP, cellId } from './grid'

// 参考图画布边长(px)。与格子虚拟尺寸无关, 按 AI 生图的常用输出分辨率取 2K
export const REF_TEMPLATE_SIZE = 2048

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`图片加载失败: ${src}`))
    img.src = src
  })

// 收集目标格 (x, y) 周边已有图片的邻居 (8 方向, 含对角)
export const filledNeighborsOf = (cells, x, y) => {
  const found = []
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue
      const cell = cells[cellId(x + dx, y + dy)]
      if (cell?.src) found.push({ dx, dy, src: cell.src })
    }
  }
  return found
}

// 生成参考图, 返回 { blob, neighborCount }; 周边没有已填充邻居时返回 null
export const buildRefTemplate = async (cells, x, y, size = REF_TEMPLATE_SIZE) => {
  const neighbors = filledNeighborsOf(cells, x, y)
  if (neighbors.length === 0) return null

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, size, size)
  // 手绘风地图缩放用平滑插值 (FrameRonin 面向像素风所以禁用, 此处是有意差异)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // 邻居偏移 = 格差 × 步进占比 × 画布边长; dx=±1 时邻居只剩 15% 落在画布内
  const step = (1 - CELL_OVERLAP) * size
  const sorted = [...neighbors].sort((a, b) => a.dy - b.dy || a.dx - b.dx)
  for (const n of sorted) {
    const img = await loadImage(n.src)
    ctx.drawImage(img, Math.round(n.dx * step), Math.round(n.dy * step), size, size)
  }

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('参考图导出失败'))), 'image/png')
  })
  return { blob, neighborCount: neighbors.length }
}

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 30000)
}
