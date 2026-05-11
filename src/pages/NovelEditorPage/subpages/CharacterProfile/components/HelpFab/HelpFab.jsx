import { QuestionCircleOutlined } from '@ant-design/icons'
import './HelpFab.css'

export default function HelpFab({ onClick }) {
  return (
    <button
      type="button"
      className="help-fab"
      onClick={onClick}
      aria-label="帮助"
      title="帮助"
    >
      <QuestionCircleOutlined className="help-fab__icon" />
    </button>
  )
}
