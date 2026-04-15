import { SaveIcon, UndoIcon, RedoIcon, ZoomInIcon, ZoomOutIcon, SelectIcon, MoveIcon, DrawIcon, MeasureIcon } from './icons'

const tools = [
  { id: 'save', label: '保存', icon: <SaveIcon /> },
  { id: 'undo', label: '撤销', icon: <UndoIcon /> },
  { id: 'redo', label: '重做', icon: <RedoIcon /> },
  '|',
  { id: 'zoomin', label: '放大', icon: <ZoomInIcon /> },
  { id: 'zoomout', label: '缩小', icon: <ZoomOutIcon /> },
  '|',
  { id: 'select', label: '选择', icon: <SelectIcon /> },
  { id: 'move', label: '移动', icon: <MoveIcon /> },
  { id: 'draw', label: '绘制', icon: <DrawIcon /> },
  { id: 'measure', label: '测量', icon: <MeasureIcon /> },
]

// 非切换类工具（点击即执行，不保持 active 状态）
const actionTools = new Set(['save', 'undo', 'redo', 'zoomin', 'zoomout'])

export default function Toolbar({ activeTool, onToolChange, saveStatus }) {
  return (
    <div className="map-toolbar">
      {tools.map((tool, i) =>
        tool === '|' ? (
          <div key={i} className="map-toolbar-divider" />
        ) : (
          <button
            key={tool.id}
            className={`map-tool-btn ${!actionTools.has(tool.id) && activeTool === tool.id ? 'active' : ''}`}
            onClick={() => onToolChange(tool.id)}
            title={tool.label}
          >
            {tool.icon}
            <span className="tool-label">{tool.label}</span>
            {tool.id === 'save' && saveStatus === 'saved' && (
              <span className="save-indicator">&#10003;</span>
            )}
          </button>
        )
      )}
    </div>
  )
}
