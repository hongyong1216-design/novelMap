import { ReadOutlined } from '@ant-design/icons'
import './HistoryFab.css'

export default function HistoryFab({ onClick }) {
  return (
    <button
      type="button"
      className="history-fab"
      onClick={onClick}
      aria-label="叙事历史"
      title="叙事历史"
    >
      <ReadOutlined className="history-fab__icon" />
    </button>
  )
}
