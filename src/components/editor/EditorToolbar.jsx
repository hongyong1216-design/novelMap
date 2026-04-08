import './EditorToolbar.css'

// 图标组件
const BoldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
)

const ItalicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
)

const UnderlineIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
    <line x1="4" y1="21" x2="20" y2="21" />
  </svg>
)

const AlignLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="17" y1="18" x2="3" y2="18" />
  </svg>
)

const AlignCenterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="10" x2="6" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="18" y1="18" x2="6" y2="18" />
  </svg>
)

const AlignRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="21" y1="10" x2="7" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="21" y1="18" x2="7" y2="18" />
  </svg>
)

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const OrderedListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6" />
    <line x1="10" y1="12" x2="21" y2="12" />
    <line x1="10" y1="18" x2="21" y2="18" />
    <path d="M4 6h1v4" />
    <path d="M4 10h2" />
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
  </svg>
)

const IndentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 8 7 12 3 16" />
    <line x1="21" y1="12" x2="7" y2="12" />
    <line x1="21" y1="6" x2="17" y2="6" />
    <line x1="21" y1="18" x2="17" y2="18" />
  </svg>
)

const PenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
)

const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const fontOptions = [
  { label: '默认', value: 'Georgia, serif' },
  { label: '宋体', value: '"SimSun", "宋体", serif' },
  { label: '黑体', value: '"SimHei", "黑体", sans-serif' },
  { label: '楷体', value: '"KaiTi", "楷体", serif' },
  { label: '仿宋', value: '"FangSong", "仿宋", serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
]

const sizeOptions = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
]

export default function EditorToolbar({ fontSize, fontFamily, onFontSizeChange, onFontFamilyChange }) {
  return (
    <div className="editor-toolbar">
      {/* 左侧格式工具 */}
      <div className="toolbar-group">
        <button className="toolbar-btn" title="加粗">
          <BoldIcon />
        </button>
        <button className="toolbar-btn" title="斜体">
          <ItalicIcon />
        </button>
        <button className="toolbar-btn" title="下划线">
          <UnderlineIcon />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* 对齐方式 */}
      <div className="toolbar-group">
        <button className="toolbar-btn" title="左对齐">
          <AlignLeftIcon />
        </button>
        <button className="toolbar-btn" title="居中">
          <AlignCenterIcon />
        </button>
        <button className="toolbar-btn" title="右对齐">
          <AlignRightIcon />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* 列表 */}
      <div className="toolbar-group">
        <button className="toolbar-btn" title="无序列表">
          <ListIcon />
        </button>
        <button className="toolbar-btn" title="有序列表">
          <OrderedListIcon />
        </button>
        <button className="toolbar-btn" title="缩进">
          <IndentIcon />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* 字体选择 */}
      <div className="toolbar-group">
        <select
          className="toolbar-select font-select"
          value={fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
        >
          {fontOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* 字号选择 */}
      <div className="toolbar-group">
        <select
          className="toolbar-select size-select"
          value={fontSize}
          onChange={(e) => onFontSizeChange(e.target.value)}
        >
          {sizeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="toolbar-divider" />

      {/* 文本高亮 */}
      <div className="toolbar-group">
        <button className="toolbar-btn highlight-btn" title="高亮">
          <PenIcon />
        </button>
      </div>

      {/* 右侧搜索 */}
      <div className="toolbar-right">
        <div className="search-box">
          <SearchIcon />
          <input type="text" placeholder="查找..." />
        </div>
      </div>
    </div>
  )
}
