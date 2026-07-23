// 单格物理尺寸 (虚拟像素), 固定不变
export const PX_PER_CELL = 4096

// 相邻格重叠率 (借鉴 FrameRonin MapStitch): 格子步进 = PX_PER_CELL * (1 - CELL_OVERLAP),
// 相邻两格的图片互相压住对方 15%。重叠区内容由 AI 参考图机制保证一致,
// 显示时后渲染的格子覆盖先渲染的, 接缝自然无缝。设为 0 可回退到紧邻布局。
export const CELL_OVERLAP = 0.15
export const CELL_STEP = PX_PER_CELL * (1 - CELL_OVERLAP)

export const DEFAULT_GRID_SIZE = 32
export const MIN_GRID_SIZE = 1
export const MAX_GRID_SIZE = 64

// 世界总尺寸: 最后一格原点 + 完整格宽 (重叠布局下小于 gridSize * PX_PER_CELL)
export const worldSizeOf = (gridSize) => (gridSize - 1) * CELL_STEP + PX_PER_CELL

export const cellId = (x, y) => `L0-${x}-${y}`

// 从 cellId 解析坐标; 非 L0 / 格式错误返回 null
export const parseCellId = (id) => {
  if (typeof id !== 'string' || !id.startsWith('L0-')) return null
  const parts = id.split('-')
  if (parts.length !== 3) return null
  const x = parseInt(parts[1], 10)
  const y = parseInt(parts[2], 10)
  if (Number.isNaN(x) || Number.isNaN(y)) return null
  return { x, y }
}

// 格子图片的渲染范围: 原点按 CELL_STEP 步进, 尺寸仍是完整 PX_PER_CELL → 相邻格重叠 15%
export const cellImageBoundsLatLng = (x, y) => [
  [y * CELL_STEP, x * CELL_STEP],
  [y * CELL_STEP + PX_PER_CELL, x * CELL_STEP + PX_PER_CELL],
]

// 格子的"独占区"(不与邻居重叠): 未填充占位格用它渲染, 边框才不会叠出双线;
// 最末行/列没有下一格来接重叠带, 独占区延伸到完整格宽
export const cellExclusiveBoundsLatLng = (x, y, gridSize) => {
  const w = x === gridSize - 1 ? PX_PER_CELL : CELL_STEP
  const h = y === gridSize - 1 ? PX_PER_CELL : CELL_STEP
  return [
    [y * CELL_STEP, x * CELL_STEP],
    [y * CELL_STEP + h, x * CELL_STEP + w],
  ]
}

export const placeholderSvg = (x, y, filled, name) => {
  const bg     = filled ? '#1b1b3a' : '#0c0c1d'
  const stroke = filled ? '#5d4cb8' : '#2a2a4a'
  const color  = filled ? '#a29bfe' : '#3a3a5a'
  const dash   = filled ? '0' : '4 4'
  const id     = cellId(x, y)
  const label  = filled ? (name || id) : '未探索'
  const sub    = filled ? id : ''

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'>
    <rect width='256' height='256' fill='${bg}' stroke='${stroke}' stroke-width='1' stroke-dasharray='${dash}'/>
    <text x='128' y='124' text-anchor='middle' fill='${color}' font-size='16' font-family='monospace' font-weight='bold'>${label}</text>
    ${sub ? `<text x='128' y='148' text-anchor='middle' fill='${color}' font-size='11' font-family='monospace' opacity='0.6'>${sub}</text>` : ''}
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
