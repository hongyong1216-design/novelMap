// 标记图标库: 按分组组织
// 每个 item:
//   { id, kind: 'dot' | 'emoji', label, group }
//   dot:   color (CSS 颜色)
//   emoji: char (单个或多个 unicode 字符)

export const ICON_GROUPS = [
  {
    group: '色点',
    items: [
      { id: 'dot-purple', kind: 'dot', color: '#6c5ce7', label: '紫' },
      { id: 'dot-light',  kind: 'dot', color: '#a29bfe', label: '淡紫' },
      { id: 'dot-orange', kind: 'dot', color: '#e8b25a', label: '橙' },
      { id: 'dot-red',    kind: 'dot', color: '#e74c3c', label: '红' },
      { id: 'dot-green',  kind: 'dot', color: '#5fdb89', label: '绿' },
      { id: 'dot-blue',   kind: 'dot', color: '#5dade2', label: '蓝' },
    ],
  },
  {
    group: '建筑',
    items: [
      { id: 'castle',  kind: 'emoji', char: '🏰', label: '城堡' },
      { id: 'tower',   kind: 'emoji', char: '🗼', label: '塔' },
      { id: 'church',  kind: 'emoji', char: '⛪', label: '教堂' },
      { id: 'shrine',  kind: 'emoji', char: '⛩️', label: '神社' },
      { id: 'temple',  kind: 'emoji', char: '🏛️', label: '神庙' },
      { id: 'house',   kind: 'emoji', char: '🏠', label: '民宅' },
      { id: 'cottage', kind: 'emoji', char: '🛖', label: '茅屋' },
      { id: 'tent',    kind: 'emoji', char: '⛺', label: '营帐' },
    ],
  },
  {
    group: '生活',
    items: [
      { id: 'tavern', kind: 'emoji', char: '🍺', label: '酒馆' },
      { id: 'forge',  kind: 'emoji', char: '⚒️', label: '铁匠铺' },
      { id: 'market', kind: 'emoji', char: '🛍️', label: '集市' },
      { id: 'farm',   kind: 'emoji', char: '🌾', label: '农场' },
      { id: 'book',   kind: 'emoji', char: '📖', label: '图书馆' },
      { id: 'music',  kind: 'emoji', char: '🎵', label: '歌剧院' },
    ],
  },
  {
    group: '军事',
    items: [
      { id: 'sword',  kind: 'emoji', char: '⚔️', label: '战场' },
      { id: 'shield', kind: 'emoji', char: '🛡️', label: '守备' },
      { id: 'archer', kind: 'emoji', char: '🏹', label: '弓兵营' },
      { id: 'flag',   kind: 'emoji', char: '🚩', label: '据点' },
      { id: 'horse',  kind: 'emoji', char: '🐎', label: '骑兵营' },
    ],
  },
  {
    group: '地形',
    items: [
      { id: 'mountain', kind: 'emoji', char: '⛰️', label: '山' },
      { id: 'volcano',  kind: 'emoji', char: '🌋', label: '火山' },
      { id: 'tree',     kind: 'emoji', char: '🌲', label: '森林' },
      { id: 'wave',     kind: 'emoji', char: '🌊', label: '水域' },
      { id: 'island',   kind: 'emoji', char: '🏝️', label: '岛屿' },
      { id: 'bridge',   kind: 'emoji', char: '🌉', label: '桥' },
      { id: 'cave',     kind: 'emoji', char: '🕳️', label: '洞穴' },
      { id: 'anchor',   kind: 'emoji', char: '⚓', label: '港口' },
    ],
  },
  {
    group: '宝藏 / 危险',
    items: [
      { id: 'gem',     kind: 'emoji', char: '💎', label: '宝藏' },
      { id: 'coin',    kind: 'emoji', char: '🪙', label: '金币' },
      { id: 'scroll',  kind: 'emoji', char: '📜', label: '卷轴' },
      { id: 'skull',   kind: 'emoji', char: '☠️', label: '危险' },
      { id: 'warning', kind: 'emoji', char: '⚠️', label: '警告' },
      { id: 'fire',    kind: 'emoji', char: '🔥', label: '火灾' },
      { id: 'dragon',  kind: 'emoji', char: '🐉', label: '巨龙' },
    ],
  },
  {
    group: '其他',
    items: [
      { id: 'star',    kind: 'emoji', char: '⭐', label: '重要' },
      { id: 'crown',   kind: 'emoji', char: '👑', label: '王权' },
      { id: 'compass', kind: 'emoji', char: '🧭', label: '路标' },
      { id: 'pin',     kind: 'emoji', char: '📍', label: '标记点' },
    ],
  },
]

// 扁平索引: id → item
export const ICON_INDEX = (() => {
  const map = {}
  ICON_GROUPS.forEach((g) => g.items.forEach((it) => { map[it.id] = it }))
  return map
})()

export const DEFAULT_ICON_ID = 'dot-purple'

// 旧 type 字段向新 iconId 的映射 (向前兼容)
const LEGACY_TYPE_TO_ICON = {
  city:     'dot-purple',
  building: 'dot-light',
  landmark: 'dot-orange',
}

// 解析 marker 的视觉描述
// 优先级: marker.iconId → 旧 marker.type 推断 → 默认色点
export const resolveIcon = (marker) => {
  const tryId = marker?.iconId || LEGACY_TYPE_TO_ICON[marker?.type]
  return ICON_INDEX[tryId] || ICON_INDEX[DEFAULT_ICON_ID]
}
