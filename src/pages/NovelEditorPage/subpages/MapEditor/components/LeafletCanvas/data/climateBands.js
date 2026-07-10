// 元墟·九气候带 (对齐 story-1「元墟」卡〔灵潮与气候〕九带谱)
// 纵轴 lat = 世界 y (顶=北 → 底=南); 北暖南寒, 中天温稳带居中。
//
// 各带高度以「格」为单位, 合计 = 32 → 默认 gridSize=32 时带界正好落在格线上 (按格子一致)。
// 导出的 from/to 为世界高度 0..1 比例 (cells/TOTAL), 随世界缩放贴合、随地图放大缩小。
//   · 朔垠 / 北炽带 / 南炽带 / 绝夜 各 1 格
//   · 中天温稳带 6 格居中 (13~19 格), 南北对称
// color 依设定语义: 炽带最热(红/橙)、温带宜居(绿)、永夜极寒(冷蓝→墨), 北暖故北带更暖。
const BAND_DEFS = [
  { id: 'shuoyin',     name: '朔垠',         cells: 1, color: '#6b7fb0' }, // 北极永夜·永恒黄昏+极光
  { id: 'beihanhuang', name: '北陲寒荒',     cells: 6, color: '#5b8fd6' }, // 朔曜余晖·苦寒
  { id: 'beiwen',      name: '北温带',       cells: 5, color: '#57b894' }, // 朔曜单照·温暖宜居
  { id: 'beichi',      name: '北炽带',       cells: 1, color: '#e0553b' }, // 太昭×朔曜·最热
  { id: 'zhongtian',   name: '中天温稳带',   cells: 6, color: '#d9a441' }, // 太昭独照·文明摇篮·居中
  { id: 'nanchi',      name: '南炽带',       cells: 1, color: '#e08a4a' }, // 太昭×邃曜·温润
  { id: 'nanwen',      name: '南温带',       cells: 5, color: '#4aa9a0' }, // 邃曜单照·偏凉·藏忆
  { id: 'nanyouhan',   name: '南陲幽寒荒原', cells: 6, color: '#4a6aa0' }, // 邃曜微光久隐·背光死域
  { id: 'juye',        name: '绝夜',         cells: 1, color: '#3a3f66' }, // 南极永夜·全星最冷最黑·忆焰
]

// 合计格数 (= 32); 带界 = 累积格数 / TOTAL, 保证正好压在格线上
const TOTAL = BAND_DEFS.reduce((sum, b) => sum + b.cells, 0)

let acc = 0
export const CLIMATE_BANDS = BAND_DEFS.map((b) => {
  const from = acc / TOTAL
  acc += b.cells
  return { id: b.id, name: b.name, color: b.color, cells: b.cells, from, to: acc / TOTAL }
})
