import { ICON_GROUPS } from '../../utils/iconLibrary'
import IconVisual from '../IconVisual/IconVisual'
import '../IconVisual/IconVisual.css'
import './IconPicker.css'

// allowImageIcons=false: 当前层级不许新建图片图标 (只能加在大陆 / 国家层),
// 图片组整组隐藏, 色点 / emoji 不受影响
export default function IconPicker({ value, onChange, allowImageIcons = true }) {
  const groups = allowImageIcons
    ? ICON_GROUPS
    : ICON_GROUPS.filter((g) => !g.image)

  return (
    <div className="icon-picker">
      {!allowImageIcons && (
        <div className="icon-picker__notice">
          图片图标只能加在大陆 / 国家层, 缩小地图后可选
        </div>
      )}
      {groups.map((g) => (
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
