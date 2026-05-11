import { useEffect, useRef } from 'react'
import { Layer, Line, Shape } from 'react-konva'
import { brushImages, colorBrushes } from '../../data/brushes'
import { drawTexturedStroke } from '../../utils/textureStroke'

/**
 * 笔刷绘制层：
 * - 已提交的 strokes 列表 + 正在绘制的预览。
 * - 纹理笔刷用 Canvas 原生 pattern 绘制；纯色笔刷用 Konva Line。
 */
export default function BrushStrokes({
  strokes,
  activeBrush,
  brushSize,
  brushMode,
  currentPoints,
  isPainting,
}) {
  const textureRefs = useRef({})

  useEffect(() => {
    Object.entries(brushImages).forEach(([id, src]) => {
      const img = new window.Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => { textureRefs.current[id] = img }
      img.src = src
    })
  }, [])

  const renderStroke = (stroke) => {
    const isTex = brushImages[stroke.brushId] !== undefined
    const cb = colorBrushes.find((b) => b.id === stroke.brushId)
    const texImg = textureRefs.current[stroke.brushId]

    if (isTex && texImg) {
      const isIrreg = stroke.brushMode === 'irregular'
      const seed = Number.parseInt(stroke.id.split('_')[1] || '0', 10)
      return (
        <Shape
          key={stroke.id}
          sceneFunc={(context) => {
            drawTexturedStroke(context._context, stroke.points, texImg, stroke.brushSize, isIrreg, seed)
          }}
        />
      )
    }
    return (
      <Line
        key={stroke.id}
        points={stroke.points}
        stroke={cb?.color || '#888'}
        strokeWidth={stroke.brushSize}
        lineCap="round"
        lineJoin="round"
        tension={stroke.brushMode === 'irregular' ? 0 : 0.3}
        opacity={0.85}
      />
    )
  }

  const renderPreview = () => {
    if (!isPainting.current || currentPoints.current.length < 2) return null
    const isTex = brushImages[activeBrush] !== undefined
    const cb = colorBrushes.find((b) => b.id === activeBrush)
    const texImg = textureRefs.current[activeBrush]
    if (isTex && texImg) {
      return (
        <Shape
          key="preview"
          sceneFunc={(context) => {
            drawTexturedStroke(
              context._context,
              currentPoints.current,
              texImg,
              brushSize,
              brushMode === 'irregular',
              Date.now(),
            )
          }}
        />
      )
    }
    return (
      <Line
        key="preview"
        points={currentPoints.current}
        stroke={cb?.color || '#4a8c3f'}
        strokeWidth={brushSize}
        lineCap="round"
        lineJoin="round"
        tension={brushMode === 'irregular' ? 0 : 0.3}
        opacity={0.85}
      />
    )
  }

  return (
    <Layer listening={false}>
      {strokes.map(renderStroke)}
      {renderPreview()}
    </Layer>
  )
}
