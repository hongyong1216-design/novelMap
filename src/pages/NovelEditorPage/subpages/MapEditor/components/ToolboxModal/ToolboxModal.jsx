import { useState } from 'react'
import { Slider, Tabs } from 'antd'
import {
  EditOutlined,
  BgColorsOutlined,
  ClearOutlined,
  HighlightOutlined,
} from '@ant-design/icons'
import FloatingModal from '../../../../../../components/FloatingModal/FloatingModal'
import './ToolboxModal.css'

const BRUSH_TOOLS = [
  { key: 'brush',  label: '画笔',  icon: <EditOutlined /> },
  { key: 'fill',   label: '填充',  icon: <BgColorsOutlined /> },
  { key: 'eraser', label: '橡皮擦', icon: <ClearOutlined /> },
  { key: 'path',   label: '路径',  icon: <HighlightOutlined /> },
]

const TILE_ASSETS = [
  { key: 'grass',    label: '草地' },
  { key: 'stone',    label: '石板' },
  { key: 'water',    label: '水面' },
  { key: 'mountain', label: '山脉' },
]

const DEFAULTS = { tool: 'brush', size: 12, opacity: 80 }

function BrushPanel({ tool, onToolChange, size, onSizeChange, opacity, onOpacityChange }) {
  return (
    <div className="toolbox-modal__panel">
      <div className="toolbox-modal__tool-grid">
        {BRUSH_TOOLS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={
              tool === t.key
                ? 'toolbox-modal__tool toolbox-modal__tool--active'
                : 'toolbox-modal__tool'
            }
            onClick={() => onToolChange(t.key)}
            title={t.label}
            aria-label={t.label}
          >
            <span className="toolbox-modal__tool-icon">{t.icon}</span>
          </button>
        ))}
      </div>

      <div className="toolbox-modal__separator" />

      <div className="toolbox-modal__controls">
        <div className="toolbox-modal__control">
          <div className="toolbox-modal__control-head">
            <label className="toolbox-modal__control-label">大小 (Size)</label>
            <span className="toolbox-modal__control-value">{size}px</span>
          </div>
          <Slider
            value={size}
            min={1}
            max={64}
            tooltip={{ open: false }}
            onChange={onSizeChange}
          />
        </div>

        <div className="toolbox-modal__control">
          <div className="toolbox-modal__control-head">
            <label className="toolbox-modal__control-label">
              不透明度 (Opacity)
            </label>
            <span className="toolbox-modal__control-value">{opacity}%</span>
          </div>
          <Slider
            value={opacity}
            min={0}
            max={100}
            tooltip={{ open: false }}
            onChange={onOpacityChange}
          />
        </div>
      </div>
    </div>
  )
}

function TilePanel({ tile, onTileChange }) {
  return (
    <div className="toolbox-modal__panel">
      <div className="toolbox-modal__tool-grid">
        {TILE_ASSETS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={
              tile === t.key
                ? 'toolbox-modal__tile toolbox-modal__tile--active'
                : 'toolbox-modal__tile'
            }
            onClick={() => onTileChange(t.key)}
          >
            <span className="toolbox-modal__tile-label">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ToolboxModal({ open, onClose, onApply }) {
  const [activeTab, setActiveTab] = useState('brush')
  const [tool, setTool] = useState(DEFAULTS.tool)
  const [size, setSize] = useState(DEFAULTS.size)
  const [opacity, setOpacity] = useState(DEFAULTS.opacity)
  const [tile, setTile] = useState(TILE_ASSETS[0].key)

  const handleReset = () => {
    setTool(DEFAULTS.tool)
    setSize(DEFAULTS.size)
    setOpacity(DEFAULTS.opacity)
    setTile(TILE_ASSETS[0].key)
  }

  const handleApply = () => {
    onApply?.({ tool, size, opacity, tile })
  }

  const tabItems = [
    {
      key: 'brush',
      label: '画笔工具',
      children: (
        <BrushPanel
          tool={tool}
          onToolChange={setTool}
          size={size}
          onSizeChange={setSize}
          opacity={opacity}
          onOpacityChange={setOpacity}
        />
      ),
    },
    {
      key: 'tile',
      label: '瓦片资产',
      children: <TilePanel tile={tile} onTileChange={setTile} />,
    },
  ]

  return (
    <FloatingModal
      open={open}
      onClose={onClose}
      title={<span className="toolbox-modal__title">编辑工具箱</span>}
      defaultWidth={360}
      defaultHeight={520}
      className="toolbox-modal"
      saveText="应用"
      cancelText="重置"
      onSave={handleApply}
      onCancel={handleReset}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="toolbox-modal__tabs"
        size="small"
      />
    </FloatingModal>
  )
}
