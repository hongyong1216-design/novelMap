import { Tilemap, ThirdPersonCamera, ManualElement } from 'react-super-tilemap'
import { spriteDefinition, TILE_WIDTH, TILE_HEIGHT, tileImages } from '../../../data/tileset-config'
import './TilemapCanvas.css'

// 生成一个简单的草地 tile 作为背景
function generateGrassTile() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#2d7a3a'
  ctx.fillRect(0, 0, 64, 64)
  return canvas.toDataURL()
}

const grassTile = generateGrassTile()

// 合并 spriteDefinition：添加草地背景 tile
const allSprites = [
  { key: 'grass', imagesSrc: [grassTile] },
  ...spriteDefinition
]

// 示例地图数据：20x15 网格，使用生成的树木 tiles
const mapData = {
  cols: 20,
  rows: 15,
  layers: [
    // 图层 0: 草地背景
    Array.from({ length: 15 }, () => Array(20).fill('grass')),
    // 图层 1: 装饰层（放置树木）
    Array.from({ length: 15 }, (_, row) =>
      Array.from({ length: 20 }, (_, col) => {
        // 在特定位置放置树木
        if (row === 2 && col === 3) return 'tile_0_0' // 第一行第一个树
        if (row === 5 && col === 7) return 'tile_0_1'
        if (row === 8 && col === 10) return 'tile_1_2'
        if (row === 4 && col === 15) return 'tile_2_0'
        if (row === 10 && col === 12) return 'tile_3_1'
        return '' // 空白
      })
    ),
  ],
}

export default function TilemapCanvas() {
  // 树木 tile 实际尺寸是 550x384，但我们需要用更小的 tileSize 显示
  // react-super-tilemap 会缩放显示
  const displayTileSize = 64

  return (
    <div className="tilemap-canvas">
      <Tilemap
        defaultTileSize={displayTileSize}
        tilmapScheme={mapData.layers.map(layer =>
          layer.map(row => row.map(tile => tile || undefined))
        )}
        spriteDefinition={allSprites}
        backgroundColor="#2d7a3a"
        onSpritesLoadError={(err) => console.error('Sprites load error:', err)}
        onTileClick={(tile) => console.log('Tile clicked:', tile)}
      >
        <ThirdPersonCamera />
      </Tilemap>
    </div>
  )
}
