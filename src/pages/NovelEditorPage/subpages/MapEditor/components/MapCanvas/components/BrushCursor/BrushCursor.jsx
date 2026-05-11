import { forwardRef } from 'react'
import './BrushCursor.css'

/**
 * 笔刷光标 DOM 元素（跟随鼠标的圆）。
 * 通过 ref 直接操作 style，避免每次 mousemove 触发 React 重渲染。
 */
const BrushCursor = forwardRef(function BrushCursor({ size, visible }, ref) {
  return (
    <div
      ref={ref}
      className="brush-cursor"
      style={{
        display: visible ? 'block' : 'none',
        width: size,
        height: size,
      }}
    />
  )
})

export default BrushCursor
