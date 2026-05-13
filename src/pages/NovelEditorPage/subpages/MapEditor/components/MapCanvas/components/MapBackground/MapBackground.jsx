import { Group, Rect, Line } from 'react-konva'
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../data/world'

export default function MapBackground() {
  const cols = Math.floor(STAGE_WIDTH / 60) + 1
  const rows = Math.floor(STAGE_HEIGHT / 60) + 1
  return (
    <Group listening={false}>
      <Rect x={-5000} y={-5000} width={12000} height={12000} fill="#0f1218" />
      <Rect x={0} y={0} width={STAGE_WIDTH} height={STAGE_HEIGHT} fill="#0f1218" />
      <Group opacity={0.18}>
        {Array.from({ length: rows }, (_, i) => (
          <Line key={`h${i}`} points={[0, i * 60, STAGE_WIDTH, i * 60]} stroke="#ffffff" strokeWidth={0.5} />
        ))}
        {Array.from({ length: cols }, (_, i) => (
          <Line key={`v${i}`} points={[i * 60, 0, i * 60, STAGE_HEIGHT]} stroke="#ffffff" strokeWidth={0.5} />
        ))}
      </Group>
    </Group>
  )
}
