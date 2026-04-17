import { useState } from 'react'
import { tileImages } from '../../../data/tileset-config'

const tileCategories = [
  {
    id: 'trees',
    label: '乔木',
    tiles: ['0_0', '0_1', '0_2', '0_3', '0_4',
            '1_0', '1_1', '1_3', '1_4',
            '3_1', '3_3', '3_4']
  },
  {
    id: 'bushes',
    label: '灌木',
    tiles: ['2_0', '2_1', '3_2']
  },
  {
    id: 'special',
    label: '特殊',
    tiles: ['1_2', '2_2', '2_3', '2_4', '3_0']
  },
]

const groundColors = {
  grass: '#2d7a3a',
  water: '#1a6b8a',
  sand: '#c2a94e',
  stone: '#6b6b7b',
}

const groundLabels = {
  grass: '草地',
  water: '水面',
  sand: '沙地',
  stone: '石地',
}

export default function TilemapLeftPanel({ selectedTile, onSelectTile, activeTool, onToolChange, brushSize, onBrushSizeChange, mapCols, mapRows, onResizeMap, mapSizePresets, mapMaxSize }) {
  const [expandedCats, setExpandedCats] = useState(
    Object.fromEntries(tileCategories.map(c => [c.id, true]))
  )
  const [customCols, setCustomCols] = useState('')
  const [customRows, setCustomRows] = useState('')

  const toggleCategory = (id) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // 选择瓦片时自动切换到画笔工具
  const handleSelectTile = (tileKey) => {
    onSelectTile(tileKey)
    if (activeTool !== 'paint') {
      onToolChange('paint')
    }
  }

  // 获取当前选中瓦片的预览
  const renderSelectedPreview = () => {
    if (!selectedTile) return null
    const isGround = ['grass', 'water', 'sand', 'stone'].includes(selectedTile)
    if (isGround) {
      return (
        <div className="tilemap-selected-preview">
          <div className="tilemap-tile-preview" style={{ background: groundColors[selectedTile], width: 32, height: 32 }} />
          <span>{groundLabels[selectedTile]}</span>
        </div>
      )
    }
    // 装饰瓦片 tile_X_Y
    const key = selectedTile.replace('tile_', '')
    if (tileImages[key]) {
      return (
        <div className="tilemap-selected-preview">
          <img className="tilemap-tile-preview" src={tileImages[key]} alt={selectedTile} style={{ width: 32, height: 32 }} draggable={false} />
          <span>{selectedTile}</span>
        </div>
      )
    }
    return null
  }

  return (
    <div className="map-left-panel tilemap-left-panel">
      <h3 className="map-panel-title">瓦片工具</h3>

      {/* 工具区 */}
      <div className="element-section">
        <h4 className="element-section-title">绘制工具</h4>
        <div className="tilemap-tools">
          <button
            className={`tilemap-tool-btn ${activeTool === 'paint' ? 'active' : ''}`}
            onClick={() => onToolChange('paint')}
            title="绘制瓦片 (B)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/></svg>
            <span>画笔</span>
          </button>
          <button
            className={`tilemap-tool-btn ${activeTool === 'erase' ? 'active' : ''}`}
            onClick={() => onToolChange('erase')}
            title="擦除瓦片 (E)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16l9-9 8 8-4 4z"/><path d="M6 11l8 8"/></svg>
            <span>橡皮擦</span>
          </button>
          <button
            className={`tilemap-tool-btn ${activeTool === 'fill' ? 'active' : ''}`}
            onClick={() => onToolChange('fill')}
            title="填充区域 (G)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 22l1-1h3l9-9"/><path d="M3 21V18"/><path d="M12 8l4-4 4 4"/><path d="M20 16c1 1 2 2 2 3.5S21 22 20 22s-2-.5-2-2.5 1-2.5 2-3.5z"/></svg>
            <span>填充</span>
          </button>
          <button
            className={`tilemap-tool-btn ${activeTool === 'eyedropper' ? 'active' : ''}`}
            onClick={() => onToolChange('eyedropper')}
            title="吸色器 (I)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 22l1-1h3l9-9"/><path d="M16 2l6 6-2 2-6-6 2-2z"/><path d="M14.5 7.5L5 17"/></svg>
            <span>吸色</span>
          </button>
        </div>
      </div>

      {/* 笔刷大小 */}
      <div className="element-section">
        <h4 className="element-section-title">笔刷大小</h4>
        <div className="tilemap-brush-sizes">
          {[1, 2, 3].map(size => (
            <button
              key={size}
              className={`tilemap-brush-btn ${brushSize === size ? 'active' : ''}`}
              onClick={() => onBrushSizeChange(size)}
              title={`${size}x${size}`}
            >
              <div className="tilemap-brush-icon" data-size={size}>
                {Array.from({ length: size * size }).map((_, i) => (
                  <span key={i} className="tilemap-brush-dot" />
                ))}
              </div>
              <span>{size}x{size}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 地图大小 */}
      {onResizeMap && mapSizePresets && (
        <div className="element-section">
          <h4 className="element-section-title">地图大小</h4>
          <div className="tilemap-map-size-current">
            当前: {mapCols} x {mapRows}
          </div>
          <div className="tilemap-map-size-presets">
            {Object.entries(mapSizePresets).map(([key, preset]) => (
              <button
                key={key}
                className={`tilemap-size-btn ${mapCols === preset.cols && mapRows === preset.rows ? 'active' : ''}`}
                onClick={() => onResizeMap(preset.cols, preset.rows)}
                title={`${preset.cols} x ${preset.rows}`}
              >
                {preset.label}
                <span className="tilemap-size-dim">{preset.cols}x{preset.rows}</span>
              </button>
            ))}
          </div>
          <div className="tilemap-map-size-custom">
            <span className="tilemap-size-custom-label">自定义</span>
            <div className="tilemap-size-custom-inputs">
              <input
                type="number"
                className="tilemap-size-input"
                placeholder="宽"
                min={5}
                max={mapMaxSize}
                value={customCols}
                onChange={e => setCustomCols(e.target.value)}
              />
              <span className="tilemap-size-x">x</span>
              <input
                type="number"
                className="tilemap-size-input"
                placeholder="高"
                min={5}
                max={mapMaxSize}
                value={customRows}
                onChange={e => setCustomRows(e.target.value)}
              />
              <button
                className="tilemap-size-apply-btn"
                disabled={!customCols || !customRows}
                onClick={() => {
                  const c = parseInt(customCols, 10)
                  const r = parseInt(customRows, 10)
                  if (c > 0 && r > 0) {
                    onResizeMap(c, r)
                    setCustomCols('')
                    setCustomRows('')
                  }
                }}
              >
                应用
              </button>
            </div>
            <span className="tilemap-size-hint">上限 {mapMaxSize}x{mapMaxSize}，下限 5x5</span>
          </div>
        </div>
      )}

      {/* 当前选中瓦片预览 */}
      {selectedTile && (
        <div className="element-section">
          <h4 className="element-section-title">当前瓦片</h4>
          {renderSelectedPreview()}
        </div>
      )}

      {/* 瓦片调色板 */}
      <div className="element-section">
        <h4 className="element-section-title">地面</h4>
        <div className="tilemap-tile-grid">
          {Object.entries(groundColors).map(([key, color]) => (
            <div
              key={key}
              className={`tilemap-tile-item ${selectedTile === key ? 'selected' : ''}`}
              onClick={() => handleSelectTile(key)}
              title={groundLabels[key]}
            >
              <div className="tilemap-tile-preview" style={{ background: color }} />
              <span className="element-label">{groundLabels[key]}</span>
            </div>
          ))}
        </div>
      </div>

      {tileCategories.map(cat => (
        <div className="element-section" key={cat.id}>
          <h4
            className="element-section-title tilemap-cat-header"
            onClick={() => toggleCategory(cat.id)}
          >
            <span className="tilemap-cat-arrow">{expandedCats[cat.id] ? '▾' : '▸'}</span>
            {cat.label}
            <span className="tilemap-cat-count">{cat.tiles.length}</span>
          </h4>
          {expandedCats[cat.id] && (
            <div className="tilemap-tile-grid">
              {cat.tiles.map(key => (
                <div
                  key={key}
                  className={`tilemap-tile-item ${selectedTile === `tile_${key}` ? 'selected' : ''}`}
                  onClick={() => handleSelectTile(`tile_${key}`)}
                  title={`tile_${key}`}
                >
                  <img
                    className="tilemap-tile-preview"
                    src={tileImages[key]}
                    alt={`tile_${key}`}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
