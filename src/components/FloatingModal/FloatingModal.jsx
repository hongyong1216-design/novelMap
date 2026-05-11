import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from 'antd'
import {
  CloseOutlined,
  MinusOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  EditOutlined,
} from '@ant-design/icons'
import './FloatingModal.css'

const MIN_WIDTH = 320
const MIN_HEIGHT = 200
const MINIMIZED_BUTTON_SIZE = 56
const DRAG_THRESHOLD = 3
const RESIZE_DIRECTIONS = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se']

const clamp = (v, min, max) => {
  if (max < min) return min
  return Math.min(Math.max(v, min), max)
}

export default function FloatingModal({
  open,
  onClose,
  title,
  children,
  defaultWidth = 896,
  defaultHeight = 720,
  className = '',
  bodyClassName = '',
  draggable = true,
  resizable = true,
  showMinimize = true,
  showMaximize = true,
  showClose = true,
  minimizedIcon = <EditOutlined />,
  showFooter = true,
  footerExtra = null,
  onSave,
  onCancel,
  saveText = '保存',
  cancelText = '取消',
}) {
  const [windowState, setWindowState] = useState('normal')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ w: defaultWidth, h: defaultHeight })
  const [minimizedPos, setMinimizedPos] = useState({ x: 24, y: 24 })

  const isMaximized = windowState === 'maximized'
  const isMinimized = windowState === 'minimized'

  useEffect(() => {
    if (!open) {
      setWindowState('normal')
      return
    }
    if (typeof window === 'undefined') return
    const vw = window.innerWidth
    const vh = window.innerHeight
    setSize({ w: defaultWidth, h: defaultHeight })
    setPosition({
      x: Math.max(0, (vw - defaultWidth) / 2),
      y: Math.max(0, (vh - defaultHeight) / 2),
    })
    setMinimizedPos({
      x: vw - MINIMIZED_BUTTON_SIZE - 24,
      y: vh - MINIMIZED_BUTTON_SIZE - 24,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleHeaderMouseDown = (e) => {
    if (!draggable || isMaximized) return
    if (e.button !== 0) return
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const startPosX = position.x
    const startPosY = position.y

    const onMove = (ev) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      const vw = window.innerWidth
      const vh = window.innerHeight
      setPosition({
        x: clamp(startPosX + dx, 0, Math.max(0, vw - size.w)),
        y: clamp(startPosY + dy, 0, Math.max(0, vh - size.h)),
      })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const handleResizeMouseDown = (direction) => (e) => {
    if (!resizable || isMaximized || isMinimized) return
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const startW = size.w
    const startH = size.h
    const startPosX = position.x
    const startPosY = position.y

    const onMove = (ev) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      const vw = window.innerWidth
      const vh = window.innerHeight

      let newW = startW
      let newH = startH
      let newX = startPosX
      let newY = startPosY

      if (direction.includes('e')) {
        newW = clamp(startW + dx, MIN_WIDTH, vw - startPosX)
      }
      if (direction.includes('w')) {
        const maxW = startPosX + startW
        newW = clamp(startW - dx, MIN_WIDTH, maxW)
        newX = startPosX + (startW - newW)
      }
      if (direction.includes('s')) {
        newH = clamp(startH + dy, MIN_HEIGHT, vh - startPosY)
      }
      if (direction.includes('n')) {
        const maxH = startPosY + startH
        newH = clamp(startH - dy, MIN_HEIGHT, maxH)
        newY = startPosY + (startH - newH)
      }
      setSize({ w: newW, h: newH })
      setPosition({ x: newX, y: newY })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const handleMinimizedMouseDown = (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const startPos = minimizedPos
    let moved = false

    const onMove = (ev) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (!moved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
        moved = true
      }
      if (!moved) return
      const vw = window.innerWidth
      const vh = window.innerHeight
      setMinimizedPos({
        x: clamp(startPos.x + dx, 0, vw - MINIMIZED_BUTTON_SIZE),
        y: clamp(startPos.y + dy, 0, vh - MINIMIZED_BUTTON_SIZE),
      })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      if (!moved) {
        setWindowState('normal')
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const toggleMaximize = () =>
    setWindowState((s) => (s === 'maximized' ? 'normal' : 'maximized'))

  const toggleMinimize = () =>
    setWindowState((s) => (s === 'minimized' ? 'normal' : 'minimized'))

  if (!open) return null
  if (typeof document === 'undefined') return null

  if (isMinimized) {
    return createPortal(
      <div
        className={`floating-modal__minimized-button ${className}`.trim()}
        style={{ left: minimizedPos.x, top: minimizedPos.y }}
        onMouseDown={handleMinimizedMouseDown}
        role="button"
        title="还原"
        aria-label="还原"
      >
        <span className="floating-modal__minimized-icon">{minimizedIcon}</span>
      </div>,
      document.body,
    )
  }

  const containerStyle = isMaximized
    ? { left: 0, top: 0, width: '100vw', height: '100vh' }
    : { left: position.x, top: position.y, width: size.w, height: size.h }

  const containerClassName = [
    'floating-modal',
    isMaximized ? 'floating-modal--maximized' : '',
    className,
    bodyClassName,
  ]
    .filter(Boolean)
    .join(' ')

  const headerClassName = [
    'floating-modal__header',
    draggable && !isMaximized ? 'floating-modal__header--draggable' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return createPortal(
    <div className={containerClassName} style={containerStyle} role="dialog">
      <div
        className={headerClassName}
        onMouseDown={handleHeaderMouseDown}
        onDoubleClick={showMaximize ? toggleMaximize : undefined}
      >
        <div className="floating-modal__title">{title}</div>
        <div
          className="floating-modal__actions"
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          {showMinimize && (
            <button
              type="button"
              className="floating-modal__dot floating-modal__dot--minimize"
              onClick={toggleMinimize}
              aria-label="最小化"
              title="最小化"
            >
              <MinusOutlined className="floating-modal__dot-icon" />
            </button>
          )}
          {showMaximize && (
            <button
              type="button"
              className="floating-modal__dot floating-modal__dot--maximize"
              onClick={toggleMaximize}
              aria-label={isMaximized ? '还原' : '最大化'}
              title={isMaximized ? '还原' : '最大化'}
            >
              {isMaximized ? (
                <FullscreenExitOutlined className="floating-modal__dot-icon" />
              ) : (
                <FullscreenOutlined className="floating-modal__dot-icon" />
              )}
            </button>
          )}
          {showClose && (
            <button
              type="button"
              className="floating-modal__dot floating-modal__dot--close"
              onClick={onClose}
              aria-label="关闭"
              title="关闭"
            >
              <CloseOutlined className="floating-modal__dot-icon" />
            </button>
          )}
        </div>
      </div>
      <div className="floating-modal__body">{children}</div>

      {showFooter && (
        <div
          className="floating-modal__footer"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="floating-modal__footer-extra">{footerExtra}</div>
          <div className="floating-modal__footer-actions">
            <Button onClick={onCancel || onClose}>{cancelText}</Button>
            <Button type="primary" onClick={onSave || onClose}>
              {saveText}
            </Button>
          </div>
        </div>
      )}

      {resizable && !isMaximized &&
        RESIZE_DIRECTIONS.map((dir) => (
          <div
            key={dir}
            className={`floating-modal__resize-handle floating-modal__resize-handle--${dir}`}
            onMouseDown={handleResizeMouseDown(dir)}
          />
        ))}
    </div>,
    document.body,
  )
}
