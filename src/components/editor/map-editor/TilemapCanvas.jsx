import { Tilemap, ThirdPersonCamera, ManualElement, tilemapEventChannel, useThirdPersonCameraContext } from 'react-super-tilemap'
import { spriteDefinition, TILE_WIDTH, TILE_HEIGHT, tileImages } from '../../../data/tileset-config'
import { mountainImages } from '../../../data/mountains-config'
import { useRef, useCallback, useEffect, useState } from 'react'
import './TilemapCanvas.css'

const MOUNTAIN_SPAN = 2 // 山峰占据 2x2 格

// 相机位置追踪器：渲染在 ThirdPersonCamera 内部以获取相机上下文
// 同时把位置推给父组件 state，使山峰覆盖层能跟随相机移动重绘
function CameraTracker({ cameraRef, onCameraChange }) {
  const { cameraPosition } = useThirdPersonCameraContext()
  useEffect(() => {
    cameraRef.current = cameraPosition
    if (onCameraChange) onCameraChange(cameraPosition)
  }, [cameraPosition, cameraRef, onCameraChange])
  return null
}

// 计算画布坐标系原点与相机偏移：使用内层 canvas 元素的实际尺寸（排除状态栏）
function getCanvasOffset(canvasRef, cameraPos, tileSize) {
  if (!canvasRef.current || !cameraPos) return null
  const dRect = canvasRef.current.getBoundingClientRect()
  const canvasEl = canvasRef.current.querySelector('canvas')
  const cRect = canvasEl ? canvasEl.getBoundingClientRect() : dRect
  const offX = cRect.left - dRect.left
  const offY = cRect.top - dRect.top
  return {
    absX: offX + cRect.width / 2 - cameraPos.x * tileSize - tileSize / 2,
    absY: offY + cRect.height / 2 - cameraPos.y * tileSize - tileSize / 2,
  }
}

// 山峰覆盖层：以 HTML img 形式覆盖渲染 2x2 精灵
function MountainOverlay({ mountains, tileSize, cameraPos, canvasRef }) {
  const off = getCanvasOffset(canvasRef, cameraPos, tileSize)
  if (!off) return null
  const { absX, absY } = off
  return (
    <div className="mountain-overlay">
      {mountains.map((m, i) => {
        const key = m.type.replace('mountain_', '')
        const src = mountainImages[key]
        if (!src) return null
        return (
          <img
            key={`${m.x}_${m.y}_${i}`}
            src={src}
            alt={m.type}
            draggable={false}
            style={{
              position: 'absolute',
              left: absX + m.x * tileSize,
              top: absY + m.y * tileSize,
              width: MOUNTAIN_SPAN * tileSize,
              height: MOUNTAIN_SPAN * tileSize,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        )
      })}
    </div>
  )
}

const GROUND_COLOR_MAP = {
  grass: '#2d7a3a',
  water: '#1a6b8a',
  sand: '#c2a94e',
  stone: '#6b6b7b',
}

// 选中瓦片的悬停虚影：跟随鼠标显示半透明预览
function HoverPreview({ selectedTile, hoverTile, brushSize, tileSize, cameraPos, canvasRef, mapCols, mapRows }) {
  if (!selectedTile || !hoverTile) return null
  if (hoverTile.x < 0 || hoverTile.y < 0 || hoverTile.x >= mapCols || hoverTile.y >= mapRows) return null

  const off = getCanvasOffset(canvasRef, cameraPos, tileSize)
  if (!off) return null
  const { absX, absY } = off

  const isMountain = selectedTile.startsWith('mountain_')
  const isTile = selectedTile.startsWith('tile_')
  const isGround = GROUND_COLOR_MAP[selectedTile] !== undefined

  // 山峰固定 2x2 预览；地面/装饰按 brushSize
  const span = isMountain ? MOUNTAIN_SPAN : Math.max(1, brushSize || 1)

  // 越界预览：部分超出地图时仍显示，便于理解
  const left = absX + hoverTile.x * tileSize
  const top = absY + hoverTile.y * tileSize

  let content = null
  if (isMountain) {
    const src = mountainImages[selectedTile.replace('mountain_', '')]
    if (src) content = <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%' }} />
  } else if (isTile) {
    const src = tileImages[selectedTile.replace('tile_', '')]
    if (src) {
      // 笔刷 >1 时平铺同一张图到每一格
      content = (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${span}, 1fr)`, gridTemplateRows: `repeat(${span}, 1fr)`, width: '100%', height: '100%' }}>
          {Array.from({ length: span * span }).map((_, i) => (
            <img key={i} src={src} alt="" draggable={false} style={{ width: '100%', height: '100%' }} />
          ))}
        </div>
      )
    }
  } else if (isGround) {
    content = <div style={{ width: '100%', height: '100%', background: GROUND_COLOR_MAP[selectedTile] }} />
  }

  if (!content) return null

  return (
    <div
      className="tile-hover-preview"
      style={{
        position: 'absolute',
        left,
        top,
        width: span * tileSize,
        height: span * tileSize,
        pointerEvents: 'none',
        opacity: 0.55,
        outline: '2px dashed rgba(255,255,255,0.75)',
        outlineOffset: '-2px',
        zIndex: 3,
      }}
    >
      {content}
    </div>
  )
}

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
    // 多格精灵层：山峰等占 2x2 的素材，存左上角原点 + 类型
    mountains: [],
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
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [cameraPos, setCameraPos] = useState(null)
  const canvasRef = useRef(null)
  const cameraRef = useRef(null)

  // 如果没有传入 mapData，使用初始数据
  const currentMapData = mapData || createInitialMapData()
  const mountains = currentMapData.mountains || []

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

  // 空格键拖拽模式
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        setSpaceHeld(true)
      }
    }
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setSpaceHeld(false)
        setIsDragging(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // 获取光标样式
  const getCursorClass = () => {
    if ((spaceHeld || activeTool === 'move') && isDragging) return 'tilemap-cursor-grabbing'
    if (spaceHeld || activeTool === 'move') return 'tilemap-cursor-grab'
    // 画笔 + 有选中瓦片 + 鼠标在地图内 → 隐藏系统鼠标，由虚影代替
    const inBounds = hoverTile && hoverTile.x >= 0 && hoverTile.y >= 0 &&
      hoverTile.x < currentMapData.cols && hoverTile.y < currentMapData.rows
    if (activeTool === 'paint' && selectedTile && inBounds) return 'tilemap-cursor-hidden'
    switch (activeTool) {
      case 'paint': return 'tilemap-cursor-crosshair'
      case 'erase': return 'tilemap-cursor-crosshair'
      case 'fill': return 'tilemap-cursor-crosshair'
      case 'eyedropper': return 'tilemap-cursor-eyedropper'
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

  // 查找覆盖 (x,y) 的最上层山峰索引（数组后部渲染在上），-1 表示无
  const findMountainAt = useCallback((x, y) => {
    for (let i = mountains.length - 1; i >= 0; i--) {
      const m = mountains[i]
      if (x >= m.x && x < m.x + MOUNTAIN_SPAN && y >= m.y && y < m.y + MOUNTAIN_SPAN) {
        return i
      }
    }
    return -1
  }, [mountains])

  // 放置山峰：(x,y) 作为左上角原点，需保证 2x2 区域在界内
  // 允许与其它山峰部分重叠，但禁止完全重叠（同原点的 2x2）
  const placeMountain = useCallback((x, y, type) => {
    if (!onMapDataChange) return
    if (x < 0 || y < 0 || x + MOUNTAIN_SPAN > currentMapData.cols || y + MOUNTAIN_SPAN > currentMapData.rows) return
    for (const m of mountains) {
      if (m.x === x && m.y === y) return // 同原点且同尺寸 → 完全重叠，拒绝
    }
    onMapDataChange({
      ...currentMapData,
      mountains: [...mountains, { x, y, type }],
    })
  }, [currentMapData, mountains, onMapDataChange])

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

  // 智能橡皮擦：优先清除山峰，再清除装饰层，最后重置地面
  const smartErase = useCallback((cx, cy, size) => {
    if (!onMapDataChange) return

    // 先处理山峰：只要 brush 范围内任一格被山峰覆盖就整体移除
    const hitMountainIds = new Set()
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const x = cx + dx, y = cy + dy
        const idx = findMountainAt(x, y)
        if (idx !== -1) hitMountainIds.add(idx)
      }
    }

    if (hitMountainIds.size > 0) {
      onMapDataChange({
        ...currentMapData,
        mountains: mountains.filter((_, i) => !hitMountainIds.has(i)),
      })
      return
    }

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
  }, [currentMapData, mountains, findMountainAt, onMapDataChange])

  // 吸色器：拾取瓦片
  const eyedrop = useCallback((x, y) => {
    if (!onEyedrop) return
    // 优先拾取山峰
    const mIdx = findMountainAt(x, y)
    if (mIdx !== -1) {
      onEyedrop(mountains[mIdx].type)
      return
    }
    // 装饰层
    const decor = currentMapData.layers[1]?.[y]?.[x]
    if (decor && decor !== '') {
      onEyedrop(decor.startsWith('tile_') ? decor : `tile_${decor}`)
    } else {
      const ground = currentMapData.layers[0]?.[y]?.[x]
      if (ground) onEyedrop(ground)
    }
  }, [currentMapData, mountains, findMountainAt, onEyedrop])

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
      if (selectedTile.startsWith('mountain_')) {
        placeMountain(x, y, selectedTile)
      } else {
        const isGround = GROUND_TILES.includes(selectedTile)
        const targetLayer = isGround ? 0 : 1
        if (brushSize > 1) {
          setTilesAt(x, y, targetLayer, selectedTile, brushSize)
        } else {
          setTileAt(x, y, targetLayer, selectedTile)
        }
      }
    } else if (activeTool === 'erase') {
      smartErase(x, y, brushSize)
    } else if (activeTool === 'fill') {
      floodFill(x, y)
    }
  }, [activeTool, selectedTile, currentMapData, measureStart, measureEnd, brushSize, setTileAt, setTilesAt, smartErase, floodFill, eyedrop, placeMountain])

  // 用 ref 保持回调最新引用，避免 EventBus 订阅中的闭包过期问题
  const handleTileClickRef = useRef(handleTileClick)
  useEffect(() => { handleTileClickRef.current = handleTileClick }, [handleTileClick])
  const activeToolRef = useRef(activeTool)
  useEffect(() => { activeToolRef.current = activeTool }, [activeTool])
  const spaceHeldRef = useRef(spaceHeld)
  useEffect(() => { spaceHeldRef.current = spaceHeld }, [spaceHeld])
  const brushSizeRef = useRef(brushSize)
  useEffect(() => { brushSizeRef.current = brushSize }, [brushSize])

  // 像素坐标转瓦片坐标（使用库内部相同的转换公式）
  const pixelToTile = useCallback((pixelPos) => {
    const cam = cameraRef.current
    if (!cam) return null
    const off = getCanvasOffset(canvasRef, cam, displayTileSize)
    if (!off) return null
    const col = Math.floor((pixelPos.x - off.absX) / displayTileSize)
    const row = Math.floor((pixelPos.y - off.absY) / displayTileSize)
    return { x: col, y: row }
  }, [displayTileSize])

  // 原生鼠标事件：追踪拖拽状态（用于光标切换）
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const handleDown = () => {
      if (spaceHeldRef.current || activeToolRef.current === 'move') {
        setIsDragging(true)
      }
    }
    const handleUp = () => setIsDragging(false)
    const handleLeave = () => setHoverTile(null)
    el.addEventListener('mousedown', handleDown)
    el.addEventListener('mouseleave', handleLeave)
    window.addEventListener('mouseup', handleUp)
    return () => {
      el.removeEventListener('mousedown', handleDown)
      el.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [])

  // 通过 EventBus 订阅鼠标事件，实现拖拽连续绘制和悬停坐标
  useEffect(() => {
    const cols = currentMapData.cols
    const rows = currentMapData.rows
    const inBounds = (pos) => pos && pos.x >= 0 && pos.y >= 0 && pos.x < cols && pos.y < rows

    const unsubDown = tilemapEventChannel.on('onMouseDown', (pixelPos) => {
      if (spaceHeldRef.current || activeToolRef.current === 'move') return
      isDrawing.current = true
      const tilePos = pixelToTile(pixelPos)
      if (inBounds(tilePos)) {
        lastTile.current = `${tilePos.x}_${tilePos.y}`
        handleTileClickRef.current(tilePos)
      }
    })

    const unsubMove = tilemapEventChannel.on('onMouseMove', (pixelPos) => {
      const tilePos = pixelToTile(pixelPos)
      if (tilePos) setHoverTile({ x: tilePos.x, y: tilePos.y })

      if (!spaceHeldRef.current && isDrawing.current &&
          (activeToolRef.current === 'paint' || activeToolRef.current === 'erase')) {
        if (inBounds(tilePos)) {
          const key = `${tilePos.x}_${tilePos.y}`
          if (key !== lastTile.current) {
            lastTile.current = key
            handleTileClickRef.current(tilePos)
          }
        }
      }
    })

    const unsubUp = tilemapEventChannel.on('onMouseUp', () => {
      isDrawing.current = false
      lastTile.current = null
    })

    return () => { unsubDown(); unsubMove(); unsubUp() }
  }, [pixelToTile, currentMapData.cols, currentMapData.rows])

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
      >
        <ThirdPersonCamera
          draggable={spaceHeld || activeTool === 'move'}
          initialCameraPosition={{
            x: Math.floor(currentMapData.cols / 2),
            y: Math.floor(currentMapData.rows / 2)
          }}
        >
          <CameraTracker cameraRef={cameraRef} onCameraChange={setCameraPos} />
        </ThirdPersonCamera>
      </Tilemap>

      <MountainOverlay
        mountains={mountains}
        tileSize={displayTileSize}
        cameraPos={cameraPos}
        canvasRef={canvasRef}
      />

      {activeTool === 'paint' && !spaceHeld && (
        <HoverPreview
          selectedTile={selectedTile}
          hoverTile={hoverTile}
          brushSize={brushSize}
          tileSize={displayTileSize}
          cameraPos={cameraPos}
          canvasRef={canvasRef}
          mapCols={currentMapData.cols}
          mapRows={currentMapData.rows}
        />
      )}

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
