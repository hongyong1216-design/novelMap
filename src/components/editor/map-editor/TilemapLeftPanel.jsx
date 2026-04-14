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

export default function TilemapLeftPanel({ selectedTile, onSelectTile, activeTool, onToolChange }) {
  const [expandedCats, setExpandedCats] = useState(
    Object.fromEntries(tileCategories.map(c => [c.id, true]))
  )

  const toggleCategory = (id) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }))
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
            title="绘制瓦片"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/></svg>
            <span>画笔</span>
          </button>
          <button
            className={`tilemap-tool-btn ${activeTool === 'erase' ? 'active' : ''}`}
            onClick={() => onToolChange('erase')}
            title="擦除瓦片"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16l9-9 8 8-4 4z"/><path d="M6 11l8 8"/></svg>
            <span>橡皮擦</span>
          </button>
          <button
            className={`tilemap-tool-btn ${activeTool === 'fill' ? 'active' : ''}`}
            onClick={() => onToolChange('fill')}
            title="填充区域"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 22l1-1h3l9-9"/><path d="M3 21V18"/><path d="M12 8l4-4 4 4"/><path d="M20 16c1 1 2 2 2 3.5S21 22 20 22s-2-.5-2-2.5 1-2.5 2-3.5z"/></svg>
            <span>填充</span>
          </button>
        </div>
      </div>

      {/* 瓦片调色板 */}
      <div className="element-section">
        <h4 className="element-section-title">地面</h4>
        <div className="tilemap-tile-grid">
          <div
            className={`tilemap-tile-item ${selectedTile === 'grass' ? 'selected' : ''}`}
            onClick={() => onSelectTile('grass')}
            title="草地"
          >
            <div className="tilemap-tile-preview" style={{ background: '#2d7a3a' }} />
            <span className="element-label">草地</span>
          </div>
          <div
            className={`tilemap-tile-item ${selectedTile === 'water' ? 'selected' : ''}`}
            onClick={() => onSelectTile('water')}
            title="水面"
          >
            <div className="tilemap-tile-preview" style={{ background: '#1a6b8a' }} />
            <span className="element-label">水面</span>
          </div>
          <div
            className={`tilemap-tile-item ${selectedTile === 'sand' ? 'selected' : ''}`}
            onClick={() => onSelectTile('sand')}
            title="沙地"
          >
            <div className="tilemap-tile-preview" style={{ background: '#c2a94e' }} />
            <span className="element-label">沙地</span>
          </div>
          <div
            className={`tilemap-tile-item ${selectedTile === 'stone' ? 'selected' : ''}`}
            onClick={() => onSelectTile('stone')}
            title="石地"
          >
            <div className="tilemap-tile-preview" style={{ background: '#6b6b7b' }} />
            <span className="element-label">石地</span>
          </div>
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
                  onClick={() => onSelectTile(`tile_${key}`)}
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
