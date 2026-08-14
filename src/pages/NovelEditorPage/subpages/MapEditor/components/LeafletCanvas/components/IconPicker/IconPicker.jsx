import { ICON_GROUPS } from '../../utils/iconLibrary'
import IconVisual from '../IconVisual/IconVisual'
import '../IconVisual/IconVisual.css'
import './IconPicker.css'

export default function IconPicker({ value, onChange }) {
  return (
    <div className="icon-picker">
      {ICON_GROUPS.map((g) => (
        <div key={g.id} className="icon-picker__group">
          <div className="icon-picker__group-label">{g.group}</div>
          <div className="icon-picker__grid">
            {g.items.map((it) => (
              <button
                key={it.id}
                type="button"
                title={it.label}
                className={
                  'icon-picker__item' +
                  (value === it.id ? ' icon-picker__item--selected' : '')
                }
                onClick={() => onChange(it.id)}
              >
                <IconVisual icon={it} size={28} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
