import './LeftSidebar.css'

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const MoreIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="19" cy="12" r="1" fill="currentColor" />
    <circle cx="5" cy="12" r="1" fill="currentColor" />
  </svg>
)

// 故事面板缩略图数据
const storyPanels = [
  { id: 'prologue', title: '序章', image: 'linear-gradient(135deg, #2a3f2a 0%, #1a2a1a 100%)' },
  { id: 'ch1', title: '第1章', image: 'linear-gradient(135deg, #3a4f2a 0%, #2a3f1a 100%)' },
  { id: 'ch2', title: '第2章', image: 'linear-gradient(135deg, #2a3f4a 0%, #1a2a3f 100%)' },
  { id: 'ch3', title: '第3章', image: 'linear-gradient(135deg, #4a3a2a 0%, #3f2a1a 100%)' },
  { id: 'ch4', title: '第4章', image: 'linear-gradient(135deg, #3f2a4a 0%, #2a1a3f 100%)', active: true },
  { id: 'ch5', title: '第5章', image: 'linear-gradient(135deg, #2a4a3f 0%, #1a3f2a 100%)' }
]

// 角色头像数据
const characterAvatars = [
  { id: 1, name: '林晓月', color: '#6c5ce7' },
  { id: 2, name: '陈风行', color: '#e17055' },
  { id: 3, name: '沈暗枭', color: '#00b894' },
  { id: 4, name: '苏雨婷', color: '#fdcb6e' }
]

export default function LeftSidebar({ novelTitle, onBack }) {
  return (
    <aside className="left-sidebar">
      {/* 项目选择器 */}
      <div className="sidebar-section">
        <div className="project-label">项目</div>
        <div className="project-value">
          传说工坊 <ChevronDown />
        </div>
      </div>

      {/* 角色 */}
      <div className="sidebar-section">
        <div className="section-header">
          <span>角色</span>
          <button className="btn-more"><MoreIcon /></button>
        </div>
        <div className="character-avatars">
          {characterAvatars.map(char => (
            <div key={char.id} className="character-avatar-item">
              <div
                className="character-avatar"
                style={{ backgroundColor: char.color }}
              >
                {char.name.charAt(0)}
              </div>
              <span className="character-avatar-name">{char.name}</span>
            </div>
          ))}
        </div>
        <button className="btn-character-profiles">
          角色档案
        </button>
      </div>

      {/* 世界地图 */}
      <div className="sidebar-section">
        <div className="section-header">
          <span>世界地图</span>
          <button className="btn-more"><MoreIcon /></button>
        </div>
        <div className="world-map">
          <div className="map-image">
            <svg viewBox="0 0 200 120" className="map-svg">
              <rect width="200" height="120" fill="#2d3a2a" />
              <ellipse cx="60" cy="40" rx="30" ry="20" fill="#3d4a3a" />
              <ellipse cx="120" cy="60" rx="40" ry="25" fill="#3d4a3a" />
              <ellipse cx="150" cy="35" rx="25" ry="15" fill="#3d4a3a" />
              <circle cx="80" cy="80" r="15" fill="#3d4a3a" />
              <text x="100" y="105" textAnchor="middle" fill="#88a888" fontSize="10">阿瑟加德</text>
            </svg>
          </div>
          <div className="map-label">阿瑟加德</div>
        </div>
      </div>

      {/* 故事面板 */}
      <div className="sidebar-section">
        <div className="section-header">
          <span>故事面板</span>
          <button className="btn-more"><MoreIcon /></button>
        </div>
        <div className="story-panels-grid">
          {storyPanels.map(panel => (
            <div
              key={panel.id}
              className={`story-panel ${panel.active ? 'active' : ''}`}
            >
              <div
                className="panel-thumbnail"
                style={{ background: panel.image }}
              >
                <div className="panel-placeholder">🌲</div>
              </div>
              <div className="panel-title">{panel.title}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
