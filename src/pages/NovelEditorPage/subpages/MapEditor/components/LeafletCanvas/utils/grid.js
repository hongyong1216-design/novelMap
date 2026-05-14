export const WORLD = {
  size: 32768,
  levels: [
    { id: 0, gridSize: 8,   pxPerCell: 4096 },
    { id: 1, gridSize: 32,  pxPerCell: 1024 },
    { id: 2, gridSize: 128, pxPerCell: 256  },
  ],
}

export const cellId = (level, x, y) => `L${level}-${x}-${y}`

export const cellBoundsLatLng = (level, x, y) => {
  const px = WORLD.levels[level].pxPerCell
  return [[y * px, x * px], [(y + 1) * px, (x + 1) * px]]
}

export const placeholderSvg = (level, x, y, filled, name) => {
  const bg     = filled ? '#1b1b3a' : '#0c0c1d'
  const stroke = filled ? '#5d4cb8' : '#2a2a4a'
  const color  = filled ? '#a29bfe' : '#3a3a5a'
  const dash   = filled ? '0' : '4 4'
  const id     = `L${level}-${x}-${y}`
  const label  = filled ? (name || id) : '未探索'
  const sub    = filled ? id : ''

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'>
    <rect width='256' height='256' fill='${bg}' stroke='${stroke}' stroke-width='1' stroke-dasharray='${dash}'/>
    <text x='128' y='124' text-anchor='middle' fill='${color}' font-size='16' font-family='monospace' font-weight='bold'>${label}</text>
    ${sub ? `<text x='128' y='148' text-anchor='middle' fill='${color}' font-size='11' font-family='monospace' opacity='0.6'>${sub}</text>` : ''}
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const worldCoordToCell = (level, worldX, worldY) => {
  const px = WORLD.levels[level].pxPerCell
  return { x: Math.floor(worldX / px), y: Math.floor(worldY / px) }
}
