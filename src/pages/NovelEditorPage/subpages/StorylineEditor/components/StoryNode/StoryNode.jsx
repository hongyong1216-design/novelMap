import { useEffect, useRef } from 'react'
import { ANCHOR_SIDES } from '../../utils/geometry'
import './StoryNode.css'

function Anchor({ side, state, onPick }) {
  return (
    <span
      className={`story-node__dot story-node__dot--${side} story-node__dot--${state}`}
      title={state === 'origin' ? '再点一次取消连接' : '点击连接到别的连接点'}
      // 拦住 pointerdown，避免把「点连接点」误判成「拖节点」
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onPick?.(side)
      }}
    />
  )
}

export default function StoryNode({
  node,
  selected = false,
  dragging = false,
  connecting = false,
  pendingSide = null,
  onSelect,
  onPickAnchor,
  onDragStart,
  onMeasure,
}) {
  const ref = useRef(null)

  // 量卡片实际尺寸，连线端点要按它算
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const report = () =>
      onMeasure?.(node.id, { w: el.offsetWidth, h: el.offsetHeight })
    report()
    const ro = new ResizeObserver(report)
    ro.observe(el)
    return () => ro.disconnect()
  }, [node.id, onMeasure])

  const cls = [
    'story-node',
    dragging && 'story-node--dragging',
    connecting && 'story-node--connecting',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={ref}
      className={cls}
      style={{ left: node.x, top: node.y }}
      onPointerDown={(e) => onDragStart?.(e, node)}
    >
      {ANCHOR_SIDES.map((side) => (
        <Anchor
          key={side}
          side={side}
          state={pendingSide === side ? 'origin' : connecting ? 'ready' : 'idle'}
          onPick={onPickAnchor}
        />
      ))}

      <article
        className={
          selected
            ? 'story-node__card story-node__card--selected'
            : 'story-node__card'
        }
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.(node)
        }}
      >
        <header className="story-node__head">
          <span className="story-node__act">{node.act}</span>
          {node.tags?.length > 0 && (
            <div className="story-node__tags">
              {node.tags.map((tag) => (
                <span key={tag} className="story-node__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <h3 className="story-node__title">{node.title}</h3>
        <p className="story-node__desc">{node.desc}</p>
      </article>
    </div>
  )
}
