import { useRef } from 'react'
import { Stage, Layer } from 'react-konva'
import MapBackground from './components/MapBackground/MapBackground'
import MapRegions from './components/MapRegions/MapRegions'
import MapMarkers from './components/MapMarkers/MapMarkers'
import MapLabels from './components/MapLabels/MapLabels'
import MapOverlays from './components/MapOverlays/MapOverlays'
import BrushStrokes from './components/BrushStrokes/BrushStrokes'
import BrushCursor from './components/BrushCursor/BrushCursor'
import useStageView from './hooks/useStageView'
import useBrushPainting from './hooks/useBrushPainting'
import { STAGE_WIDTH, STAGE_HEIGHT } from './data/world'
import './MapCanvas.css'

/**
 * 矢量地图画布外壳：
 * - 用 useStageView 管理 Stage 缩放/平移/容器尺寸/空格键拖拽。
 * - 用 useBrushPainting 管理笔刷绘制状态。
 * - 把世界地图（背景/区域/标记/标签/罗盘）和笔刷层堆叠组装。
 */
export default function MapCanvas({
  selectedRegion,
  onSelectRegion,
  activeBrush = null,
  brushSize = 40,
  brushMode = 'smooth',
  brushStrokes = [],
  onAddBrushStroke,
}) {
  const view = useStageView({
    stageWidth: STAGE_WIDTH,
    stageHeight: STAGE_HEIGHT,
  })

  const painting = useBrushPainting({
    activeBrush,
    brushSize,
    brushMode,
    spacePressed: view.spacePressed,
    getCanvasPoint: view.getCanvasPoint,
    onAddStroke: onAddBrushStroke,
  })

  const cursorRef = useRef(null)
  const brushActive = !!activeBrush

  const cursorMode = view.spacePressed ? 'grab' : brushActive ? 'brush' : 'default'
  const stageDraggable = !brushActive || view.spacePressed

  // 容器层 mousemove → 直接 DOM 操作更新笔刷光标位置
  const handleContainerMove = (e) => {
    const cursorEl = cursorRef.current
    if (!cursorEl || !brushActive || view.spacePressed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    cursorEl.style.left = `${mx - brushSize / 2}px`
    cursorEl.style.top = `${my - brushSize / 2}px`
    cursorEl.style.display = 'block'
  }

  const handleContainerLeave = () => {
    if (cursorRef.current) cursorRef.current.style.display = 'none'
  }

  return (
    <div
      ref={view.containerRef}
      className={`map-canvas map-canvas--cursor-${cursorMode}`}
      onMouseMove={handleContainerMove}
      onMouseLeave={handleContainerLeave}
    >
      <Stage
        width={view.containerSize.w}
        height={view.containerSize.h}
        scaleX={view.scale}
        scaleY={view.scale}
        x={view.pos.x}
        y={view.pos.y}
        draggable={stageDraggable}
        onDragEnd={view.handleDragEnd}
        onWheel={view.handleWheel}
        onMouseDown={painting.onMouseDown}
        onMouseMove={painting.onMouseMove}
        onMouseUp={painting.onMouseUp}
        onMouseLeave={painting.onMouseLeave}
      >
        <Layer>
          <MapBackground />
          <MapRegions
            selectedRegion={selectedRegion}
            onSelectRegion={onSelectRegion}
            brushActive={brushActive}
          />
          <MapMarkers />
          <MapLabels />
          <MapOverlays />
        </Layer>

        <BrushStrokes
          strokes={brushStrokes}
          activeBrush={activeBrush}
          brushSize={brushSize}
          brushMode={brushMode}
          currentPoints={painting.currentPoints}
          isPainting={painting.isPainting}
        />
      </Stage>

      {brushActive && (
        <BrushCursor ref={cursorRef} size={brushSize} visible={false} />
      )}
    </div>
  )
}
