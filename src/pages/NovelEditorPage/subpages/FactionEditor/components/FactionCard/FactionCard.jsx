import { FACTION_STATUS } from '../../data/factions'
import './FactionCard.css'

export default function FactionCard({ faction, selected = false, onClick }) {
  const status = FACTION_STATUS[faction.status] || FACTION_STATUS.neutral
  const showMembers = faction.members?.length > 0
  const isHidden = faction.status === 'hidden'

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? 'faction-card faction-card--selected'
          : 'faction-card'
      }
    >
      <div className="faction-card__head">
        <span
          className={
            selected
              ? 'faction-card__id faction-card__id--active'
              : 'faction-card__id'
          }
        >
          ID: {faction.id}
        </span>
        <span className={`faction-card__badge faction-card__badge--${faction.status}`}>
          {status.label}
        </span>
      </div>

      <h3 className="faction-card__name">{faction.name}</h3>
      <p className="faction-card__desc">{faction.summary}</p>

      <div className="faction-card__foot">
        {showMembers ? (
          <div className="faction-card__members">
            {faction.members.map((m) => (
              <span key={m} className="faction-card__member">{m}</span>
            ))}
          </div>
        ) : (
          <span />
        )}
        <span className="faction-card__updated">
          {isHidden ? faction.updatedAt : `更新于 ${faction.updatedAt}`}
        </span>
      </div>
    </button>
  )
}
