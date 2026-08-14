// 单个图标的视觉呈现: 色点 / emoji / 图片 三种 kind 的统一渲染出口
// 图片 kind 且 src 为空时显示"待补图"占位, 避免图标凭空消失
export default function IconVisual({ icon, size = 20 }) {
  if (!icon) return null

  if (icon.kind === 'dot') {
    return (
      <span
        className="icon-visual__dot"
        style={{
          background: icon.color,
          width: size * 0.7,
          height: size * 0.7,
        }}
      />
    )
  }

  if (icon.kind === 'image') {
    if (!icon.src) {
      return (
        <span className="icon-visual__pending" style={{ width: size, height: size }}>
          {icon.label?.[0] || '?'}
        </span>
      )
    }
    return (
      <img
        className="icon-visual__img"
        src={icon.src}
        alt={icon.label}
        style={{ width: size, height: size }}
        draggable={false}
      />
    )
  }

  return (
    <span className="icon-visual__emoji" style={{ fontSize: size * 0.9 }}>
      {icon.char}
    </span>
  )
}
