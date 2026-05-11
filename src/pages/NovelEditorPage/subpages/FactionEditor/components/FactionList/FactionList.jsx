import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import FactionCard from '../FactionCard/FactionCard'
import './FactionList.css'

export default function FactionList({
  factions,
  selectedId,
  onSelect,
  onCreate,
}) {
  return (
    <section className="faction-list">
      <header className="faction-list__header">
        <h2 className="faction-list__title">
          势力档案库
          <span className="faction-list__title-suffix"> / FACTIONS</span>
        </h2>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={onCreate}
          className="faction-list__create"
        >
          创建新势力
        </Button>
      </header>

      <div className="faction-list__scroll">
        {factions.map((f) => (
          <FactionCard
            key={f.id}
            faction={f}
            selected={f.id === selectedId}
            onClick={() => onSelect(f.id)}
          />
        ))}
      </div>
    </section>
  )
}
