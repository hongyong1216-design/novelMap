import { PlusOutlined } from '@ant-design/icons'
import './AddNode.css'

export default function AddNode({ onClick, label = '扩展叙事' }) {
  return (
    <button type="button" className="add-node" onClick={onClick}>
      <PlusOutlined className="add-node__icon" />
      <span className="add-node__label">{label}</span>
    </button>
  )
}
