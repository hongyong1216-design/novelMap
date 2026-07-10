import { useState } from 'react'
import { ImageOverlay, useMap, useMapEvents } from 'react-leaflet'
import { Modal } from 'antd'
import { cellId, parseCellId, cellBoundsLatLng, placeholderSvg, PX_PER_CELL } from '../utils/grid'

// 视口外多渲染一圈格子, 平移时边缘不闪空白
const BUFFER = 1

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

// 当前视口覆盖的格索引范围 (含 buffer, 已 clamp 到 [0, gridSize-1])
// CRS 下 lat=世界 y, lng=世界 x; 减 epsilon 避免把恰好压在边界上的下一格算进来
function visibleRange(map, gridSize) {
  const b = map.getBounds()
  const eps = 1e-6
  return {
    minX: Math.max(0, Math.floor(b.getWest() / PX_PER_CELL) - BUFFER),
    maxX: Math.min(gridSize - 1, Math.floor((b.getEast() - eps) / PX_PER_CELL) + BUFFER),
    minY: Math.max(0, Math.floor(b.getSouth() / PX_PER_CELL) - BUFFER),
    maxY: Math.min(gridSize - 1, Math.floor((b.getNorth() - eps) / PX_PER_CELL) + BUFFER),
  }
}

export default function GridLayer({ gridSize, cells, onCellClick, interactive = true }) {
  const map = useMap()
  // 平移/缩放后强制重算可见范围; 只渲染视口内的格, 网格规模再大也不掉帧
  const [, tick] = useState(0)
  useMapEvents({
    moveend: () => tick((v) => v + 1),
    zoomend: () => tick((v) => v + 1),
  })

  const { minX, maxX, minY, maxY } = visibleRange(map, gridSize)
  const inView = (x, y) => x >= minX && x <= maxX && y >= minY && y <= maxY

  const makeHandler = (id, cell) => () => {
    if (onCellClick) onCellClick(id, cell || { empty: true })
    else showCellInfo(id, cell)
  }

  const overlays = []

  // 1. 已声明的格 (有图 / 填充但无图); 超出 gridSize 或视口外的格不渲染
  Object.entries(cells).forEach(([id, cell]) => {
    const pos = parseCellId(id)
    if (!pos) return
    if (pos.x >= gridSize || pos.y >= gridSize) return
    if (!inView(pos.x, pos.y)) return
    const url = cell.src || placeholderSvg(pos.x, pos.y, true, cell.name)
    overlays.push(
      <ImageOverlay
        key={id}
        url={url}
        bounds={cellBoundsLatLng(pos.x, pos.y)}
        interactive={interactive}
        eventHandlers={interactive ? { click: makeHandler(id, cell) } : {}}
        zIndex={400}
      />
    )
  })

  // 2. 视口内、未声明的"未探索"格
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const id = cellId(x, y)
      if (cells[id]) continue
      overlays.push(
        <ImageOverlay
          key={id}
          url={placeholderSvg(x, y, false)}
          bounds={cellBoundsLatLng(x, y)}
          interactive={interactive}
          eventHandlers={interactive ? { click: makeHandler(id, null) } : {}}
          zIndex={399}
        />
      )
    }
  }

  return <>{overlays}</>
}
