import { FACTION_TONES } from '../../data/characters'
import './CharacterCard.css'

export default function CharacterCard({ character, tone = 'primary', onClick }) {
  const palette = FACTION_TONES[tone] || FACTION_TONES.primary
  const isDeceased = character.status === 'deceased'

  const cardClass = [
    'character-card',
    `character-card--${tone}`,
    isDeceased ? 'character-card--deceased' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article
      className={cardClass}
      onClick={onClick}
      style={{ '--card-tone-bar': palette.bar, '--card-tone-text': palette.text }}
    >
      <div className="character-card__media">
        <img
          src={character.image}
          alt={character.name}
          className="character-card__image"
          loading="lazy"
        />
        <div className="character-card__overlay" />
        {isDeceased && <div className="character-card__deceased-overlay" />}
      </div>

      <div className="character-card__body">
        {isDeceased ? (
          <>
            <div className="character-card__head">
              <h3 className="character-card__name character-card__name--muted">
                {character.name}
              </h3>
              <span className="character-card__status">
                {character.statusLabel || '已注销'}
              </span>
            </div>
            <p className="character-card__quote">{character.quote}</p>
          </>
        ) : (
          <>
            <div className="character-card__head">
              <div className="character-card__meta">
                <span className="character-card__serial">
                  序列号: #{character.id}
                </span>
                <h3 className="character-card__name">{character.name}</h3>
              </div>
              {character.role && (
                <span className="character-card__role">{character.role}</span>
              )}
            </div>
            <p className="character-card__desc">{character.desc}</p>
          </>
        )}
      </div>
    </article>
  )
}
