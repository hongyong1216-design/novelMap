import DetailHeader from '../DetailHeader/DetailHeader'
import BasicInfoForm from '../BasicInfoForm/BasicInfoForm'
import ConnectionsSection from '../ConnectionsSection/ConnectionsSection'
import './FactionDetail.css'

export default function FactionDetail({
  faction,
  onChange,
  onDelete,
  onSave,
  onAddConnection,
}) {
  if (!faction) {
    return (
      <section className="faction-detail faction-detail--empty">
        <div className="faction-detail__empty">
          <span className="faction-detail__empty-label">NO FACTION SELECTED</span>
          <p className="faction-detail__empty-hint">从左侧档案库中选择一个势力开始编辑</p>
        </div>
      </section>
    )
  }

  return (
    <section className="faction-detail">
      <div className="faction-detail__panel">
        <DetailHeader
          faction={faction}
          onChange={onChange}
          onDelete={onDelete}
          onSave={onSave}
        />
        <BasicInfoForm faction={faction} onChange={onChange} />
        <ConnectionsSection
          connections={faction.connections}
          onAdd={onAddConnection}
        />
      </div>
    </section>
  )
}
