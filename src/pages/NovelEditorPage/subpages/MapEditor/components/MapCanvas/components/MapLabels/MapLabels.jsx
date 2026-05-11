import { Group, Text } from 'react-konva'
import { oceanLabels, STAGE_WIDTH } from '../../data/world'

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

      <Text
        x={STAGE_WIDTH / 2 - 120}
        y={50}
        text="阿瑟加德大陆全图"
        fontSize={32}
        fontFamily="sans-serif"
        fontStyle="bold"
        fill="#d4c8a0"
      />
    </Group>
  )
}
