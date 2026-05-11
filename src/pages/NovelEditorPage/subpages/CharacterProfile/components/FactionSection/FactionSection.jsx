import CharacterCard from '../CharacterCard/CharacterCard'
import SystemEntityCard from '../SystemEntityCard/SystemEntityCard'
import { FACTION_TONES } from '../../data/characters'
import './FactionSection.css'

export default function FactionSection({ faction, characters, onSelect }) {
  if (!characters?.length) return null
  const palette = FACTION_TONES[faction.tone] || FACTION_TONES.primary

  return (
    <section
      className={`faction-section faction-section--${faction.tone}`}
      style={{ '--section-tone-bar': palette.bar, '--section-tone-text': palette.text }}
    >
      <header className="faction-section__head">
        <span className="faction-section__bar" />
        <h3 className="faction-section__title">{faction.name}</h3>
        {faction.subtitle && (
          <span className="faction-section__badge">{faction.subtitle}</span>
        )}
      </header>

      <div className="faction-section__grid">
        {characters.map((c) =>
          c.type === 'system' ? (
            <SystemEntityCard
              key={c.id}
              entity={c}
              onClick={() => onSelect?.(c)}
            />
          ) : (
            <CharacterCard
              key={c.id}
              character={c}
              tone={faction.tone}
              onClick={() => onSelect?.(c)}
            />
          ),
        )}
      </div>
    </section>
  )
}
