import { ANCHOR_SIDES } from '../data/storyline'

/** 卡片没量到尺寸时的兜底值，与 StoryNode.css 的宽度保持一致 */
export const NODE_W = 192
export const NODE_H = 150

/** 连接点在画布坐标系里的位置 */
export function anchorPoint(node, side, size) {
  const w = size?.w ?? NODE_W
  const h = size?.h ?? NODE_H
  switch (side) {
    case 'top':
      return { x: node.x + w / 2, y: node.y }
    case 'bottom':
      return { x: node.x + w / 2, y: node.y + h }
    case 'left':
      return { x: node.x, y: node.y + h / 2 }
    case 'right':
    default:
      return { x: node.x + w, y: node.y + h / 2 }
  }
}

/** 让曲线从连接点垂直伸出去一小段，避免贴着卡片拐死角 */
function control(p, side, d) {
  switch (side) {
    case 'top':
      return { x: p.x, y: p.y - d }
    case 'bottom':
      return { x: p.x, y: p.y + d }
    case 'left':
      return { x: p.x - d, y: p.y }
    case 'right':
    default:
      return { x: p.x + d, y: p.y }
  }
}

/** 两个连接点之间的三次贝塞尔路径 */
export function edgePath(a, aSide, b, bSide) {
  const dist = Math.hypot(b.x - a.x, b.y - a.y)
  const d = Math.min(160, Math.max(40, dist * 0.4))
  const c1 = control(a, aSide, d)
  const c2 = control(b, bSide, d)
  return `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`
}

export { ANCHOR_SIDES }
