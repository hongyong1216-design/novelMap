/**
 * 山峰瓦片配置
 * 源图: src/assets/source/mountains.png (4x4 网格)
 * 由 process-tileset-v3.js 生成后手动整理路径
 */

const TILE_WIDTH = 256
const TILE_HEIGHT = 256
const GRID_COLS = 4
const GRID_ROWS = 4

const mountainImages = {
  '0_0': '/src/assets/mountains/mountain_0_0.png',
  '0_1': '/src/assets/mountains/mountain_0_1.png',
  '0_2': '/src/assets/mountains/mountain_0_2.png',
  '0_3': '/src/assets/mountains/mountain_0_3.png',
  '1_0': '/src/assets/mountains/mountain_1_0.png',
  '1_1': '/src/assets/mountains/mountain_1_1.png',
  '1_2': '/src/assets/mountains/mountain_1_2.png',
  '1_3': '/src/assets/mountains/mountain_1_3.png',
  '2_0': '/src/assets/mountains/mountain_2_0.png',
  '2_1': '/src/assets/mountains/mountain_2_1.png',
  '2_2': '/src/assets/mountains/mountain_2_2.png',
  '2_3': '/src/assets/mountains/mountain_2_3.png',
  '3_0': '/src/assets/mountains/mountain_3_0.png',
  '3_1': '/src/assets/mountains/mountain_3_1.png',
  '3_2': '/src/assets/mountains/mountain_3_2.png',
  '3_3': '/src/assets/mountains/mountain_3_3.png'
}

export const mountainSpriteDefinition = Object.entries(mountainImages).map(([key, src]) => ({
  key: `mountain_${key}`,
  imagesSrc: [src],
}))

export { TILE_WIDTH, TILE_HEIGHT, GRID_COLS, GRID_ROWS, mountainImages }
