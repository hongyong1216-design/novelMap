import { useState } from 'react'
import { EditOutlined, PictureOutlined } from '@ant-design/icons'
import { CATEGORY_MAP, RARITY_MAP } from '../../data/items'
import './ItemCard.css'

// 单张物品卡片：方形图片 + 稀有度角标 + 代号 + 类型 + 描述，点击进入查看/编辑
export default function ItemCard({ item, onClick }) {
  const cat = CATEGORY_MAP[item.category]
  const rarity = RARITY_MAP[item.rarity]
  const [imgError, setImgError] = useState(false)
  const showImg = item.image && !imgError

  return (
    <button
      type="button"
      className="item-card"
      style={{ '--cat-color': cat?.color }}
      onClick={() => onClick?.(item)}
    >
      <div className="item-card__media">
        {showImg ? (
          <img
            className="item-card__img"
            src={item.image}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="item-card__placeholder">
            <PictureOutlined />
          </div>
        )}

        {/* common 视为无标签，不渲染角标 */}
        {rarity && rarity.key !== 'common' && (
          <span
            className="item-card__rarity"
            style={{ '--rarity-color': rarity.color }}
          >
            {rarity.label}
          </span>
        )}

        <span className="item-card__edit" aria-hidden>
          <EditOutlined />
        </span>
      </div>

      <div className="item-card__body">
        <h3 className="item-card__name">{item.name || '未命名'}</h3>
        <p className="item-card__type">
          {cat?.label}
          {item.type ? ` / ${item.type}` : ''}
        </p>
        <p className="item-card__desc">{item.desc || '暂无描述…'}</p>
      </div>
    </button>
  )
}
