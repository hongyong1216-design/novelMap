import { Button, Tooltip } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { PX_PER_CELL, CELL_OVERLAP, worldSizeOf } from '../../utils/grid'
import './GridInfoPanel.css'

// 右上角小浮层: 只读展示网格规格 + 刷新地图按钮 (重新拉取格子图片)
export default function GridInfoPanel({ gridSize, onRefresh }) {
  const worldPx = worldSizeOf(gridSize)

  return (
    <div className="grid-info-panel">
      <div className="grid-info-panel__head">
        <span className="grid-info-panel__label">网格规格</span>
        <span className="grid-info-panel__value">
          {gridSize} × {gridSize}
        </span>
        <Tooltip title="刷新地图" placement="left">
          <Button
            className="grid-info-panel__refresh"
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
          />
        </Tooltip>
      </div>
      <div className="grid-info-panel__meta">
        世界 {worldPx.toLocaleString()} × {worldPx.toLocaleString()} px
        <span className="grid-info-panel__meta-sub">
          单格 {PX_PER_CELL}px · 邻格重叠 {Math.round(CELL_OVERLAP * 100)}%
        </span>
      </div>
    </div>
  )
}
