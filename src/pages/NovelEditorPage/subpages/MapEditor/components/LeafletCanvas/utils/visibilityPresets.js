// 地图缩放级别上下限 (与 LeafletCanvas.jsx 的 minZoom / maxZoom 保持一致)
export const MIN_ZOOM = -4
export const MAX_ZOOM = 5

// 4 档可见性预设 + 自定义档(custom 由 UI 处理,不在此列表里)
// range = [minZoom, maxZoom]; ±Infinity 表示无下/上限
export const VISIBILITY_PRESETS = [
  {
    id: 'always',
    name: '始终显示',
    range: [-Infinity, Infinity],
    desc: '任何缩放级别都可见',
  },
  {
    id: 'overview',
    name: '仅总览级',
    range: [MIN_ZOOM, 1],
    desc: '缩小时可见,放近自动隐藏',
  },
  {
    id: 'city',
    name: '仅城市级',
    range: [-1, 3],
    desc: '中等缩放可见',
  },
  {
    id: 'street',
    name: '仅街道级',
    range: [3, MAX_ZOOM],
    desc: '深入街道才可见',
  },
]

// zoom → 语义层级名 (供 ZoomHUD 显示)
export const zoomTierName = (zoom) => {
  if (zoom < -1) return '大陆 / 总览'
  if (zoom < 2) return '国家 / 大区'
  if (zoom < 4) return '城市 / 街区'
  return '街道 / 建筑'
}

// 当前 zoom → 推荐预设 id (添加标签时智能预选)
export const recommendPresetForZoom = (zoom) => {
  if (zoom < 0) return 'overview'
  if (zoom < 3) return 'city'
  return 'street'
}

// 反向: (minZoom, maxZoom) → 预设 id;不匹配任何预设返回 'custom'
export const detectPreset = (minZoom, maxZoom) => {
  const min = minZoom ?? -Infinity
  const max = maxZoom ?? Infinity
  const found = VISIBILITY_PRESETS.find(
    (p) => p.range[0] === min && p.range[1] === max
  )
  return found ? found.id : 'custom'
}

// 预设 id → [minZoom, maxZoom]
export const rangeOfPreset = (id) => {
  const p = VISIBILITY_PRESETS.find((x) => x.id === id)
  return p ? p.range : [MIN_ZOOM, MAX_ZOOM]
}

// 统一可见性判断: 对象数据 + 当前 zoom → 是否应显示
export const isVisibleAtZoom = (obj, zoom) => {
  const min = obj.minZoom ?? -Infinity
  const max = obj.maxZoom ?? Infinity
  return zoom >= min && zoom <= max
}
