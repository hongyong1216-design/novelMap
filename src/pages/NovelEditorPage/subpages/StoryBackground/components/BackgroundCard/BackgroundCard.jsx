import { EditOutlined } from '@ant-design/icons'
import { CATEGORY_MAP } from '../../data/backgroundCards'
import './BackgroundCard.css'

// 单张背景卡片：分类标签 + 标题 + 内容缩略，点击进入编辑
export default function BackgroundCard({ card, onClick }) {
  const cat = CATEGORY_MAP[card.category]

  return (
    <button
      type="button"
      className="bg-card"
      style={{ '--cat-color': cat?.color }}
      onClick={() => onClick?.(card)}
    >
      <div className="bg-card__head">
        <span className="bg-card__tag">{cat?.code}</span>
        <span className="bg-card__edit" aria-hidden>
          <EditOutlined />
        </span>
      </div>
      <h3 className="bg-card__title">{card.title || '未命名'}</h3>
      <p className="bg-card__excerpt">{card.content || '暂无内容…'}</p>
      <div className="bg-card__foot">
        <span className="bg-card__cat-label">{cat?.label}</span>
      </div>
    </button>
  )
}
