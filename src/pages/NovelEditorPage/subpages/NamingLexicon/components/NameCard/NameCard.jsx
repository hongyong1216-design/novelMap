import { HeartOutlined, HeartFilled, CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import './NameCard.css'

// 候选名 / 名册条目共用的卡片。整卡可点（送回铸名台），右上角是独立的小动作按钮
export default function NameCard({
  name,
  active,
  favored,
  onPick,
  onFavorite,
  onCopy,
  onRemove,
}) {
  const activate = () => onPick?.(name)

  return (
    <div
      className={`ncard${active ? ' is-active' : ''}`}
      role="button"
      tabIndex={0}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          activate()
        }
      }}
    >
      <div className="ncard__tools">
        {onFavorite && (
          <button
            type="button"
            className={`ncard__tool${favored ? ' is-on' : ''}`}
            title={favored ? '移出名册' : '存入名册'}
            onClick={(e) => {
              e.stopPropagation()
              onFavorite(name)
            }}
          >
            {favored ? <HeartFilled /> : <HeartOutlined />}
          </button>
        )}
        {onCopy && (
          <button
            type="button"
            className="ncard__tool"
            title="复制名字"
            onClick={(e) => {
              e.stopPropagation()
              onCopy(name)
            }}
          >
            <CopyOutlined />
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            className="ncard__tool"
            title="从名册移除"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(name)
            }}
          >
            <DeleteOutlined />
          </button>
        )}
      </div>

      <h4 className="ncard__text">{name.text}</h4>
      <p className="ncard__pinyin">{name.pinyin}</p>
      <p className="ncard__gloss">{name.gloss}</p>
      <span className="ncard__tag">{name.formulaLabel}</span>
    </div>
  )
}
