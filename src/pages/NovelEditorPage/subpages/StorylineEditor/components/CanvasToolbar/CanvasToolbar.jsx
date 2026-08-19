import { Button } from 'antd'
import { PlusCircleOutlined, SaveOutlined } from '@ant-design/icons'
import './CanvasToolbar.css'

export default function CanvasToolbar({
  title = '故事架构编辑器',
  version = 'Editor v2.4',
  syncLabel = '状态: 已同步',
  onAddNode,
  onSave,
  saving = false,
  dirty = false,
}) {
  return (
    <header className="canvas-toolbar">
      <div className="canvas-toolbar__meta">
        <h2 className="canvas-toolbar__title">{title}</h2>
        <p className="canvas-toolbar__sub">
          {version} // {syncLabel}
        </p>
      </div>

      <div className="canvas-toolbar__actions">
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={onAddNode}
          className="canvas-toolbar__btn canvas-toolbar__btn--primary"
        >
          新增节点
        </Button>

        {/* 有未保存改动时提到主色, 让人一眼看见该点它了 */}
        <Button
          type={dirty ? 'primary' : 'default'}
          icon={<SaveOutlined />}
          onClick={onSave}
          loading={saving}
          className="canvas-toolbar__btn"
        >
          保存
        </Button>
      </div>
    </header>
  )
}
