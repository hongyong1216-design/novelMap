import { Slider } from 'antd'
import FloatingModal from '../../../../../../components/FloatingModal/FloatingModal'
import { terrainBrushes } from '../MapCanvas/data/brushes'
import './ToolboxModal.css'

const BRUSH_MODES = [
  { key: 'smooth',    label: '平滑',   glyph: '▃' },
  { key: 'irregular', label: '不规则', glyph: '〰' },
]

function BrushTile({ brush, active, onSelect }) {
  return (
    <button
      type="button"
      className={active ? 'toolbox-modal__brush toolbox-modal__brush--active' : 'toolbox-modal__brush'}
      onClick={() => onSelect(active ? null : brush.id)}
      title={brush.label}
    >
      <span className="toolbox-modal__brush-emoji">{brush.emoji}</span>
      <span className="toolbox-modal__brush-label">{brush.label}</span>
      {brush.color && (
        <span
          className="toolbox-modal__brush-swatch"
          style={{ background: brush.color }}
          aria-hidden
        />
      )}
    </button>
  )
}

function Section({ label, children }) {
  return (
    <div className="toolbox-modal__section">
      <div className="toolbox-modal__section-label">{label}</div>
      {children}
    </div>
  )
}

export default function ToolboxModal({
  open,
  onClose,
  activeBrush,
  onBrushChange,
  brushSize,
  onBrushSizeChange,
  brushMode,
  onBrushModeChange,
}) {
  return (
    <FloatingModal
      open={open}
      onClose={onClose}
      title={<span className="toolbox-modal__title">编辑工具箱</span>}
      defaultWidth={360}
      defaultHeight={560}
      className="toolbox-modal"
      showFooter={false}
    >
      <div className="toolbox-modal__panel">
        <Section label="纹理笔刷">
          <div className="toolbox-modal__brush-grid">
            {terrainBrushes.map((b) => (
              <BrushTile
                key={b.id}
                brush={b}
                active={activeBrush === b.id}
                onSelect={onBrushChange}
              />
            ))}
          </div>
        </Section>

        {activeBrush && (
          <>
            <div className="toolbox-modal__separator" />

            <div className="toolbox-modal__controls">
              <div className="toolbox-modal__control">
                <div className="toolbox-modal__control-head">
                  <label className="toolbox-modal__control-label">笔刷大小 (Size)</label>
                  <span className="toolbox-modal__control-value">{brushSize}px</span>
                </div>
                <Slider
                  value={brushSize}
                  min={10}
                  max={120}
                  tooltip={{ open: false }}
                  onChange={onBrushSizeChange}
                />
              </div>

              <div className="toolbox-modal__control">
                <div className="toolbox-modal__control-head">
                  <label className="toolbox-modal__control-label">绘制模式 (Mode)</label>
                </div>
                <div className="toolbox-modal__mode-grid">
                  {BRUSH_MODES.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      className={
                        brushMode === m.key
                          ? 'toolbox-modal__mode toolbox-modal__mode--active'
                          : 'toolbox-modal__mode'
                      }
                      onClick={() => onBrushModeChange(m.key)}
                      title={m.label}
                    >
                      <span className="toolbox-modal__mode-glyph">{m.glyph}</span>
                      <span className="toolbox-modal__mode-label">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </FloatingModal>
  )
}
