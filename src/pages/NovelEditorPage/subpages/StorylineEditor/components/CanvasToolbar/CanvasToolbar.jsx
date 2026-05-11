import { Button } from 'antd'
import { FilterOutlined, PlusCircleOutlined } from '@ant-design/icons'
import './CanvasToolbar.css'

export default function CanvasToolbar({
  title = '故事架构编辑器',
  version = 'Editor v2.4',
  syncLabel = '状态: 已同步',
  conflicts = 0,
  onFilter,
  onAddBranch,
}) {
  return (
    <header className="canvas-toolbar">
      <div className="canvas-toolbar__left">
        <div className="canvas-toolbar__meta">
          <h2 className="canvas-toolbar__title">{title}</h2>
          <p className="canvas-toolbar__sub">
            {version} // {syncLabel}
          </p>
        </div>
        <span className="canvas-toolbar__divider" />
        <div className="canvas-toolbar__chips">
          <span className="canvas-toolbar__chip canvas-toolbar__chip--secondary">
            主线剧情
          </span>
          <span className="canvas-toolbar__chip canvas-toolbar__chip--tertiary">
            冲突节点: {conflicts}
          </span>
        </div>
      </div>

      <div className="canvas-toolbar__actions">
        <Button
          icon={<FilterOutlined />}
          onClick={onFilter}
          className="canvas-toolbar__btn"
        >
          过滤器
        </Button>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={onAddBranch}
          className="canvas-toolbar__btn canvas-toolbar__btn--primary"
        >
          新增分支
        </Button>
      </div>
    </header>
  )
}
