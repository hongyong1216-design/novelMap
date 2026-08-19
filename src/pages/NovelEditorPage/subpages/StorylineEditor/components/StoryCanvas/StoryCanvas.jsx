import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StoryNode from '../StoryNode/StoryNode'
import EdgeLayer from '../EdgeLayer/EdgeLayer'
import usePanZoom from '../../hooks/usePanZoom'
import { anchorPoint } from '../../utils/geometry'
import { STAGE_W, STAGE_H } from '../../data/storyline'
import './StoryCanvas.css'

const DRAG_THRESHOLD = 4

export default function StoryCanvas({
  nodes,
  edges,
  selectedId,
  onSelect,
  onNodeMove,
  onConnect,
  onDeleteEdge,
  onScaleChange,
  viewportRef,
}) {
  const { containerRef, transform, dragging, handlers } = usePanZoom({
    onScaleChange,
  })

  const [sizes, setSizes] = useState({})
  const [draggingId, setDraggingId] = useState(null)
  // 连接中的起点：{ nodeId, side }
  const [pending, setPending] = useState(null)
  const [cursor, setCursor] = useState(null)

  const dragRef = useRef(null)
  // 拖完之后紧跟着的那次 click 要吞掉，否则一拖动就弹窗
  const suppressClickRef = useRef(false)

  const nodeMap = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes],
  )

  const handleMeasure = useCallback((id, size) => {
    setSizes((prev) => {
      const p = prev[id]
      if (p && p.w === size.w && p.h === size.h) return prev
      return { ...prev, [id]: size }
    })
  }, [])

  // 供外部（新增节点）拿到当前视口中心的画布坐标
  useEffect(() => {
    if (!viewportRef) return
    viewportRef.current = () => {
      const el = containerRef.current
      if (!el) return { x: 400, y: 300 }
      const r = el.getBoundingClientRect()
      return {
        x: (r.width / 2 - transform.x) / transform.scale,
        y: (r.height / 2 - transform.y) / transform.scale,
      }
    }
  })

  const toStage = useCallback(
    (clientX, clientY) => {
      const el = containerRef.current
      if (!el) return { x: 0, y: 0 }
      const r = el.getBoundingClientRect()
      return {
        x: (clientX - r.left - transform.x) / transform.scale,
        y: (clientY - r.top - transform.y) / transform.scale,
      }
    },
    [containerRef, transform],
  )

  // ---------- 拖动节点 ----------
  const handleNodeDragStart = useCallback((e, node) => {
    if (e.button !== 0) return
    e.stopPropagation() // 不要让画布跟着平移
    suppressClickRef.current = false
    dragRef.current = {
      id: node.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: node.x,
      originY: node.y,
      moved: false,
    }
  }, [])

  // 监听始终挂着，没在拖的时候直接返回；否则 pointerdown 后来不及挂上
  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current
      if (!d || d.pointerId !== e.pointerId) return
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      if (!d.moved) {
        d.moved = true
        setDraggingId(d.id)
        window.getSelection?.()?.removeAllRanges()
      }
      onNodeMove?.(
        d.id,
        Math.round(d.originX + dx / transform.scale),
        Math.round(d.originY + dy / transform.scale),
      )
    }

    const onUp = () => {
      const d = dragRef.current
      if (!d) return
      suppressClickRef.current = d.moved
      dragRef.current = null
      setDraggingId(null)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [onNodeMove, transform.scale])

  // ---------- 连接 ----------
  // 注意：onConnect 必须在 updater 外面调，否则等于「在渲染过程中更新父组件」
  const handlePickAnchor = useCallback(
    (nodeId, side) => {
      if (!pending) {
        setPending({ nodeId, side })
        return
      }
      // 再点同一个点＝取消
      if (pending.nodeId === nodeId && pending.side === side) {
        setPending(null)
        return
      }
      // 不允许自己连自己
      if (pending.nodeId === nodeId) return
      onConnect?.(pending, { nodeId, side })
      setPending(null)
    },
    [pending, onConnect],
  )

  useEffect(() => {
    if (!pending) return
    const onKey = (e) => {
      if (e.key === 'Escape') setPending(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pending])

  const pendingGeom = useMemo(() => {
    if (!pending) return null
    const node = nodeMap[pending.nodeId]
    if (!node) return null
    return {
      point: anchorPoint(node, pending.side, sizes[node.id]),
      side: pending.side,
      cursor,
    }
  }, [pending, nodeMap, sizes, cursor])

  const cls = [
    'story-canvas',
    dragging && 'story-canvas--dragging',
    pending && 'story-canvas--connecting',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={containerRef}
      className={cls}
      style={{
        backgroundPosition: `${transform.x}px ${transform.y}px`,
        backgroundSize: `${40 * transform.scale}px ${40 * transform.scale}px`,
      }}
      {...handlers}
      onPointerDown={(e) => {
        handlers.onPointerDown(e)
        // 节点和连接点都拦了 pointerdown，能到这里说明点的是空白处
        if (pending) setPending(null)
      }}
      onPointerMove={(e) => {
        handlers.onPointerMove(e)
        if (pending) setCursor(toStage(e.clientX, e.clientY))
      }}
    >
      <div
        className="story-canvas__stage"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
      >
        <EdgeLayer
          edges={edges}
          nodeMap={nodeMap}
          sizes={sizes}
          width={STAGE_W}
          height={STAGE_H}
          pending={pendingGeom}
          onDeleteEdge={onDeleteEdge}
        />

        {nodes.map((node) => (
          <StoryNode
            key={node.id}
            node={node}
            selected={node.id === selectedId}
            dragging={node.id === draggingId}
            connecting={!!pending}
            pendingSide={pending?.nodeId === node.id ? pending.side : null}
            onSelect={(n) => {
              if (suppressClickRef.current) {
                suppressClickRef.current = false
                return
              }
              if (pending) {
                setPending(null)
                return
              }
              onSelect?.(n)
            }}
            onPickAnchor={(side) => handlePickAnchor(node.id, side)}
            onDragStart={handleNodeDragStart}
            onMeasure={handleMeasure}
          />
        ))}
      </div>
    </div>
  )
}
