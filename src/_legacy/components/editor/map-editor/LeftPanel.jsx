import { terrainBrushes, colorBrushes, waterBodies, roadsPaths, iconLibrary } from './data'

function ElementSection({ title, items, selectedItem, onSelectItem }) {
  return (
    <div className="element-section">
      <h4 className="element-section-title">{title}</h4>
      <div className="element-grid">
        {items.map(item => (
          <div
            key={item.id}
            className={`element-item ${selectedItem === item.id ? 'selected' : ''}`}
            title={item.label}
            onClick={() => onSelectItem(item.id)}
          >
            <div className="element-icon">{item.emoji}</div>
            <span className="element-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LeftPanel({ activeBrush, onBrushSelect, brushSize, onBrushSizeChange, brushMode, onBrushModeChange }) {
  return (
    <div className="map-left-panel">
      <h3 className="map-panel-title">地图元素</h3>

      <ElementSection
        title="纹理笔刷"
        items={terrainBrushes}
        selectedItem={activeBrush}
        onSelectItem={onBrushSelect}
      />

      <ElementSection
        title="纯色笔刷"
        items={colorBrushes}
        selectedItem={activeBrush}
        onSelectItem={onBrushSelect}
      />

      {/* 笔刷大小 */}
      {activeBrush && (
        <>
        <div className="brush-size-section">
          <div className="brush-size-header">
            <span className="element-section-title">笔刷大小</span>
            <span className="brush-size-value">{brushSize}px</span>
          </div>
          <input
            type="range"
            min="10"
            max="120"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(+e.target.value)}
            className="brush-size-slider"
          />
        </div>

        {/* 笔刷模式 */}
        <div className="brush-mode-section">
          <span className="element-section-title">绘制模式</span>
          <div className="brush-mode-grid">
            <div
              className={`brush-mode-item ${brushMode === 'smooth' ? 'selected' : ''}`}
              onClick={() => onBrushModeChange('smooth')}
              title="平滑纹理 — 连续流畅"
            >
              <div className="mode-icon">▃</div>
              <span className="mode-label">平滑</span>
            </div>
            <div
              className={`brush-mode-item ${brushMode === 'irregular' ? 'selected' : ''}`}
              onClick={() => onBrushModeChange('irregular')}
              title="不规则纹理 — 自然随机"
            >
              <div className="mode-icon">〰</div>
              <span className="mode-label">不规则</span>
            </div>
          </div>
        </div>
        </>
      )}

      <ElementSection title="水体" items={waterBodies} selectedItem={null} onSelectItem={onBrushSelect} />
      <ElementSection title="道路与路径" items={roadsPaths} selectedItem={null} onSelectItem={onBrushSelect} />
      <ElementSection title="图标库" items={iconLibrary} selectedItem={null} onSelectItem={onBrushSelect} />
    </div>
  )
}
