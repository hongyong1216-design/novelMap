import { Tilemap, ThirdPersonCamera, ManualElement } from 'react-super-tilemap'
import { spriteDefinition, TILE_WIDTH, TILE_HEIGHT, tileImages } from '../../../data/tileset-config'
import { useRef, useCallback, useEffect, useState } from 'react'
import './TilemapCanvas.css'

// 生成地面瓦片（带网格线）
function generateTile(color) {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 64, 64)
  // 网格线
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, 63, 63)
  return canvas.toDataURL()
}

// 地面瓦片
const groundTiles = {
  grass: generateTile('#2d7a3a'),
  water: generateTile('#1a6b8a'),
  sand: generateTile('#c2a94e'),
  stone: generateTile('#6b6b7b'),
}

// 合并 spriteDefinition
const allSprites = [
  { key: 'grass', imagesSrc: [groundTiles.grass] },
  { key: 'water', imagesSrc: [groundTiles.water] },
  { key: 'sand', imagesSrc: [groundTiles.sand] },
  { key: 'stone', imagesSrc: [groundTiles.stone] },
  ...spriteDefinition
]

const GROUND_TILES = ['grass', 'water', 'sand', 'stone']
const MAX_FILL = 500

// 初始地图数据：30x20 网格
function createInitialMapData(cols = 30, rows = 20) {
  return {
    cols,
    rows,
    layers: [
      // 图层 0: 地面层（默认草地）
      Array.from({ length: rows }, () => Array(cols).fill('grass')),
      // 图层 1: 装饰层（树木等，初始空白）
      Array.from({ length: rows }, () => Array(cols).fill('')),
    ],
  }
}

export default function TilemapCanvas({ selectedTile, activeTool, mapData, onMapDataChange, tileZoom = 64, brushSize = 1, onEyedrop, onZoomIn, onZoomOut }) {
  const displayTileSize = tileZoom
  const isDrawing = useRef(false)
  const lastTile = useRef(null)
  const [hoverTile, setHoverTile] = useState(null)
  const [selectedTilePos, setSelectedTilePos] = useState(null)
  const [measureStart, setMeasureStart] = useState(null)
  const [measureEnd, setMeasureEnd] = useState(null)
  const canvasRef = useRef(null)

  // 如果没有传入 mapData，使用初始数据
  const currentMapData = mapData || createInitialMapData()

  // Ctrl+滚轮缩放
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (e.deltaY < 0 && onZoomIn) {
          onZoomIn()
        } else if (e.deltaY > 0 && onZoomOut) {
          onZoomOut()
        }
      }
    }
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false })
      return () => canvas.removeEventListener('wheel', handleWheel)
    }
  }, [onZoomIn, onZoomOut])

  // 获取光标样式
  const getCursorClass = () => {
    switch (activeTool) {
      case 'paint': return 'tilemap-cursor-crosshair'
      case 'erase': return 'tilemap-cursor-crosshair'
      case 'fill': return 'tilemap-cursor-crosshair'
      case 'eyedropper': return 'tilemap-cursor-eyedropper'
      case 'move': return 'tilemap-cursor-grab'
      case 'select': return 'tilemap-cursor-pointer'
      case 'measure': return 'tilemap-cursor-crosshair'
      default: return ''
    }
  }

  // 批量设置瓦片（支持 brushSize）
  const setTilesAt = useCallback((cx, cy, layer, tileKey, size) => {
    if (!onMapDataChange) return

    const newLayers = currentMapData.layers.map((l, li) => {
      if (li !== layer) return l
      return l.map((row, ri) => {
        return row.map((cell, ci) => {
          // 计算 brush 范围：以点击位置为左上角偏移
          const dx = ci - cx
          const dy = ri - cy
          if (dx >= 0 && dx < size && dy >= 0 && dy < size) {
            if (ci >= 0 && ci < currentMapData.cols && ri >= 0 && ri < currentMapData.rows) {
              return tileKey
            }
          }
          return cell
        })
      })
    })

    onMapDataChange({
      ...currentMapData,
      layers: newLayers,
    })
  }, [currentMapData, onMapDataChange])

  // 设置单个瓦片
  const setTileAt = useCallback((x, y, layer, tileKey) => {
    if (!onMapDataChange) return

    const newLayers = currentMapData.layers.map((l, li) => {
      if (li !== layer) return l
      return l.map((row, ri) => {
        if (ri !== y) return row
        return row.map((cell, ci) => {
          if (ci !== x) return cell
          return tileKey
        })
      })
    })

    onMapDataChange({
      ...currentMapData,
      layers: newLayers,
    })
  }, [currentMapData, onMapDataChange])

  // BFS flood fill
  const floodFill = useCallback((startX, startY) => {
    if (!onMapDataChange || !selectedTile) return

    const isGround = GROUND_TILES.includes(selectedTile)
    const targetLayer = isGround ? 0 : 1
    const layer = currentMapData.layers[targetLayer]
    const targetType = layer[startY][startX]

    // 如果起点和选中瓦片相同，无需填充
    if (targetType === selectedTile) return

    const visited = new Set()
    const queue = [[startX, startY]]
    const toFill = []
    const cols = currentMapData.cols
    const rows = currentMapData.rows

    while (queue.length > 0 && toFill.length < MAX_FILL) {
      const [x, y] = queue.shift()
      const key = `${x},${y}`
      if (visited.has(key)) continue
      if (x < 0 || y < 0 || x >= cols || y >= rows) continue
      if (layer[y][x] !== targetType) continue

      visited.add(key)
      toFill.push([x, y])

      queue.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1])
    }

    if (toFill.length === 0) return

    const fillSet = new Set(toFill.map(([x, y]) => `${x},${y}`))
    const newLayers = currentMapData.layers.map((l, li) => {
      if (li !== targetLayer) return l
      return l.map((row, ri) => {
        return row.map((cell, ci) => {
          if (fillSet.has(`${ci},${ri}`)) return selectedTile
          return cell
        })
      })
    })

    onMapDataChange({
      ...currentMapData,
      layers: newLayers,
    })
  }, [currentMapData, selectedTile, onMapDataChange])

  // 智能橡皮擦：优先清除装饰层
  const smartErase = useCallback((cx, cy, size) => {
    if (!onMapDataChange) return

    const newLayers = currentMapData.layers.map(l => l.map(row => [...row]))

    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const x = cx + dx
        const y = cy + dy
        if (x < 0 || y < 0 || x >= currentMapData.cols || y >= currentMapData.rows) continue

        // 优先清除装饰层
        if (newLayers[1][y][x] && newLayers[1][y][x] !== '') {
          newLayers[1][y][x] = ''
        } else {
          // 装饰层为空则重置地面为草地
          newLayers[0][y][x] = 'grass'
        }
      }
    }

    onMapDataChange({
      ...currentMapData,
      layers: newLayers,
    })
  }, [currentMapData, onMapDataChange])

  // 吸色器：拾取瓦片
  const eyedrop = useCallback((x, y) => {
    if (!onEyedrop) return
    // 优先拾取装饰层
    const decor = currentMapData.layers[1]?.[y]?.[x]
    if (decor && decor !== '') {
      // 装饰层存储的就是 tile_X_Y 格式
      onEyedrop(decor.startsWith('tile_') ? decor : `tile_${decor}`)
    } else {
      const ground = currentMapData.layers[0]?.[y]?.[x]
      if (ground) onEyedrop(ground)
    }
  }, [currentMapData, onEyedrop])

  // 处理瓦片点击 — onTileClick 回调接收 Position { x, y }
  const handleTileClick = useCallback((pos) => {
    if (!pos) return
    const { x, y } = pos
    if (x < 0 || y < 0 || x >= currentMapData.cols || y >= currentMapData.rows) return

    // 选择工具
    if (activeTool === 'select') {
      setSelectedTilePos({ x, y })
      return
    }

    // 测量工具
    if (activeTool === 'measure') {
      if (!measureStart || measureEnd) {
        setMeasureStart({ x, y })
        setMeasureEnd(null)
      } else {
        setMeasureEnd({ x, y })
      }
      return
    }

    // 移动工具
    if (activeTool === 'move') return

    // 吸色器
    if (activeTool === 'eyedropper') {
      eyedrop(x, y)
      return
    }

    // 根据工具类型执行操作
    if (activeTool === 'paint' && selectedTile) {
      const isGround = GROUND_TILES.includes(selectedTile)
      const targetLayer = isGround ? 0 : 1
      if (brushSize > 1) {
        setTilesAt(x, y, targetLayer, selectedTile, brushSize)
      } else {
        setTileAt(x, y, targetLayer, selectedTile)
      }
    } else if (activeTool === 'erase') {
      smartErase(x, y, brushSize)
    } else if (activeTool === 'fill') {
      floodFill(x, y)
    }
  }, [activeTool, selectedTile, currentMapData, measureStart, measureEnd, brushSize, setTileAt, setTilesAt, smartErase, floodFill, eyedrop])

  // 拖拽绘制支持
  useEffect(() => {
    const handleMouseUp = () => {
      isDrawing.current = false
      lastTile.current = null
    }

    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const handleMouseDown = useCallback((pos) => {
    isDrawing.current = true
    handleTileClick(pos)
  }, [handleTileClick])

  const handleTileHover = useCallback((pos) => {
    if (!pos) return
    const { x, y } = pos
    setHoverTile({ x, y })

    if (isDrawing.current && (activeTool === 'paint' || activeTool === 'erase')) {
      const key = `${x}_${y}`
      if (key !== lastTile.current) {
        lastTile.current = key
        handleTileClick(pos)
      }
    }
  }, [activeTool, handleTileClick])

  // 计算测量距离
  const measureDistance = measureStart && measureEnd
    ? Math.sqrt(Math.pow(measureEnd.x - measureStart.x, 2) + Math.pow(measureEnd.y - measureStart.y, 2)).toFixed(1)
    : null

  // 获取选中瓦片信息
  const getSelectedTileInfo = () => {
    if (!selectedTilePos) return null
    const { x, y } = selectedTilePos
    if (x < 0 || y < 0 || x >= currentMapData.cols || y >= currentMapData.rows) return null
    const ground = currentMapData.layers[0]?.[y]?.[x] || '空'
    const decor = currentMapData.layers[1]?.[y]?.[x] || '无'
    return { x, y, ground, decor }
  }

  const selectedInfo = getSelectedTileInfo()

  // 将 [layer][row][col] 转换为库期望的 [row][col][layer] 格式
  const tilmapScheme = Array.from({ length: currentMapData.rows }, (_, rowIdx) =>
    Array.from({ length: currentMapData.cols }, (_, colIdx) =>
      currentMapData.layers.map(layer => layer[rowIdx][colIdx] || undefined)
    )
  )

  return (
    <div ref={canvasRef} className={`tilemap-canvas ${getCursorClass()}`}>
      <Tilemap
        defaultTileSize={displayTileSize}
        tilmapScheme={tilmapScheme}
        spriteDefinition={allSprites}
        backgroundColor="#1a3a2a"
        onSpritesLoadError={(err) => console.error('Sprites load error:', err)}
        onTileClick={handleMouseDown}
        onTilemapClick={handleMouseDown}
        onTileHover={handleTileHover}
      >
        <ThirdPersonCamera
          initialCameraPosition={{
            x: Math.floor(currentMapData.cols / 2),
            y: Math.floor(currentMapData.rows / 2)
          }}
        />
      </Tilemap>

      {/* 底部状态栏 */}
      <div className="tilemap-statusbar">
        <span className="tilemap-status-item">
          {hoverTile ? `坐标: (${hoverTile.x}, ${hoverTile.y})` : '坐标: --'}
        </span>
        <span className="tilemap-status-item">
          尺寸: {currentMapData.cols} x {currentMapData.rows}
        </span>
        <span className="tilemap-status-item">
          缩放: {Math.round(displayTileSize / 64 * 100)}%
        </span>
        {brushSize > 1 && (activeTool === 'paint' || activeTool === 'erase') && (
          <span className="tilemap-status-item">
            笔刷: {brushSize}x{brushSize}
          </span>
        )}
        {activeTool === 'select' && selectedInfo && (
          <span className="tilemap-status-item">
            已选: ({selectedInfo.x},{selectedInfo.y}) 地面={selectedInfo.ground} 装饰={selectedInfo.decor}
          </span>
        )}
        {activeTool === 'measure' && measureStart && (
          <span className="tilemap-status-item">
            起点: ({measureStart.x},{measureStart.y})
            {measureEnd && ` → 终点: (${measureEnd.x},${measureEnd.y}) 距离: ${measureDistance} 格`}
            {!measureEnd && ' (点击设置终点)'}
          </span>
        )}
      </div>
    </div>
  )
}

// 导出初始地图数据创建函数，供 MapEditor 使用
export { createInitialMapData, allSprites }
