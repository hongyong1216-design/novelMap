import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'

/**
 * 管理 Konva Stage 的视图：容器尺寸、缩放、平移、空格键拖拽。
 * 容器变化时自动 fit 整个 stage 到视口。
 */
export default function useStageView({ stageWidth, stageHeight, fitPadding = 0.95 }) {
  const containerRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 })
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [spacePressed, setSpacePressed] = useState(false)

  const posRef = useRef(pos)
  const scaleRef = useRef(scale)
  useEffect(() => { posRef.current = pos }, [pos])
  useEffect(() => { scaleRef.current = scale }, [scale])

  // 自适应容器尺寸 + 初始化缩放/位置
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const w = el.offsetWidth
      const h = el.offsetHeight
      if (w > 0 && h > 0) {
        setContainerSize({ w, h })
        const s = Math.min(w / stageWidth, h / stageHeight) * fitPadding
        setScale(s)
        setPos({ x: (w - stageWidth * s) / 2, y: (h - stageHeight * s) / 2 })
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [stageWidth, stageHeight, fitPadding])

  // 空格键 → 抓取拖拽模式
  useEffect(() => {
    const onDown = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        setSpacePressed(true)
      }
    }
    const onUp = (e) => {
      if (e.code === 'Space') setSpacePressed(false)
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  // 屏幕坐标 → 画布坐标
  const getCanvasPoint = useCallback((clientX, clientY) => {
    const el = containerRef.current
    if (!el) return { x: 0, y: 0 }
    const rect = el.getBoundingClientRect()
    return {
      x: (clientX - rect.left - posRef.current.x) / scaleRef.current,
      y: (clientY - rect.top - posRef.current.y) / scaleRef.current,
    }
  }, [])

  const handleWheel = useCallback((e) => {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    if (!stage) return
    const oldScale = scale
    const pointer = stage.getPointerPosition()
    const mousePointTo = {
      x: (pointer.x - pos.x) / oldScale,
      y: (pointer.y - pos.y) / oldScale,
    }
    const next = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1
    const clamped = Math.max(0.2, Math.min(4, next))
    setScale(clamped)
    setPos({
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
    })
  }, [scale, pos])

  const handleDragEnd = useCallback((e) => {
    setPos({ x: e.target.x(), y: e.target.y() })
  }, [])

  const zoomBy = useCallback((factor) => {
    setScale((prev) => {
      const ns = Math.max(0.2, Math.min(4, prev * factor))
      const cx = containerSize.w / 2
      const cy = containerSize.h / 2
      const mp = { x: (cx - posRef.current.x) / prev, y: (cy - posRef.current.y) / prev }
      setPos({ x: cx - mp.x * ns, y: cy - mp.y * ns })
      return ns
    })
  }, [containerSize])

  return {
    containerRef,
    containerSize,
    scale,
    pos,
    spacePressed,
    getCanvasPoint,
    handleWheel,
    handleDragEnd,
    zoomIn: () => zoomBy(1.25),
    zoomOut: () => zoomBy(0.8),
  }
}
