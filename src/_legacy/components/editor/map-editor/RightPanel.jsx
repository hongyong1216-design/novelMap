import { EyeIcon, ChevronRight, ChevronDown } from './icons'

export default function RightPanel({ regions, selectedRegion, onSelectRegion, onToggleExpand, onToggleVisibility }) {
  const selectedRegionData = regions.find(r => r.id === selectedRegion) || regions[0]

  return (
    <div className="map-right-panel">
      <h3 className="map-panel-title">区域与图层</h3>

      {/* 区域名称 */}
      <div className="region-name-row">
        <label>区域名称</label>
        <EyeIcon />
      </div>

      {/* 区域树 */}
      <div className="region-tree">
        {regions.map(region => (
          <div key={region.id}>
            <div
              className={`region-tree-item ${selectedRegion === region.id ? 'selected' : ''}`}
              onClick={() => onSelectRegion(region.id)}
            >
              <span
                className="region-expand"
                onClick={(e) => { e.stopPropagation(); onToggleExpand(region.id) }}
              >
                {region.children?.length > 0
                  ? (region.expanded ? <ChevronDown /> : <ChevronRight />)
                  : <span style={{ width: 10 }} />
                }
              </span>
              <span className="region-name">{region.name}</span>
              <span
                className="region-eye"
                onClick={(e) => { e.stopPropagation(); onToggleVisibility(region.id) }}
              >
                <EyeIcon />
              </span>
            </div>
            {region.expanded && region.children?.map(child => (
              <div
                key={child.id}
                className={`region-tree-item child ${selectedRegion === child.id ? 'selected' : ''}`}
                onClick={() => onSelectRegion(child.id)}
              >
                <ChevronRight />
                <span className="region-name">{child.name}</span>
                <span className="region-eye"><EyeIcon /></span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="region-actions">
        <button className="region-action-btn">新增区域</button>
        <button className="region-action-btn">新建图层</button>
      </div>

      {/* 区域填充 */}
      <div className="region-fill-row">
        <span>区域填充</span>
        <div className="color-swatches">
          <div className="color-swatch" style={{ background: '#c0392b' }} />
          <div className="color-swatch" style={{ background: '#e74c3c' }} />
          <div className="color-swatch" style={{ background: '#e67e22' }} />
          <div className="color-swatch" style={{ background: '#27ae60' }} />
          <div className="color-swatch" style={{ background: '#2ecc71' }} />
        </div>
      </div>

      {/* 选中区域属性 */}
      <div className="region-properties">
        <div className="prop-header">
          已选择: "<span className="prop-highlight">{selectedRegionData.name}</span>"
        </div>

        <div className="prop-group">
          <label className="prop-label">名称</label>
          <input className="prop-input" defaultValue={selectedRegionData.name} />
        </div>

        <div className="prop-group">
          <label className="prop-label">类型</label>
          <input className="prop-input" defaultValue="政治区域" />
        </div>

        <div className="prop-group">
          <label className="prop-label">边框样式</label>
          <select className="prop-select">
            <option>实线, 红色</option>
            <option>虚线, 蓝色</option>
            <option>点线, 绿色</option>
          </select>
        </div>

        <div className="prop-group">
          <label className="prop-label">填充颜色</label>
          <div className="prop-color-row">
            <div className="prop-color-preview" style={{ background: '#4a8c3f' }} />
            <input className="prop-input small" defaultValue="#4A8C3F" />
            <span className="prop-opacity">透明度: 60%</span>
          </div>
        </div>

        <div className="prop-group">
          <label className="prop-label">笔记</label>
          <input className="prop-input" defaultValue="主要贸易中心，肥沃之地" />
        </div>
      </div>
    </div>
  )
}
