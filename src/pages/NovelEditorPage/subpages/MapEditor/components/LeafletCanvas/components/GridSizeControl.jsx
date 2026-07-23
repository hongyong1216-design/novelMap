import { Button, Modal, Tooltip } from 'antd'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { MIN_GRID_SIZE, MAX_GRID_SIZE, PX_PER_CELL, CELL_OVERLAP, parseCellId, worldSizeOf } from '../utils/grid'

// 收集 newSize 之后会被丢弃的已填充格 (x >= newSize 或 y >= newSize)
function collectAffected(cells, newSize) {
  const out = []
  Object.entries(cells).forEach(([id, cell]) => {
    const pos = parseCellId(id)
    if (!pos) return
    if (pos.x >= newSize || pos.y >= newSize) out.push({ id, name: cell?.name })
  })
  return out
}

export default function GridSizeControl({ gridSize, cells, onChange }) {
  const apply = (nextSize) => {
    if (nextSize < MIN_GRID_SIZE || nextSize > MAX_GRID_SIZE) return
    if (nextSize >= gridSize) {
      onChange(nextSize)
      return
    }
    const affected = collectAffected(cells, nextSize)
    if (affected.length === 0) {
      onChange(nextSize)
      return
    }
    Modal.confirm({
      title: `缩减到 ${nextSize} × ${nextSize} 会删除 ${affected.length} 个已填充格`,
      content: (
        <div className="grid-size-control__confirm">
          <p>以下格子的索引超出新范围,确认后将一并丢弃:</p>
          <ul>
            {affected.map((c) => (
              <li key={c.id}>
                <code>{c.id}</code>
                {c.name ? ` — ${c.name}` : ''}
              </li>
            ))}
          </ul>
        </div>
      ),
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => onChange(nextSize),
    })
  }

  const worldPx = worldSizeOf(gridSize)

  return (
    <div className="grid-size-control">
      <div className="grid-size-control__label">网格规模</div>
      <div className="grid-size-control__row">
        <Tooltip title="减少一格">
          <Button
            size="small"
            shape="circle"
            icon={<MinusOutlined />}
            disabled={gridSize <= MIN_GRID_SIZE}
            onClick={() => apply(gridSize - 1)}
          />
        </Tooltip>
        <span className="grid-size-control__value">
          {gridSize} × {gridSize}
        </span>
        <Tooltip title="增加一格">
          <Button
            size="small"
            shape="circle"
            icon={<PlusOutlined />}
            disabled={gridSize >= MAX_GRID_SIZE}
            onClick={() => apply(gridSize + 1)}
          />
        </Tooltip>
      </div>
      <div className="grid-size-control__meta">
        世界 {worldPx.toLocaleString()} × {worldPx.toLocaleString()} px
        <span className="grid-size-control__meta-sub">
          {' '}(单格 {PX_PER_CELL}px · 邻格重叠 {Math.round(CELL_OVERLAP * 100)}%)
        </span>
      </div>
    </div>
  )
}
