import { useState } from 'react'
import { ImageOverlay, useMap, useMapEvents } from 'react-leaflet'
import {
  cellId,
  parseCellId,
  cellImageBoundsLatLng,
  cellExclusiveBoundsLatLng,
  placeholderSvg,
  CELL_STEP,
} from '../utils/grid'

// 视口外多渲染一圈格子, 平移时边缘不闪空白
// (重叠布局下格子会探出独占区 15%, BUFFER=1 已足够覆盖)
const BUFFER = 1

// 当前视口覆盖的格索引范围 (含 buffer, 已 clamp 到 [0, gridSize-1])
// CRS 下 lat=世界 y, lng=世界 x; 减 epsilon 避免把恰好压在边界上的下一格算进来
function visibleRange(map, gridSize) {
  const b = map.getBounds()
  const eps = 1e-6
  return {
    minX: Math.max(0, Math.floor(b.getWest() / CELL_STEP) - BUFFER),
    maxX: Math.min(gridSize - 1, Math.floor((b.getEast() - eps) / CELL_STEP) + BUFFER),
    minY: Math.max(0, Math.floor(b.getSouth() / CELL_STEP) - BUFFER),
    maxY: Math.min(gridSize - 1, Math.floor((b.getNorth() - eps) / CELL_STEP) + BUFFER),
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
  }

  const overlays = []

  // 1. 已声明的格。有图的格渲染范围带 15% 重叠; 无图占位格用独占区 + 更低 zIndex
  //    (占位没有"重叠融合"需求, 若也探出 15%, 其深紫底会压住左/上邻居图片的重叠带,
  //    再被右/下有图格的羽化透明区透出来, 呈现深色缺角)。
  //    按 (y, x) 升序渲染: 同 zIndex 下 DOM 后者在上 → 右/下格覆盖左/上格的重叠带,
  //    覆盖顺序固定 (同 FrameRonin 的画布绘制顺序), 重叠区内容一致时接缝不可见。
  //    覆盖侧 (左/上边) 若存在已有图片的邻居, 施加边缘羽化 (CSS mask, 见 LeafletCanvas.css):
  //    重叠区内容有差异时呈渐变融合而非硬截断线; 邻居无图的边不羽化, 避免边缘发虚
  Object.entries(cells)
    .map(([id, cell]) => ({ id, cell, pos: parseCellId(id) }))
    .filter(({ pos }) => pos && pos.x < gridSize && pos.y < gridSize && inView(pos.x, pos.y))
    .sort((a, b) => a.pos.y - b.pos.y || a.pos.x - b.pos.x)
    .forEach(({ id, cell, pos }) => {
      const hasImg = Boolean(cell.src)
      const url = cell.src || placeholderSvg(pos.x, pos.y, true, cell.name)
      const featherL = Boolean(hasImg && cells[cellId(pos.x - 1, pos.y)]?.src)
      const featherT = Boolean(hasImg && cells[cellId(pos.x, pos.y - 1)]?.src)
      const featherClass =
        featherL && featherT ? 'cell-feather-lt' : featherL ? 'cell-feather-l' : featherT ? 'cell-feather-t' : ''
      overlays.push(
        <ImageOverlay
          // className 是 react-leaflet 的不可变 prop, 羽化状态编进 key 以触发重建
          key={`${id}${featherClass ? `|${featherClass}` : ''}`}
          url={url}
          bounds={
            hasImg
              ? cellImageBoundsLatLng(pos.x, pos.y)
              : cellExclusiveBoundsLatLng(pos.x, pos.y, gridSize)
          }
          className={featherClass}
          interactive={interactive}
          eventHandlers={interactive ? { click: makeHandler(id, cell) } : {}}
          zIndex={hasImg ? 400 : 399}
        />
      )
    })

  // 2. 视口内、未声明的"未探索"格: 用独占区渲染 (不重叠), 虚线边框保持整齐
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const id = cellId(x, y)
      if (cells[id]) continue
      overlays.push(
        <ImageOverlay
          key={id}
          url={placeholderSvg(x, y, false)}
          bounds={cellExclusiveBoundsLatLng(x, y, gridSize)}
          interactive={interactive}
          eventHandlers={interactive ? { click: makeHandler(id, null) } : {}}
          zIndex={399}
        />
      )
    }
  }

  return <>{overlays}</>
}
