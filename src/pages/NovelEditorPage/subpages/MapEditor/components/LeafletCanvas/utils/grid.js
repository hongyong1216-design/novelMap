// 单格物理尺寸 (虚拟像素), 固定不变
// 改变 gridSize 时世界总尺寸线性扩展: worldSize = gridSize * PX_PER_CELL
export const PX_PER_CELL = 4096

export const DEFAULT_GRID_SIZE = 32
export const MIN_GRID_SIZE = 1
export const MAX_GRID_SIZE = 64

export const worldSizeOf = (gridSize) => gridSize * PX_PER_CELL

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

export const cellBoundsLatLng = (x, y) => [
  [y * PX_PER_CELL, x * PX_PER_CELL],
  [(y + 1) * PX_PER_CELL, (x + 1) * PX_PER_CELL],
]

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
