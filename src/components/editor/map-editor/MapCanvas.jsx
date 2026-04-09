import { useState, useRef, useLayoutEffect, useEffect, forwardRef } from 'react'
import { Stage, Layer, Rect, Circle, Text, Line, Group } from 'react-konva'

/* ===== 地图数据定义 ===== */
const mapRegions = [
  { id: 'veridian', name: '翡翠帝国', path: 'M300 100 Q400 80 550 90 Q700 70 800 100 Q850 120 900 110 Q950 130 1000 120 L1050 150 Q1000 200 950 250 Q900 300 850 280 Q750 320 650 300 Q550 330 450 280 Q350 250 300 200 Z', fill: 'url(#landGrad1)', center: [650, 200] },
  { id: 'aurora', name: '极光之境', path: 'M1100 80 Q1200 60 1350 80 Q1500 70 1600 100 Q1650 150 1700 200 Q1680 300 1620 350 Q1500 400 1400 380 Q1300 350 1200 300 Q1150 250 1100 180 Z', fill: 'url(#landGrad2)', center: [1380, 220] },
  { id: 'ironcrags', name: '铁岩山脉', path: 'M400 500 Q500 470 650 480 Q800 470 900 500 Q950 550 980 620 Q950 700 880 730 Q750 760 600 740 Q450 720 380 660 Q350 600 380 540 Z', fill: 'url(#landGrad1)', center: [680, 600] },
  { id: 'whisperingsea', name: '低语之海', path: '', center: [400, 420] },
  { id: 'sunwood', name: '阳木森林', path: '', center: [550, 150] },
  { id: 'capitalcity', name: '帝都', path: '', center: [700, 200] },
  { id: 'glacial', name: '冰川平原', path: '', center: [1300, 100] },
  { id: 'frostbite', name: '霜蚀峰', path: '', center: [1350, 300] },
]

const mapCities = [
  { id: 'capital', name: '帝都', x: 700, y: 200, size: 6, color: '#ffd700' },
  { id: 'frostpeak', name: '霜蚀峰', x: 1350, y: 300, size: 5, color: '#fff' },
  { id: 'island', name: '翠风岛', x: 220, y: 640, size: 4, color: '#ddd' },
  { id: 'dragon', name: '龙骨', x: 1280, y: 600, size: 4, color: '#ddd' },
]

const mapRoutes = [
  { id: 'route1', points: [[300, 300], [500, 400], [700, 380], [900, 360], [1100, 300]], color: '#5a9aaa', opacity: 0.4 },
  { id: 'route2', points: [[900, 500], [1050, 520], [1200, 560]], color: '#5a9aaa', opacity: 0.4 },
]

const mapMountains = [
  'M500 130 L520 100 L540 130 M550 125 L575 90 L600 125 M610 120 L635 85 L660 120',
  'M700 680 L720 650 L740 680 M750 675 L775 640 L800 675',
]

const mapDesert = 'M550 520 Q650 500 750 520 Q720 580 650 590 Q580 580 550 520 Z'
const mapGlacier = 'M1200 100 Q1300 80 1400 90 Q1350 130 1250 120 Z'
const mapNorthIce1 = 'M100 30 Q400 0 700 20 Q600 60 400 50 Q200 55 100 30 Z'
const mapNorthIce2 = 'M1500 15 Q1700 0 1900 25 Q1800 55 1650 50 Q1520 40 1500 15 Z'
const mapSouthIce = 'M200 1100 Q500 1070 900 1080 Q1200 1070 1600 1090 Q1700 1120 1800 1200 L0 1200 Q100 1150 200 1100 Z'

const STAGE_W = 2000
const STAGE_H = 1200

function parsePath(d) {
  const pts = []
  const tokens = d.replace(/([A-Za-z])/g, ' $1 ').trim().split(/\s+/)
  let x = 0, y = 0
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t === 'M') { x = +tokens[++i]; y = +tokens[++i]; pts.push([x, y]) }
    else if (t === 'L' || t === 'Q') { x = +tokens[++i]; y = +tokens[++i]; pts.push([x, y]) }
    else if (t === 'Z') { /* close */ }
  }
  return pts
}

const MapCanvas = forwardRef(function MapCanvas({ selectedRegion, onSelectRegion, onHoverElement }, ref) {
  const stageRef = useRef(null)
  const canvasContainerRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 })
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [hoveredId, setHoveredId] = useState(null)

  // 自适应容器尺寸 — 监听外层 .map-canvas div
  useLayoutEffect(() => {
    const el = canvasContainerRef.current
    if (!el) return

    const updateSize = () => {
      const w = el.offsetWidth
      const h = el.offsetHeight
      if (w > 0 && h > 0) {
        setContainerSize({ w, h })
        const s = Math.min(w / STAGE_W, h / STAGE_H) * 0.95
        setScale(s)
        setPos({ x: (w - STAGE_W * s) / 2, y: (h - STAGE_H * s) / 2 })
      }
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleWheel = (e) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const oldScale = scale
    const pointer = stage.getPointerPosition()
    const mousePointTo = {
      x: (pointer.x - pos.x) / oldScale,
      y: (pointer.y - pos.y) / oldScale,
    }
    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1
    const clampedScale = Math.max(0.2, Math.min(4, newScale))
    setScale(clampedScale)
    setPos({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    })
  }

  const handleDragEnd = (e) => {
    setPos({ x: e.target.x(), y: e.target.y() })
  }

  const zoomIn = () => {
    const stage = stageRef.current
    if (!stage) return
    const center = { x: stage.width() / 2, y: stage.height() / 2 }
    const mousePointTo = { x: (center.x - pos.x) / scale, y: (center.y - pos.y) / scale }
    const ns = Math.min(4, scale * 1.25)
    setScale(ns)
    setPos({ x: center.x - mousePointTo.x * ns, y: center.y - mousePointTo.y * ns })
  }

  const zoomOut = () => {
    const stage = stageRef.current
    if (!stage) return
    const center = { x: stage.width() / 2, y: stage.height() / 2 }
    const mousePointTo = { x: (center.x - pos.x) / scale, y: (center.y - pos.y) / scale }
    const ns = Math.max(0.2, scale * 0.8)
    setScale(ns)
    setPos({ x: center.x - mousePointTo.x * ns, y: center.y - mousePointTo.y * ns })
  }

  // 暴露缩放方法给父组件
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current._zoomIn = zoomIn
      stageRef.current._zoomOut = zoomOut
    }
  })

  return (
    <div className="map-canvas-area">
      <div className="map-tab-bar">
        <div className="map-tab active">
          阿瑟加德地图 <span className="map-tab-close">×</span>
        </div>
      </div>
      <div className="map-canvas" ref={canvasContainerRef}>
        <Stage
          ref={stageRef}
          width={containerSize.w}
          height={containerSize.h}
          scaleX={scale}
          scaleY={scale}
          x={pos.x}
          y={pos.y}
          onWheel={handleWheel}
          draggable
          onDragEnd={handleDragEnd}
          onTap={(e) => {
            const target = e.target
            const id = target.attrs.dataId
            if (id && mapRegions.find(r => r.id === id)) {
              onSelectRegion(id)
            }
          }}
        >
          <Layer>
            {/* 背景 */}
            <Rect x={-5000} y={-5000} width={12000} height={12000} fill="#0d2a3a" />

            {/* 渐变定义用 Rect 模拟 */}
            <Rect x={0} y={0} width={STAGE_W} height={STAGE_H} fillLinearGradientStartPoint={{x:0,y:0}} fillLinearGradientEndPoint={{x:0,y:STAGE_H}} fillLinearGradientColorStops={[0, '#1a4a6a', 1, '#0d2a3a']} />

            {/* 网格线 */}
            <Group opacity={0.08}>
              {[...Array(20)].map((_, i) => (
                <Line key={`h${i}`} points={[0, i * 60, STAGE_W, i * 60]} stroke="#fff" strokeWidth={0.5} />
              ))}
              {[...Array(33)].map((_, i) => (
                <Line key={`v${i}`} points={[i * 60, 0, i * 60, STAGE_H]} stroke="#fff" strokeWidth={0.5} />
              ))}
            </Group>

            {/* 大陆区域 */}
            {mapRegions.filter(r => r.path).map(region => {
              const points = parsePath(region.path)
              if (points.length < 2) return null
              const isSelected = selectedRegion === region.id
              const isHovered = hoveredId === region.id

              // 将路径点转为 Line 的 points
              const linePoints = points.flatMap(p => p)
              return (
                <Group key={region.id}>
                  {/* 填充 */}
                  <Line
                    points={linePoints}
                    closed
                    fill={isSelected ? '#6aaa4f' : region.fill === 'url(#landGrad1)' ? '#4a8c3f' : '#5a9a4a'}
                    opacity={isHovered ? 0.9 : 0.85}
                    dataId={region.id}
                    onClick={() => onSelectRegion(region.id)}
                    onMouseEnter={() => { setHoveredId(region.id); onHoverElement?.(region.name) }}
                    onMouseLeave={() => { setHoveredId(null); onHoverElement?.(null) }}
                  />
                  {/* 边框 */}
                  <Line
                    points={linePoints}
                    closed
                    fill="transparent"
                    stroke={isSelected ? '#ff4444' : '#2a5a1a'}
                    strokeWidth={isSelected ? 3 : 2}
                    dash={isSelected ? [10, 5] : undefined}
                    dataId={region.id}
                    onClick={() => onSelectRegion(region.id)}
                    onMouseEnter={() => { setHoveredId(region.id); onHoverElement?.(region.name) }}
                    onMouseLeave={() => { setHoveredId(null); onHoverElement?.(null) }}
                  />
                  {/* 名称 */}
                  {region.center && (
                    <Text
                      x={region.center[0] - 30}
                      y={region.center[1] - 15}
                      text={region.name}
                      fontSize={region.id === 'ironcrags' ? 18 : 22}
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      fill={isSelected ? '#ffd700' : '#2a5a1a'}
                      listening={false}
                    />
                  )}
                </Group>
              )
            })}

            {/* 特殊地貌 */}
            {/* 沙漠 */}
            <Line points={parsePath(mapDesert).flatMap(p => p)} closed fill="#c4a44a" stroke="#aa8a3a" strokeWidth={1} opacity={0.8} />
            <Text x={620} y={545} text="大荒漠" fontSize={14} fill="#8a6a2a" fontFamily="sans-serif" />

            {/* 冰川 */}
            <Line points={parsePath(mapGlacier).flatMap(p => p)} closed fill="#d8dde0" stroke="#8a9aa0" strokeWidth={1} opacity={0.8} />

            {/* 南北冰原 */}
            <Line points={parsePath(mapNorthIce1).flatMap(p => p)} closed fill="#b8c8d0" stroke="#8a9aa0" strokeWidth={1} opacity={0.6} />
            <Line points={parsePath(mapNorthIce2).flatMap(p => p)} closed fill="#b8c8d0" stroke="#8a9aa0" strokeWidth={1} opacity={0.6} />
            <Line points={parsePath(mapSouthIce).flatMap(p => p)} closed fill="#b8c8d0" stroke="#8a9aa0" strokeWidth={1} opacity={0.5} />
            <Text x={900} y={1135} text="冻土荒原" fontSize={24} fontWeight="bold" fill="#6a7a8a" fontFamily="sans-serif" />

            {/* 山脉 */}
            {mapMountains.map((path, i) => (
              <Line key={`mtn${i}`} points={parsePath(path).flatMap(p => p)} stroke="#5a4a2a" strokeWidth={2.5} />
            ))}

            {/* 航线 */}
            {mapRoutes.map(route => (
              <Line
                key={route.id}
                points={route.points.flatMap(p => p)}
                stroke={route.color}
                strokeWidth={1.5}
                dash={[8, 4]}
                opacity={route.opacity}
                smooth
              />
            ))}

            {/* 城市标记 */}
            {mapCities.map(city => (
              <Group key={city.id}>
                <Circle
                  x={city.x}
                  y={city.y}
                  radius={city.size}
                  fill={city.color}
                  stroke="#333"
                  strokeWidth={city.size > 5 ? 2 : 1.5}
                />
                <Text
                  x={city.x}
                  y={city.y + city.size + 10}
                  text={city.name}
                  fontSize={city.size > 5 ? 18 : 14}
                  fontFamily="sans-serif"
                  fill={city.color}
                  align="center"
                  offsetX={30}
                />
              </Group>
            ))}

            {/* 海洋文字 */}
            <Text x={320} y={405} text="低语之海" fontSize={20} fontStyle="italic" fill="#3a7aaa" opacity={0.7} fontFamily="sans-serif" />
            <Text x={120} y={335} text="西方洋" fontSize={16} fontStyle="italic" fill="#2a5a8a" opacity={0.5} fontFamily="sans-serif" />
            <Text x={1640} y={435} text="东方洋" fontSize={16} fontStyle="italic" fill="#2a5a8a" opacity={0.5} fontFamily="sans-serif" />
            <Text x={920} y={885} text="南方深海" fontSize={18} fontStyle="italic" fill="#2a5a8a" opacity={0.5} fontFamily="sans-serif" />

            {/* 标题 */}
            <Text
              x={STAGE_W / 2}
              y={50}
              text="阿瑟加德大陆全图"
              fontSize={32}
              fontFamily="sans-serif"
              fontWeight="bold"
              fill="#d4c8a0"
              align="center"
              offsetX={120}
            />

            {/* 简易罗盘 */}
            <Group x={250} y={950}>
              <Circle r={40} fill="rgba(0,0,0,0.3)" stroke="#c4a44a" strokeWidth={2} />
              <Line points={[0, -35, 0, 35]} stroke="#c4a44a" strokeWidth={1} />
              <Line points={[-35, 0, 35, 0]} stroke="#c4a44a" strokeWidth={1} />
              <Text x={-6} y={-36} text="北" fontSize={14} fontWeight="bold" fill="#c4a44a" fontFamily="sans-serif" />
              <Text x={-6} y={42} text="南" fontSize={12} fill="#8a7a5a" fontFamily="sans-serif" />
              <Text x={-52} y={-4} text="西" fontSize={12} fill="#8a7a5a" fontFamily="sans-serif" />
              <Text x={40} y={-4} text="东" fontSize={12} fill="#8a7a5a" fontFamily="sans-serif" />
            </Group>

            {/* 小地图 */}
            <Group x={1750} y={50}>
              <Rect width={200} height={120} rx={4} fill="rgba(0,0,0,0.5)" stroke="#555" strokeWidth={1} />
              <Rect x={30} y={10} width={60} height={30} rx={2} fill="#3a6a2a" opacity={0.6} />
              <Rect x={110} y={8} width={50} height={35} rx={2} fill="#4a7a3a" opacity={0.6} />
              <Rect x={40} y={55} width={55} height={30} rx={2} fill="#3a6a2a" opacity={0.6} />
              <Rect x={120} y={60} width={30} height={20} rx={2} fill="#3a6a2a" opacity={0.6} />
              <Rect x={20} y={95} width={160} height={15} rx={1} fill="#9aa8b0" opacity={0.3} />
              {/* 视口框 */}
              <Rect x={15} y={5} width={80} height={50} rx={1} fill="none" stroke="#fff" strokeWidth={1.5} />
            </Group>
          </Layer>
        </Stage>
      </div>

      {/* 底部状态栏 */}
      <div className="map-statusbar">
        <span>缩放: {Math.round(scale * 100)}%</span>
        <span>X: {Math.round((pos.x) / scale * -1 + 500)}, Y: {Math.round((pos.y) / scale * -1 + 300)}</span>
        <span>点击区域可选中</span>
        <span>滚轮缩放 · 拖拽平移</span>
      </div>
    </div>
  )
})

export default MapCanvas