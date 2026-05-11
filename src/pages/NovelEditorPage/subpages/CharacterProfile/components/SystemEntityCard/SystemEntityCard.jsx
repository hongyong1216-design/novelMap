import { CodeOutlined } from '@ant-design/icons'
import './SystemEntityCard.css'

export default function SystemEntityCard({ entity, onClick }) {
  return (
    <article className="system-entity-card" onClick={onClick}>
      <div className="system-entity-card__head">
        <div className="system-entity-card__icon">
          <CodeOutlined />
        </div>
        <div className="system-entity-card__meta">
          <h3 className="system-entity-card__name">{entity.name}</h3>
          {entity.subtitle && (
            <span className="system-entity-card__subtitle">{entity.subtitle}</span>
          )}
        </div>
      </div>

      <div className="system-entity-card__metrics">
        {entity.metrics?.map((m) => (
          <div
            key={m.label}
            className="system-entity-card__metric"
          >
            <span className="system-entity-card__metric-label">
              {m.label}:
            </span>
            <span
              className={
                m.tone === 'primary'
                  ? 'system-entity-card__metric-value system-entity-card__metric-value--primary'
                  : 'system-entity-card__metric-value'
              }
            >
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}
