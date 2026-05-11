import { ToolOutlined } from '@ant-design/icons'
import './ToolboxFab.css'

export default function ToolboxFab({ onClick, active = false }) {
  return (
    <button
      type="button"
      className={
        active
          ? 'toolbox-fab toolbox-fab--active'
          : 'toolbox-fab'
      }
      onClick={onClick}
      aria-label="切换编辑工具箱"
      title="编辑工具箱"
    >
      <ToolOutlined className="toolbox-fab__icon" />
    </button>
  )
}
