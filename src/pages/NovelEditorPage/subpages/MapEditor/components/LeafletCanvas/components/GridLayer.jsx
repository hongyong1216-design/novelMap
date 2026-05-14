import { ImageOverlay } from 'react-leaflet'
import { Modal } from 'antd'
import { WORLD, cellId, placeholderSvg } from '../utils/grid'
import useMapZoom from '../hooks/useMapZoom'

// 每层在哪个 zoom 区间显示
const RANGES = [
  { min: -4, max: 1 },   // L0
  { min: 1,  max: 3 },   // L1
  { min: 3,  max: 5 },   // L2
]

function showCellInfo(id, cell) {
  Modal.info({
    title: cell?.name || id,
    content: (
      <div>
        <p>ID: {id}</p>
        <p>填充: {cell?.filled ? '是' : '否'}</p>
        {cell?.src && <p>图片: {cell.src}</p>}
      </div>
    ),
  })
}

export default function GridLayer({ level, cells, onCellClick }) {
  const zoom = useMapZoom()
  const range = RANGES[level]
  if (zoom < range.min || zoom > range.max) return null

  const { gridSize, pxPerCell: px } = WORLD.levels[level]

  const makeHandler = (id, cell) => () => {
    if (onCellClick) onCellClick(id, cell || { empty: true })
    else {
      console.log('[cell click]', id, cell || { empty: true })
      showCellInfo(id, cell)
    }
  }

  const overlays = []

  // 1. 渲染所有已在 cells 字典里的 cell (有图 / 填充但无图)
  Object.entries(cells).forEach(([id, cell]) => {
    if (!id.startsWith(`L${level}-`)) return
    const parts = id.split('-')
    const x = parseInt(parts[1], 10)
    const y = parseInt(parts[2], 10)
    const bounds = [[y * px, x * px], [(y + 1) * px, (x + 1) * px]]
    const url = cell.src || placeholderSvg(level, x, y, true, cell.name)
    overlays.push(
      <ImageOverlay
        key={id}
        url={url}
        bounds={bounds}
        interactive
        eventHandlers={{ click: makeHandler(id, cell) }}
        zIndex={400 + level * 10}
      />
    )
  })

  // 2. L0 层额外渲染所有"未探索"格子(其他层数据量太大不渲染)
  if (level === 0) {
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const id = cellId(level, x, y)
        if (cells[id]) continue
        const bounds = [[y * px, x * px], [(y + 1) * px, (x + 1) * px]]
        const url = placeholderSvg(level, x, y, false)
        overlays.push(
          <ImageOverlay
            key={id}
            url={url}
            bounds={bounds}
            interactive
            eventHandlers={{ click: makeHandler(id, null) }}
            zIndex={400 + level * 10 - 1}
          />
        )
      }
    }
  }

  return <>{overlays}</>
}
