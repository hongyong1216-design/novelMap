import { Tilemap, ThirdPersonCamera, ManualElement } from 'react-super-tilemap'
import { spriteDefinition, TILE_WIDTH, TILE_HEIGHT, tileImages } from '../../../data/tileset-config'
import { useRef, useCallback, useEffect } from 'react'
import './TilemapCanvas.css'

// 生成地面瓦片
function generateTile(color) {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 64, 64)
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

export default function TilemapCanvas({ selectedTile, activeTool, mapData, onMapDataChange }) {
  const displayTileSize = 64
  const isDrawing = useRef(false)
  const lastTile = useRef(null)

  // 如果没有传入 mapData，使用初始数据
  const currentMapData = mapData || createInitialMapData()

  // 处理瓦片点击
  const handleTileClick = useCallback((tileInfo) => {
    console.log('Tile clicked:', tileInfo) // 调试输出

    if (!tileInfo) return

    // tileInfo 包含 tilePosition: { x, y, layer }
    const { tilePosition } = tileInfo
    if (!tilePosition) return

    const { x, y, layer } = tilePosition

    if (x < 0 || y < 0 || x >= currentMapData.cols || y >= currentMapData.rows) return

    // 根据工具类型执行操作
    if (activeTool === 'paint' && selectedTile) {
      // 判断是地面还是装饰
      const isGround = ['grass', 'water', 'sand', 'stone'].includes(selectedTile)
      const targetLayer = isGround ? 0 : 1

      setTileAt(x, y, targetLayer, selectedTile)
    } else if (activeTool === 'erase') {
      // 擦除装饰层（如果当前点击的是地面层，也擦除）
      const targetLayer = layer === 0 ? 0 : 1
      const clearValue = layer === 0 ? 'grass' : ''
      setTileAt(x, y, targetLayer, clearValue)
    } else if (activeTool === 'fill') {
      // 填充区域
      fillArea(x, y)
    }
  }, [activeTool, selectedTile, currentMapData])

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

  // 填充区域（简单实现：填充整个可见区域的地面层）
  const fillArea = useCallback((startX, startY) => {
    if (!onMapDataChange || !selectedTile) return

    const isGround = ['grass', 'water', 'sand', 'stone'].includes(selectedTile)
    const targetLayer = isGround ? 0 : 1

    // 填充 5x5 区域
    const newLayers = currentMapData.layers.map((l, li) => {
      if (li !== targetLayer) return l
      return l.map((row, ri) => {
        if (Math.abs(ri - startY) > 2) return row
        return row.map((cell, ci) => {
          if (Math.abs(ci - startX) > 2) return cell
          return selectedTile
        })
      })
    })

    onMapDataChange({
      ...currentMapData,
      layers: newLayers,
    })
  }, [currentMapData, selectedTile, onMapDataChange])

  // 拖拽绘制支持
  useEffect(() => {
    const handleMouseUp = () => {
      isDrawing.current = false
      lastTile.current = null
    }

    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const handleMouseDown = useCallback((tileInfo) => {
    isDrawing.current = true
    handleTileClick(tileInfo)
  }, [handleTileClick])

  const handleTileHover = useCallback((tileInfo) => {
    if (isDrawing.current && activeTool === 'paint') {
      const { tilePosition } = tileInfo
      if (tilePosition) {
        const key = `${tilePosition.x}_${tilePosition.y}_${tilePosition.layer}`
        if (key !== lastTile.current) {
          lastTile.current = key
          handleTileClick(tileInfo)
        }
      }
    }
  }, [activeTool, handleTileClick])

  return (
    <div className="tilemap-canvas">
      <Tilemap
        defaultTileSize={displayTileSize}
        tilmapScheme={currentMapData.layers.map(layer =>
          layer.map(row => row.map(tile => tile || undefined))
        )}
        spriteDefinition={allSprites}
        backgroundColor="#1a3a2a"
        onSpritesLoadError={(err) => console.error('Sprites load error:', err)}
        onTileClick={handleMouseDown}
        onTileHover={handleTileHover}
      >
        <ThirdPersonCamera />
      </Tilemap>
    </div>
  )
}

// 导出初始地图数据创建函数，供 MapEditor 使用
export { createInitialMapData, allSprites }
