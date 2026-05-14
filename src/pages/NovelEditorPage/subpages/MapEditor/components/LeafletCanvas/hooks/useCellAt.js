import { WORLD, worldCoordToCell, cellId } from '../utils/grid'

export default function useCellAt(level, worldX, worldY) {
  const { x, y } = worldCoordToCell(level, worldX, worldY)
  const gs = WORLD.levels[level].gridSize
  if (x < 0 || y < 0 || x >= gs || y >= gs) return null
  return cellId(level, x, y)
}
