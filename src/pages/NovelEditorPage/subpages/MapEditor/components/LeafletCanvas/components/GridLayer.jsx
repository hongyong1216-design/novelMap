import { ImageOverlay } from 'react-leaflet'
import { Modal } from 'antd'
import { cellId, parseCellId, cellBoundsLatLng, placeholderSvg } from '../utils/grid'

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

export default function GridLayer({ gridSize, cells, onCellClick, interactive = true }) {
  const makeHandler = (id, cell) => () => {
    if (onCellClick) onCellClick(id, cell || { empty: true })
    else showCellInfo(id, cell)
  }

  const overlays = []

  // 1. 已声明的格 (有图 / 填充但无图); 超出当前 gridSize 的格不渲染
  Object.entries(cells).forEach(([id, cell]) => {
    const pos = parseCellId(id)
    if (!pos) return
    if (pos.x >= gridSize || pos.y >= gridSize) return
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

  // 2. 未声明的"未探索"格
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
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
