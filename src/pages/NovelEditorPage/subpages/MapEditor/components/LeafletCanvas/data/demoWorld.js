// ============================================================
// 测试用图片映射: 把图片放到 public/maps/ 后, 在下方写一行映射即可
// key  = cellId (L0-{x}-{y})
// val  = 相对项目根的图片 URL (Vite 把 public/* 暴露在根路径)
// 后缀任意 (png / jpg / jpeg / webp / svg / gif), 跟实际文件一致就行
// 修改后 Vite HMR 会自动刷新, 无需重启
//
// 网格规格 (见 utils/grid.js):
//   只有 L0 一层, 单格 4096 px (虚拟像素)
//   默认 8x8 (世界 32768x32768), 可在地图右上角工具栏调整格数
//   增加格数会扩展世界; 减少格数会丢弃超出范围的已填充格 (操作前会弹确认)
//
// 命名建议 / 图片配置详见: src/pages/NovelEditorPage/subpages/MapEditor/MAP_IMAGES.md
// ============================================================
const IMAGES = {
  'L0-0-3': '/maps/L0-0-3.png',
  'L0-1-3': '/maps/L0-1-3.png',
  'L0-1-4': '/maps/L0-1-4.png',
  'L0-2-3': '/maps/L0-2-3.png',
  'L0-3-2': '/maps/L0-3-2.png',
  'L0-3-3': '/maps/L0-3-3.png',
  'L0-3-4': '/maps/L0-3-4.png',
  'L0-4-3': '/maps/L0-4-3.png',
}

const cell = (id, props) => ({
  ...props,
  filled: true,
  ...(IMAGES[id] ? { src: IMAGES[id] } : {}),
})

export const demoWorld = {
  cells: Object.fromEntries(
    Object.keys(IMAGES).map((id) => [id, cell(id)])
  ),

  // 地图上的文本对象暂时清空, 后续再补
  markers: [],
  regions: [],
  routes: [],
  labels: [],
}
