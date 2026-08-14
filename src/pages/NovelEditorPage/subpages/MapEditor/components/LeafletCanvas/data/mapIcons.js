// 地图图片图标库 (工具栏「图标」工具的数据源)
//
// 与 utils/iconLibrary.js 里的 emoji / 色点不同, 这里是**图片图标**:
// 每项都有一张自己的 png / svg 图, 放大后依然清晰, 适合作为地图上的正式地标。
// 当前这批是 128×128 等距圆盘地块图, 表达的是"聚落 / 区域"级地标, 不是单体建筑。
//
// ── 怎么加新图标 ──────────────────────────────────────────────
// 1. 把图片放进 public/map-icons/ (建议 128×128 或 256×256 的透明底 PNG / SVG)
// 2. 回到本文件, 在对应分类的 icons 数组里追加一条
// 3. 页面自动生效, 无需改其他代码
//
// src 留空的条目不会被隐藏 —— 图标栏和地图上都会显示"待补图"占位框,
// 方便先把地标摆上去, 图片后面慢慢补。
//
// 条目结构: { id, label, src }
//   id    唯一标识, 会写进 marker.iconId 并随 JSON 导出, 定好后不要再改
//         (改了已放置的标记会找不到图标, 退回默认色点)
//   label 中文名, 显示在图标栏格子下方, 也是拖拽落点时标记的默认名称
//   src   图片路径, '' 表示待补充

export const MAP_ICON_CATEGORIES = [
  {
    id: 'building',
    name: '建筑',
    desc: '人造聚落与设施',
    icons: [
      { id: 'bld-classic-polis',  label: '古典城邦', src: '/map-icons/bld-classic-polis.png' },
      { id: 'bld-walled-palace',  label: '围城王宫', src: '/map-icons/bld-walled-palace.png' },
      { id: 'bld-ring-sanctum',   label: '环墙圣城', src: '/map-icons/bld-ring-sanctum.png' },
      { id: 'bld-desert-citadel', label: '沙漠城塞', src: '/map-icons/bld-desert-citadel.png' },
      { id: 'bld-adobe-town',     label: '土坯之城', src: '/map-icons/bld-adobe-town.png' },
      { id: 'bld-canyon-palace',  label: '峡谷金宫', src: '/map-icons/bld-canyon-palace.png' },
      { id: 'bld-step-pyramid',   label: '金字塔城', src: '/map-icons/bld-step-pyramid.png' },
      { id: 'bld-lake-pyramids',  label: '湖心金塔', src: '/map-icons/bld-lake-pyramids.png' },
      { id: 'bld-moat-temple',    label: '环水神庙', src: '/map-icons/bld-moat-temple.png' },
      { id: 'bld-cliff-shrine',   label: '崖间神殿', src: '/map-icons/bld-cliff-shrine.png' },
      { id: 'bld-crystal-spires', label: '晶塔之城', src: '/map-icons/bld-crystal-spires.png' },
      { id: 'bld-spiral-towers',  label: '螺旋海塔', src: '/map-icons/bld-spiral-towers.png' },
      { id: 'bld-obelisk-ruins',  label: '方尖遗迹', src: '/map-icons/bld-obelisk-ruins.png' },
    ],
  },
  {
    id: 'nature',
    name: '自然地标',
    desc: '山川水泽与天然奇观',
    icons: [
      { id: 'nat-volcano',      label: '火山',   src: '/map-icons/nat-volcano.png' },
      { id: 'nat-ice-crystals', label: '冰晶簇', src: '/map-icons/nat-ice-crystals.png' },
      { id: 'nat-glow-blooms',  label: '荧花丛', src: '/map-icons/nat-glow-blooms.png' },
    ],
  },
]

// 扁平列表 / 索引, 供 iconLibrary 合并与 id 反查
export const MAP_ICON_LIST = MAP_ICON_CATEGORIES.flatMap((c) =>
  c.icons.map((it) => ({ ...it, kind: 'image', category: c.id }))
)

export const MAP_ICON_INDEX = MAP_ICON_LIST.reduce((map, it) => {
  map[it.id] = it
  return map
}, {})
