import { PlusOutlined } from '@ant-design/icons'
import './ConnectionsSection.css'

const CONNECTION_TYPES = {
  conflict: { label: '核心冲突', tone: 'tertiary' },
  ally:     { label: '盟友关系', tone: 'primary' },
}

export default function ConnectionsSection({ connections = [], onAdd }) {
  return (
    <section className="connections">
      <h4 className="connections__title">叙事关联 / CONNECTIONS</h4>
      <div className="connections__grid">
        {connections.map((c, idx) => {
          const meta = CONNECTION_TYPES[c.type] || { label: c.type, tone: 'primary' }
          return (
            <article
              key={`${c.type}-${idx}`}
              className={`connections__card connections__card--${meta.tone}`}
            >
              <span className="connections__tag">{meta.label}</span>
              <h5 className="connections__heading">{c.title}</h5>
              <p className="connections__desc">{c.desc}</p>
            </article>
          )
        })}
        <button
          type="button"
          className="connections__add"
          onClick={onAdd}
        >
          <PlusOutlined className="connections__add-icon" />
          <span className="connections__add-label">添加新关联</span>
        </button>
      </div>
    </section>
  )
}
