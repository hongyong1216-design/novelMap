import { Group, Rect, Line } from 'react-konva'
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../data/world'

export default function MapBackground() {
  const cols = Math.floor(STAGE_WIDTH / 60) + 1
  const rows = Math.floor(STAGE_HEIGHT / 60) + 1
  return (
    <Group listening={false}>
      <Rect x={-5000} y={-5000} width={12000} height={12000} fill="#0d2a3a" />
      <Rect
        x={0}
        y={0}
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: STAGE_HEIGHT }}
        fillLinearGradientColorStops={[0, '#1a4a6a', 1, '#0d2a3a']}
      />
      <Group opacity={0.08}>
        {Array.from({ length: rows }, (_, i) => (
          <Line key={`h${i}`} points={[0, i * 60, STAGE_WIDTH, i * 60]} stroke="#fff" strokeWidth={0.5} />
        ))}
        {Array.from({ length: cols }, (_, i) => (
          <Line key={`v${i}`} points={[i * 60, 0, i * 60, STAGE_HEIGHT]} stroke="#fff" strokeWidth={0.5} />
        ))}
      </Group>
    </Group>
  )
}
