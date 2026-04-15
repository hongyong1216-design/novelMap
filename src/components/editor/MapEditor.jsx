import { useState, useRef, useCallback, useEffect } from 'react'
import './MapEditor.css'
import Toolbar from './map-editor/Toolbar'
import LeftPanel from './map-editor/LeftPanel'
import MapCanvas from './map-editor/MapCanvas'
import RightPanel from './map-editor/RightPanel'
import TilemapCanvas, { createInitialMapData } from './map-editor/TilemapCanvas'
import TilemapLeftPanel from './map-editor/TilemapLeftPanel'
import { defaultRegions, terrainBrushes, colorBrushes } from './map-editor/data'

const STORAGE_KEY = 'novelmap_tilemap_data'
const MAX_HISTORY = 50

// 从 localStorage 加载地图数据
function loadTilemapData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      // 验证数据完整性
      if (data && data.cols > 0 && data.rows > 0 &&
          Array.isArray(data.layers) && data.layers.length >= 2 &&
          data.layers[0].length === data.rows &&
          data.layers[0][0].length === data.cols) {
        return data
      }
    }
  } catch (e) { /* ignore */ }
  return createInitialMapData()
}

export default function MapEditor() {
  const [activeTool, setActiveTool] = useState('select')
  const [selectedRegion, setSelectedRegion] = useState('veridian')
  const [regions, setRegions] = useState(defaultRegions)
  const [activeBrush, setActiveBrush] = useState(null)
  const [brushSize, setBrushSize] = useState(40)
  const [brushMode, setBrushMode] = useState('smooth')
  const [brushStrokes, setBrushStrokes] = useState([])
  const [editorMode, setEditorMode] = useState('konva') // 'konva' | 'tilemap'
  const [tilemapTool, setTilemapTool] = useState('paint')
  const [selectedTile, setSelectedTile] = useState('grass')
  const [tileBrushSize, setTileBrushSize] = useState(1)
  const [tilemapData, setTilemapData] = useState(loadTilemapData)
  const [saveStatus, setSaveStatus] = useState('')
  const [tileZoom, setTileZoom] = useState(64) // 瓦片显示尺寸
  const canvasRef = useRef(null)

  // 撤销/重做历史栈
  const undoStack = useRef([])
  const redoStack = useRef([])

  // 记录地图变更（带历史）
  const handleTilemapChange = useCallback((newData) => {
    undoStack.current.push(tilemapData)
    if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift()
    redoStack.current = []
    setTilemapData(newData)
  }, [tilemapData])

  // 撤销
  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return
    const prev = undoStack.current.pop()
    redoStack.current.push(tilemapData)
    setTilemapData(prev)
  }, [tilemapData])

  // 重做
  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return
    const next = redoStack.current.pop()
    undoStack.current.push(tilemapData)
    setTilemapData(next)
  }, [tilemapData])

  // 保存到 localStorage
  const handleSave = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tilemapData))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(''), 2000)
    } catch (e) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(''), 2000)
    }
  }, [tilemapData])

  // 缩放
  const handleZoomIn = useCallback(() => {
    setTileZoom(prev => Math.min(prev + 16, 192))
  }, [])

  const handleZoomOut = useCallback(() => {
    setTileZoom(prev => Math.max(prev - 16, 16))
  }, [])

  // 吸色器回调：从画布拾取瓦片后更新 selectedTile 并切回画笔
  const handleEyedrop = useCallback((tileKey) => {
    setSelectedTile(tileKey)
    setTilemapTool('paint')
  }, [])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editorMode !== 'tilemap') return
      const isMod = e.ctrlKey || e.metaKey

      if (isMod && e.key === 's') {
        e.preventDefault()
        handleSave()
      } else if (isMod && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        handleRedo()
      } else if (isMod && e.key === 'z') {
        e.preventDefault()
        handleUndo()
      } else if (isMod && e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      } else if (isMod && e.key === '-') {
        e.preventDefault()
        handleZoomOut()
      } else if (!isMod && !e.shiftKey) {
        // 工具快捷键（无修饰键时生效，避免在输入框中触发）
        const tag = e.target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        switch (e.key.toLowerCase()) {
          case 'b': setTilemapTool('paint'); break
          case 'e': setTilemapTool('erase'); break
          case 'g': setTilemapTool('fill'); break
          case 'i': setTilemapTool('eyedropper'); break
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editorMode, handleSave, handleUndo, handleRedo, handleZoomIn, handleZoomOut])

  const toggleRegionExpand = (id) => {
    setRegions(prev => prev.map(r =>
      r.id === id ? { ...r, expanded: !r.expanded } : r
    ))
  }

  const toggleVisibility = (id) => {
    setRegions(prev => prev.map(r =>
      r.id === id ? { ...r, visible: !r.visible } : r
    ))
  }

  // 工具栏点击处理
  const handleToolChange = (tool) => {
    setActiveTool(tool)

    if (editorMode === 'tilemap') {
      // 瓦片模式下的工具映射
      switch (tool) {
        case 'save': handleSave(); return
        case 'undo': handleUndo(); return
        case 'redo': handleRedo(); return
        case 'zoomin': handleZoomIn(); return
        case 'zoomout': handleZoomOut(); return
        case 'draw': setTilemapTool('paint'); return
        case 'select': setTilemapTool('select'); return
        case 'move': setTilemapTool('move'); return
        case 'measure': setTilemapTool('measure'); return
      }
    } else {
      if (tool === 'zoomin' && canvasRef.current?._zoomIn) {
        canvasRef.current._zoomIn()
      } else if (tool === 'zoomout' && canvasRef.current?._zoomOut) {
        canvasRef.current._zoomOut()
      }
    }
  }

  return (
    <div className="map-editor">
      <Toolbar activeTool={activeTool} onToolChange={handleToolChange} saveStatus={saveStatus} />
      <div className="map-body">
        {editorMode === 'tilemap' ? (
          <>
            <TilemapLeftPanel
              selectedTile={selectedTile}
              onSelectTile={setSelectedTile}
              activeTool={tilemapTool}
              onToolChange={setTilemapTool}
              brushSize={tileBrushSize}
              onBrushSizeChange={setTileBrushSize}
            />
            <TilemapCanvas
              selectedTile={selectedTile}
              activeTool={tilemapTool}
              mapData={tilemapData}
              onMapDataChange={handleTilemapChange}
              tileZoom={tileZoom}
              brushSize={tileBrushSize}
              onEyedrop={handleEyedrop}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
            />
          </>
        ) : (
          <>
            <LeftPanel
              activeBrush={activeBrush}
              onBrushSelect={setActiveBrush}
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              brushMode={brushMode}
              onBrushModeChange={setBrushMode}
            />
            <MapCanvas
              ref={canvasRef}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              activeBrush={activeBrush}
              brushSize={brushSize}
              brushMode={brushMode}
              brushStrokes={brushStrokes}
              onAddBrushStroke={(stroke) => setBrushStrokes(prev => [...prev, stroke])}
            />
            <RightPanel
              regions={regions}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              onToggleExpand={toggleRegionExpand}
              onToggleVisibility={toggleVisibility}
            />
          </>
        )}
      </div>
      {/* 编辑器模式切换按钮 */}
      <div className="editor-mode-toggle">
        <button
          className={`mode-btn ${editorMode === 'konva' ? 'active' : ''}`}
          onClick={() => setEditorMode('konva')}
        >
          矢量编辑
        </button>
        <button
          className={`mode-btn ${editorMode === 'tilemap' ? 'active' : ''}`}
          onClick={() => setEditorMode('tilemap')}
        >
          瓦片地图
        </button>
      </div>
    </div>
  )
}
