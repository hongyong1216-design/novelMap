import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../styles/EditorPage.css'
import LeftSidebar from '../components/editor/LeftSidebar'
import EditorToolbar from '../components/editor/EditorToolbar'
import EditorContent from '../components/editor/EditorContent'
import RightPanel from '../components/editor/RightPanel'
import MapEditor from '../components/editor/MapEditor'

// 模拟小说数据
const novelsData = {
  1: {
    id: 1,
    title: '虚空回响',
    chapter: '第四章：低语之森',
    content: `林晓月无声地穿行在这片古老而茂密的森林中，空气中弥漫着潮湿的水汽和淡淡的苔藓气息。参天古树高耸入云，盘虬卧龙的枝干在头顶编织出一片厚重的树冠，只允许斑驳的阳光洒落在林间地面上……

她的脚步轻盈而谨慎，每一步都避开了可能发出声响的枯枝落叶。远处传来一阵若有若无的低语声，像是风穿过树叶的缝隙，又像是某种古老的呢喃。林晓月停下脚步，屏住呼吸，竖起耳朵仔细倾听。

那声音越来越清晰，不是风声，而是真实的低语——来自森林深处，来自那些被人遗忘的古老遗迹之中。

她握紧了手中的护身符，继续向前走去。这片森林有太多秘密等待被揭开，而她知道，自己已经走上了一条无法回头的道路……

（正文继续，共 1,942 字，第 22/88 页）`,
    words: 1942,
    page: '22/88'
  },
  2: { title: '发条城市', chapter: '第三章', content: '这里是内容...', words: 2100, page: '30/95' },
  3: { title: '绯红地平线', chapter: '第七章', content: '这里是内容...', words: 3200, page: '45/120' },
  4: { title: '低语森林', chapter: '第四章', content: '这里是内容...', words: 1942, page: '22/88' },
  5: { title: '数字游民', chapter: '第二章', content: '这里是内容...', words: 1500, page: '15/60' },
  6: { title: '蛇之卷轴', chapter: '第五章', content: '这里是内容...', words: 2800, page: '38/100' }
}

// 角色数据
const characters = [
  { id: 1, name: '林晓月', role: '主角', color: '#6c5ce7' },
  { id: 2, name: '陈风行', role: '盟友', color: '#e17055' },
  { id: 3, name: '沈暗枭', role: '反派', color: '#00b894' }
]

// 时间线条目
const timelineEntries = [
  { id: 1, chapter: '第1章', title: '开始' },
  { id: 2, chapter: '第2章', title: '发展' },
  { id: 3, chapter: '第3章', title: '转折' },
  { id: 4, chapter: '第4章', title: '当前' },
  { id: 5, chapter: '第5章', title: '后续' }
]

// 大纲数据
const outlineData = [
  { id: 1, title: '入场', completed: true },
  { id: 2, title: '相遇', completed: false },
  { id: 3, title: '揭示', completed: false }
]

// 计算中文字数
function countWords(text) {
  if (!text) return 0
  return text.replace(/\s/g, '').length
}

// 获取当前时间
function useCurrentTime() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])
  return time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 导航图标定义
const navItems = [
  {
    id: 'home',
    label: '传说工坊',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    isLogo: true,
  },
  {
    id: 'editor',
    label: '编辑器',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    ),
  },
  {
    id: 'characters',
    label: '角色',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: 'chapters',
    label: '章节',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: 'map',
    label: '世界地图',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    id: 'timeline',
    label: '时间线',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
]

const bottomNavItems = [
  {
    id: 'help',
    label: '帮助',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: '设置',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

export default function EditorPage() {
  const { novelId } = useParams()
  const navigate = useNavigate()
  const novel = novelsData[novelId] || novelsData[1]
  const currentTime = useCurrentTime()

  const [activeView, setActiveView] = useState('editor') // 'editor' | 'map'
  const [content, setContent] = useState(novel.content)
  const [saveStatus, setSaveStatus] = useState('')
  const [fontSize, setFontSize] = useState('16px')
  const [fontFamily, setFontFamily] = useState('Georgia, serif')

  const wordCount = countWords(content)

  const handleSave = useCallback(() => {
    setSaveStatus('saving')
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(''), 2000)
    }, 500)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  const handleNavClick = (id) => {
    if (id === 'home') {
      navigate('/')
    } else if (id === 'map') {
      setActiveView('map')
    } else if (id === 'editor' || id === 'characters' || id === 'chapters' || id === 'timeline') {
      setActiveView('editor')
    }
  }

  // 地图视图
  if (activeView === 'map') {
    return (
      <div className="editor-page">
        {/* 最左侧图标导航栏 */}
        <nav className="icon-nav">
          <div className="icon-nav-top">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`icon-nav-btn ${item.isLogo ? 'logo-btn' : ''} ${item.id === 'map' ? 'active' : ''}`}
                title={item.label}
                onClick={() => handleNavClick(item.id)}
              >
                {item.icon}
              </button>
            ))}
          </div>
          <div className="icon-nav-bottom">
            {bottomNavItems.map(item => (
              <button key={item.id} className="icon-nav-btn" title={item.label}>
                {item.icon}
              </button>
            ))}
          </div>
        </nav>

        {/* 地图编辑器占据剩余空间 */}
        <MapEditor />
      </div>
    )
  }

  // 编辑器视图
  return (
    <div className="editor-page">
      {/* 最左侧图标导航栏 */}
      <nav className="icon-nav">
        <div className="icon-nav-top">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`icon-nav-btn ${item.isLogo ? 'logo-btn' : ''} ${item.id === 'editor' ? 'active' : ''}`}
              title={item.label}
              onClick={() => handleNavClick(item.id)}
            >
              {item.icon}
            </button>
          ))}
        </div>
        <div className="icon-nav-bottom">
          {bottomNavItems.map(item => (
            <button key={item.id} className="icon-nav-btn" title={item.label}>
              {item.icon}
            </button>
          ))}
        </div>
      </nav>

      {/* 左侧边栏 */}
      <LeftSidebar
        novelTitle={novel.title}
        onBack={() => navigate('/')}
      />

      {/* 主编辑区域 */}
      <div className="editor-main">
        {/* 顶部面包屑导航栏 */}
        <header className="editor-header">
          <div className="header-breadcrumb">
            <span className="breadcrumb-item" onClick={() => navigate('/')}>传说工坊</span>
            <span className="breadcrumb-sep">|</span>
            <span className="breadcrumb-item">{novel.title}</span>
            <span className="breadcrumb-sep">|</span>
            <span className="breadcrumb-item active">{novel.chapter}</span>
          </div>
          <div className="header-right">
            <span className="save-status">
              {saveStatus === 'saving' && '保存中...'}
              {saveStatus === 'saved' && '已保存'}
            </span>
            <span className="header-time">{currentTime}</span>
            <button className="header-icon-btn" onClick={handleSave} title="保存">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            </button>
            <button className="header-icon-btn" title="导出">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
        </header>

        {/* 编辑器工具栏 */}
        <EditorToolbar
          fontSize={fontSize}
          fontFamily={fontFamily}
          onFontSizeChange={setFontSize}
          onFontFamilyChange={setFontFamily}
        />

        {/* 编辑内容区域 */}
        <EditorContent
          novelTitle={novel.title}
          chapterTitle={novel.chapter}
          content={content}
          onChange={setContent}
          fontSize={fontSize}
          fontFamily={fontFamily}
        />
      </div>

      {/* 右侧面板 */}
      <RightPanel
        characters={characters}
        timelineEntries={timelineEntries}
        outlineData={outlineData}
      />
    </div>
  )
}
