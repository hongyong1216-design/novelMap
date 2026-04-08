import { terrainBrushes, waterBodies, roadsPaths, iconLibrary } from './data'

function ElementSection({ title, items }) {
  return (
    <div className="element-section">
      <h4 className="element-section-title">{title}</h4>
      <div className="element-grid">
        {items.map(item => (
          <div key={item.id} className="element-item" title={item.label}>
            <div className="element-icon">{item.emoji}</div>
            <span className="element-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LeftPanel() {
  return (
    <div className="map-left-panel">
      <h3 className="map-panel-title">地图元素</h3>
      <ElementSection title="地形笔刷" items={terrainBrushes} />
      <ElementSection title="水体" items={waterBodies} />
      <ElementSection title="道路与路径" items={roadsPaths} />
      <ElementSection title="图标库" items={iconLibrary} />
    </div>
  )
}
