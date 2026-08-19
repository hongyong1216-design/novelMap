// 子地图: 每个标记(图标)可以拥有一张属于自己的地图 —— 在世界地图上点图标 →「展开地图」打开。
//
// 几何完全复用主地图 (utils/grid.js): 同样的 L0-{x}-{y} 格命名、同样的 4096px 单格与
// 15% 重叠布局, 只是网格规模小得多 (默认 3×3)。每张子地图的 cells / markers / labels
// 各自独立, 数据挂在 world.subMaps[markerId] 下, 随主地图一起存 localStorage 和导出 JSON。
//
// 子地图里的对象一律不写 minZoom / maxZoom (即"始终可见"): 子地图的 zoom 会随窗口尺寸
// 自适应, 套用世界地图那套"大陆 / 国家 / 城市"分档没有意义。

export const DEFAULT_SUB_GRID_SIZE = 3
export const MIN_SUB_GRID_SIZE = 2
export const MAX_SUB_GRID_SIZE = 8

export const emptySubMap = () => ({
  gridSize: DEFAULT_SUB_GRID_SIZE,
  cells: {},
  markers: [],
  labels: [],
})

// 容错读取: 老数据 / 手改过的导入 JSON 可能缺字段, 统一补齐再用
export const normalizeSubMap = (sub) => ({
  gridSize: sub?.gridSize || DEFAULT_SUB_GRID_SIZE,
  cells: sub?.cells || {},
  markers: sub?.markers || [],
  labels: sub?.labels || [],
})

// 子地图内对象的 id: 与主地图用不同前缀, 导出的 JSON 里一眼看得出归属
export const subObjectId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

// 这张子地图是否已经有内容 (决定世界地图上的图标要不要挂角标)
export const subMapHasContent = (sub) =>
  Boolean(
    sub &&
      (Object.keys(sub.cells || {}).length > 0 ||
        (sub.markers || []).length > 0 ||
        (sub.labels || []).length > 0)
  )

// 已建了子地图的 marker id 集合, 供 WorldMarkers 挂角标
export const subMapIdSet = (subMaps) =>
  new Set(
    Object.entries(subMaps || {})
      .filter(([, sub]) => subMapHasContent(sub))
      .map(([id]) => id)
  )
