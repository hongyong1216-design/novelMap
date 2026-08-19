import { useCallback, useEffect, useRef, useState } from 'react'

const MIN_SCALE = 0.3
const MAX_SCALE = 2.5
const DRAG_THRESHOLD = 4

/**
 * 画布平移 / 缩放。
 * 返回容器 ref、当前 transform 以及需要挂到容器上的事件。
 */
export default function usePanZoom({ initialScale = 0.85, onScaleChange } = {}) {
  const containerRef = useRef(null)
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: initialScale,
  })
  const [dragging, setDragging] = useState(false)

  const dragRef = useRef(null)
  const movedRef = useRef(false)

  useEffect(() => {
    onScaleChange?.(transform.scale)
  }, [transform.scale, onScaleChange])

  const handlePointerDown = useCallback((e) => {
    // 只响应左键与中键
    if (e.button !== 0 && e.button !== 1) return
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: 0,
      originY: 0,
    }
    movedRef.current = false
    setTransform((prev) => {
      dragRef.current.originX = prev.x
      dragRef.current.originY = prev.y
      return prev
    })
    // 注意：此处不能捕获指针。一旦捕获，后续 pointerup / click 会被重定向到画布，
    // 节点卡片的 onClick 就再也不会触发。等真正开始拖动后再捕获。
  }, [])

  const handlePointerMove = useCallback((e) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    if (!movedRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    if (!movedRef.current) {
      movedRef.current = true
      setDragging(true)
      // 越过阈值＝确实在拖动，此时才捕获指针，保证移出画布也能继续拖
      e.currentTarget.setPointerCapture?.(e.pointerId)
      // 清掉可能已存在的文本选区，避免拖动变成拖选文本
      window.getSelection?.()?.removeAllRanges()
    }
    setTransform((prev) => ({
      ...prev,
      x: drag.originX + dx,
      y: drag.originY + dy,
    }))
  }, [])

  const endDrag = useCallback((e) => {
    if (!dragRef.current) return
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture?.(e.pointerId)
    }
    dragRef.current = null
    setDragging(false)
  }, [])

  // 拖动超过阈值时吞掉随后的 click，避免误选节点
  const handleClickCapture = useCallback((e) => {
    if (!movedRef.current) return
    movedRef.current = false
    e.stopPropagation()
    e.preventDefault()
  }, [])

  // wheel 需要 passive: false 才能 preventDefault，故手动绑定
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      setTransform((prev) => {
        const factor = Math.exp(-e.deltaY * 0.0015)
        const scale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, prev.scale * factor),
        )
        const ratio = scale / prev.scale
        return {
          scale,
          x: px - (px - prev.x) * ratio,
          y: py - (py - prev.y) * ratio,
        }
      })
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const reset = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: initialScale })
  }, [initialScale])

  return {
    containerRef,
    transform,
    dragging,
    reset,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClickCapture: handleClickCapture,
      // 阻止图片等元素触发原生 HTML5 拖拽
      onDragStart: (e) => e.preventDefault(),
    },
  }
}
