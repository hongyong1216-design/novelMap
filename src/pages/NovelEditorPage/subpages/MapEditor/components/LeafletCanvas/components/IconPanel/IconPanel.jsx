import { useState } from 'react'
import { Segmented } from 'antd'
import { MAP_ICON_CATEGORIES } from '../../data/mapIcons'
import { zoomTierName } from '../../utils/visibilityPresets'
import IconVisual from '../IconVisual/IconVisual'
import '../IconVisual/IconVisual.css'
import './IconPanel.css'

// 拖拽落点用的自定义 MIME: 只认自己发出的拖拽, 避免把外部文件/文字误当图标
export const ICON_DND_TYPE = 'application/x-novelmap-icon'

// 地图图标栏: 从编辑工具栏展开, 图标可直接拖到地图上, 也可点选后再点地图落点
// placeable=false (放大到城市 / 街道层) 时仍可浏览和选中, 但落点会被画布拦下
export default function IconPanel({ selectedId, onSelect, placeable = true, currentZoom = 0 }) {
  const [categoryId, setCategoryId] = useState(MAP_ICON_CATEGORIES[0].id)

  const category =
    MAP_ICON_CATEGORIES.find((c) => c.id === categoryId) || MAP_ICON_CATEGORIES[0]

  const handleDragStart = (e, iconId) => {
    e.dataTransfer.setData(ICON_DND_TYPE, iconId)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="icon-panel">
      <Segmented
        block
        size="small"
        value={categoryId}
        onChange={setCategoryId}
        options={MAP_ICON_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
      />

      <div className="icon-panel__grid">
        {category.icons.map((it) => (
          <button
            key={it.id}
            type="button"
            draggable
            title={it.src ? `${it.label} (拖到地图, 或点击后再点地图)` : `${it.label} (待补图)`}
            className={
              'icon-panel__item' +
              (selectedId === it.id ? ' icon-panel__item--selected' : '')
            }
            onDragStart={(e) => handleDragStart(e, it.id)}
            onClick={() => onSelect(selectedId === it.id ? null : it.id)}
          >
            <span className="icon-panel__thumb">
              <IconVisual icon={{ ...it, kind: 'image' }} size={42} />
            </span>
            <span className="icon-panel__name">{it.label}</span>
          </button>
        ))}
      </div>

      <div className="icon-panel__hint">
        {placeable ? (
          '拖到地图即可放置, 或点选图标后再点地图。虚线框表示图片待补充。'
        ) : (
          <span className="icon-panel__hint--warn">
            当前是「{zoomTierName(currentZoom)}」层, 图标只能放到大陆 / 国家层, 请先缩小地图;
            城市 / 街道级的地点请改用「标记」。
          </span>
        )}
      </div>
    </div>
  )
}
