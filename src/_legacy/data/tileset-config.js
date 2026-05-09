/**
 * Tileset 配置文件
 * 由 process-tileset-v3.js 自动生成
 * 生成时间: 2026/4/14 13:55:18
 */

const TILE_WIDTH = 128
const TILE_HEIGHT = 128
const GRID_COLS = 5
const GRID_ROWS = 4

// Tile 图片路径映射
const tileImages = {
  '0_0': '/src/assets/tileset/tile_0_0.png',
  '0_1': '/src/assets/tileset/tile_0_1.png',
  '0_2': '/src/assets/tileset/tile_0_2.png',
  '0_3': '/src/assets/tileset/tile_0_3.png',
  '0_4': '/src/assets/tileset/tile_0_4.png',
  '1_0': '/src/assets/tileset/tile_1_0.png',
  '1_1': '/src/assets/tileset/tile_1_1.png',
  '1_2': '/src/assets/tileset/tile_1_2.png',
  '1_3': '/src/assets/tileset/tile_1_3.png',
  '1_4': '/src/assets/tileset/tile_1_4.png',
  '2_0': '/src/assets/tileset/tile_2_0.png',
  '2_1': '/src/assets/tileset/tile_2_1.png',
  '2_2': '/src/assets/tileset/tile_2_2.png',
  '2_3': '/src/assets/tileset/tile_2_3.png',
  '2_4': '/src/assets/tileset/tile_2_4.png',
  '3_0': '/src/assets/tileset/tile_3_0.png',
  '3_1': '/src/assets/tileset/tile_3_1.png',
  '3_2': '/src/assets/tileset/tile_3_2.png',
  '3_3': '/src/assets/tileset/tile_3_3.png',
  '3_4': '/src/assets/tileset/tile_3_4.png'
}

// 导出 spriteDefinition 格式（供 react-super-tilemap 使用）
export const spriteDefinition = Object.entries(tileImages).map(([key, src]) => ({
  key: `tile_${key}`,
  imagesSrc: [src],
}))

export { TILE_WIDTH, TILE_HEIGHT, GRID_COLS, GRID_ROWS, tileImages }
