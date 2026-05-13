import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'

const MAX_SCALE = 4

/**
 * 管理 Konva Stage 的视图：容器尺寸、缩放、平移、空格键拖拽。
 * - cover-fit：地图始终覆盖整个容器（缩放下限 = 容器 / 世界 的较大值）。
 * - 拖动边界：dragBoundFunc 实时把位置夹紧，保证地图四边不会拖进容器内部。
 */
export default function useStageView({ stageWidth, stageHeight }) {
  const containerRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 })
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [spacePressed, setSpacePressed] = useState(false)

  const posRef = useRef(pos)
  const scaleRef = useRef(scale)
  const containerSizeRef = useRef(containerSize)
  useEffect(() => { posRef.current = pos }, [pos])
  useEffect(() => { scaleRef.current = scale }, [scale])
  useEffect(() => { containerSizeRef.current = containerSize }, [containerSize])

  const getMinScale = useCallback(
    (w, h) => Math.max(w / stageWidth, h / stageHeight),
    [stageWidth, stageHeight]
  )

  const clampPos = useCallback(
    (p, s, size) => ({
      x: Math.min(0, Math.max(size.w - stageWidth * s, p.x)),
      y: Math.min(0, Math.max(size.h - stageHeight * s, p.y)),
    }),
    [stageWidth, stageHeight]
  )

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    let initialized = false
    const update = () => {
      const w = el.offsetWidth
      const h = el.offsetHeight
      if (w <= 0 || h <= 0) return
      const size = { w, h }
      const minS = getMinScale(w, h)
      setContainerSize(size)
      if (!initialized) {
        initialized = true
        setScale(minS)
        setPos({ x: (w - stageWidth * minS) / 2, y: (h - stageHeight * minS) / 2 })
      } else {
        const newScale = Math.max(minS, scaleRef.current)
        setScale(newScale)
        setPos(clampPos(posRef.current, newScale, size))
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [stageWidth, stageHeight, getMinScale, clampPos])

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
    const oldScale = scaleRef.current
    const size = containerSizeRef.current
    const pointer = stage.getPointerPosition()
    const mousePointTo = {
      x: (pointer.x - posRef.current.x) / oldScale,
      y: (pointer.y - posRef.current.y) / oldScale,
    }
    const next = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1
    const minS = getMinScale(size.w, size.h)
    const clamped = Math.max(minS, Math.min(MAX_SCALE, next))
    const rawPos = {
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
    }
    setScale(clamped)
    setPos(clampPos(rawPos, clamped, size))
  }, [getMinScale, clampPos])

  // 拖动时实时夹紧，到达边缘后无法继续拖动
  const dragBoundFunc = useCallback(
    (p) => clampPos(p, scaleRef.current, containerSizeRef.current),
    [clampPos]
  )

  const handleDragEnd = useCallback((e) => {
    setPos(clampPos({ x: e.target.x(), y: e.target.y() }, scaleRef.current, containerSizeRef.current))
  }, [clampPos])

  const zoomBy = useCallback((factor) => {
    const size = containerSizeRef.current
    const cx = size.w / 2
    const cy = size.h / 2
    const oldScale = scaleRef.current
    const minS = getMinScale(size.w, size.h)
    const ns = Math.max(minS, Math.min(MAX_SCALE, oldScale * factor))
    const mp = { x: (cx - posRef.current.x) / oldScale, y: (cy - posRef.current.y) / oldScale }
    const rawPos = { x: cx - mp.x * ns, y: cy - mp.y * ns }
    setScale(ns)
    setPos(clampPos(rawPos, ns, size))
  }, [getMinScale, clampPos])

  return {
    containerRef,
    containerSize,
    scale,
    pos,
    spacePressed,
    getCanvasPoint,
    handleWheel,
    handleDragEnd,
    dragBoundFunc,
    zoomIn: () => zoomBy(1.25),
    zoomOut: () => zoomBy(0.8),
  }
}
