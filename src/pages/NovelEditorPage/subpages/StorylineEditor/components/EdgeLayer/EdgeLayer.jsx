import { anchorPoint, edgePath } from '../../utils/geometry'
import './EdgeLayer.css'

/**
 * 连线层。SVG 本身不吃鼠标事件，只有线条可点（点一下删除）。
 */
export default function EdgeLayer({
  edges,
  nodeMap,
  sizes,
  width,
  height,
  pending,
  onDeleteEdge,
}) {
  return (
    <svg
      className="edge-layer"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {edges.map((edge) => {
        const from = nodeMap[edge.from.nodeId]
        const to = nodeMap[edge.to.nodeId]
        if (!from || !to) return null

        const a = anchorPoint(from, edge.from.side, sizes[from.id])
        const b = anchorPoint(to, edge.to.side, sizes[to.id])
        const d = edgePath(a, edge.from.side, b, edge.to.side)

        return (
          <g key={edge.id} className="edge-layer__edge">
            {/* 加宽的透明描边，纯粹为了好点中 */}
            <path className="edge-layer__hit" d={d} />
            <path className="edge-layer__line" d={d} />
            <path
              className="edge-layer__hover"
              d={d}
              onClick={(e) => {
                e.stopPropagation()
                onDeleteEdge?.(edge.id)
              }}
            >
              <title>点击删除这条连线</title>
            </path>
          </g>
        )
      })}

      {/* 连接中：从起点拉一条虚线跟着鼠标 */}
      {pending?.point && pending?.cursor && (
        <path
          className="edge-layer__pending"
          d={edgePath(
            pending.point,
            pending.side,
            pending.cursor,
            pending.side === 'left'
              ? 'right'
              : pending.side === 'right'
                ? 'left'
                : pending.side === 'top'
                  ? 'bottom'
                  : 'top',
          )}
        />
      )}
    </svg>
  )
}
