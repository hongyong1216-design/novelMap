import { jitterPoints } from './path'

// 用 Canvas 原生 API 绘制带纹理的笔触，保证纹理沿路径连贯
export function drawTexturedStroke(ctx, pts, texImg, size, irregular = false, seed = 0) {
  if (pts.length < 4) return

  const drawPts = irregular ? jitterPoints(pts, seed) : pts

  const pattern = ctx.createPattern(texImg, 'repeat')
  if (!pattern) return

  const s = size / 80
  if (pattern.setTransform) {
    pattern.setTransform(new DOMMatrix().scaleSelf(s, s))
  }

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(drawPts[0], drawPts[1])

  if (irregular) {
    for (let i = 2; i < drawPts.length - 1; i += 2) {
      ctx.lineTo(drawPts[i], drawPts[i + 1])
    }
    ctx.lineWidth = size * 0.85
    ctx.strokeStyle = pattern
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = 0.85
    ctx.stroke()
    ctx.globalAlpha = 0.4
    ctx.lineWidth = size * 0.5
    ctx.stroke()
  } else {
    if (drawPts.length === 4) {
      ctx.lineTo(drawPts[2], drawPts[3])
    } else {
      for (let i = 2; i < drawPts.length - 2; i += 2) {
        const xc = (drawPts[i] + drawPts[i + 2]) / 2
        const yc = (drawPts[i + 1] + drawPts[i + 3]) / 2
        ctx.quadraticCurveTo(drawPts[i], drawPts[i + 1], xc, yc)
      }
      ctx.lineTo(drawPts[drawPts.length - 2], drawPts[drawPts.length - 1])
    }
    ctx.strokeStyle = pattern
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = 0.9
    ctx.stroke()
  }

  ctx.restore()
}
