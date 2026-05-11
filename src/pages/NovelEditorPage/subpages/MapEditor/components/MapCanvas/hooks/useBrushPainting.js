import { useRef, useState, useCallback, useEffect } from 'react'

/**
 * 笔刷绘制状态机：mousedown 开始记录、mousemove 累积点、mouseup 提交一笔。
 * 移动距离过大时插值补点；rAF 节流触发预览重渲染。
 */
export default function useBrushPainting({
  activeBrush, brushSize, brushMode, spacePressed,
  getCanvasPoint, onAddStroke,
}) {
  const isPainting = useRef(false)
  const currentPoints = useRef([])
  const strokeIdRef = useRef(0)
  const rafRef = useRef(null)
  const [renderTick, setRenderTick] = useState(0)

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const start = useCallback((e) => {
    if (!activeBrush || spacePressed) return
    e.evt.preventDefault()
    isPainting.current = true
    strokeIdRef.current = Date.now()
    const p = getCanvasPoint(e.evt.clientX, e.evt.clientY)
    currentPoints.current = [p.x, p.y]
  }, [activeBrush, spacePressed, getCanvasPoint])

  const move = useCallback((e) => {
    if (!isPainting.current || !activeBrush || spacePressed) return
    const p = getCanvasPoint(e.evt.clientX, e.evt.clientY)
    const pts = currentPoints.current
    if (pts.length >= 2) {
      const lx = pts[pts.length - 2]
      const ly = pts[pts.length - 1]
      const dx = p.x - lx
      const dy = p.y - ly
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 2) return
      if (dist > 20) {
        const steps = Math.ceil(dist / 10)
        for (let s = 1; s <= steps; s++) {
          const t = s / steps
          pts.push(lx + dx * t, ly + dy * t)
        }
      } else {
        pts.push(p.x, p.y)
      }
    } else {
      pts.push(p.x, p.y)
    }
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        setRenderTick((c) => c + 1)
      })
    }
  }, [activeBrush, spacePressed, getCanvasPoint])

  const end = useCallback(() => {
    if (!isPainting.current || !activeBrush) {
      isPainting.current = false
      return
    }
    isPainting.current = false
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (currentPoints.current.length >= 2) {
      onAddStroke({
        id: `stroke_${strokeIdRef.current}`,
        points: [...currentPoints.current],
        brushId: activeBrush,
        brushSize,
        brushMode,
      })
    }
    currentPoints.current = []
    setRenderTick((c) => c + 1)
  }, [activeBrush, brushSize, brushMode, onAddStroke])

  return {
    isPainting,
    currentPoints,
    renderTick,
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: end,
    onMouseLeave: end,
  }
}
