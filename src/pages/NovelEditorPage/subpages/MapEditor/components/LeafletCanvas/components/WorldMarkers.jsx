import { Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { EditOutlined, ExpandAltOutlined } from '@ant-design/icons'
import useMapZoom from '../hooks/useMapZoom'
import { isVisibleAtZoom } from '../utils/visibilityPresets'
import { resolveIcon } from '../utils/iconLibrary'

const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const buildIcon = (m, hasSubMap) => {
  const visual = resolveIcon(m)
  const name = escapeHtml(m.name)
  let inner
  let anchorY
  // 图片图标比 emoji / 色点占地大, 点击热区(iconSize)要跟着放大才盖得住图 + 名称
  let iconSize = [120, 48]
  // popupAnchor 让"编辑 / 展开"小菜单从图标上方弹出, 不遮住图标本身
  let popupAnchor = [0, -14]
  if (visual.kind === 'image') {
    // 图片未补充时先渲染占位框, 地标不至于凭空消失
    inner = visual.src
      ? `<img class="novelmap-marker__image" src="${escapeHtml(visual.src)}" alt="${escapeHtml(visual.label || '')}" draggable="false" />`
      : `<div class="novelmap-marker__image novelmap-marker__image--pending">${escapeHtml(visual.label?.[0] || '?')}</div>`
    anchorY = 24 // 图高 48px 的一半 → 图心对准坐标点
    iconSize = [120, 76]
    popupAnchor = [0, -28]
  } else if (visual.kind === 'emoji') {
    inner = `<div class="novelmap-marker__emoji">${visual.char}</div>`
    anchorY = 14
    popupAnchor = [0, -18]
  } else {
    const color = visual.color || '#6c5ce7'
    inner = `<div class="novelmap-marker__dot" style="background:${color};box-shadow:0 0 12px ${color}"></div>`
    anchorY = 8
  }
  // 已经建过子地图的图标挂个角标, 不用点开就知道里面有内容
  const badge = hasSubMap ? '<span class="novelmap-marker__submap-badge" title="已有子地图"></span>' : ''
  return L.divIcon({
    className: 'novelmap-marker',
    html: `<div class="novelmap-marker__visual">${inner}${badge}</div><div class="novelmap-marker__label">${name}</div>`,
    iconSize,
    iconAnchor: [60, anchorY],
    popupAnchor,
  })
}

// 点图标弹出的两项菜单。选完就关掉浮层, 免得挡住接下来要看的地方
function MarkerMenu({ marker, onEdit, onExpand }) {
  const map = useMap()
  const pick = (fn) => () => {
    map.closePopup()
    fn(marker)
  }
  return (
    <div className="novelmap-marker-menu__body">
      <div className="novelmap-marker-menu__title">{marker.name}</div>
      <button type="button" className="novelmap-marker-menu__item" onClick={pick(onEdit)}>
        <EditOutlined />
        <span>编辑标记</span>
      </button>
      <button type="button" className="novelmap-marker-menu__item" onClick={pick(onExpand)}>
        <ExpandAltOutlined />
        <span>展开地图</span>
      </button>
    </div>
  )
}

export default function WorldMarkers({
  markers,
  onMarkerEdit,
  onMarkerExpand,
  subMapIds,
  interactive = true,
}) {
  const zoom = useMapZoom()
  // 两个动作都给齐才挂菜单; 放置模式下 interactive=false, 点击让给"落点"
  const canMenu = interactive && Boolean(onMarkerEdit && onMarkerExpand)
  // 子地图里不再往下套一层, 点标记直接进编辑表单
  const directEdit = interactive && Boolean(onMarkerEdit) && !canMenu
  return markers
    .filter((m) => isVisibleAtZoom(m, zoom))
    .map((m) => {
      const hasSubMap = Boolean(subMapIds?.has(m.id))
      return (
        <Marker
          key={m.id}
          position={m.coord}
          icon={buildIcon(m, hasSubMap)}
          interactive={interactive}
          eventHandlers={directEdit ? { click: () => onMarkerEdit(m) } : {}}
        >
          {canMenu && (
            <Popup className="novelmap-marker-menu" closeButton={false} minWidth={132}>
              <MarkerMenu marker={m} onEdit={onMarkerEdit} onExpand={onMarkerExpand} />
            </Popup>
          )}
        </Marker>
      )
    })
}
