import { Group, Text } from 'react-konva'
import { oceanLabels } from '../../data/world'

export default function MapLabels() {
  return (
    <Group listening={false}>
      {oceanLabels.map((label, i) => (
        <Text
          key={`ocean-${i}`}
          x={label.x}
          y={label.y}
          text={label.text}
          fontSize={label.fontSize}
          fontStyle="italic"
          fill={label.color}
          opacity={label.opacity}
          fontFamily="sans-serif"
        />
      ))}
    </Group>
  )
}
