import { useState } from 'react'
import { Group, Line, Text } from 'react-konva'
import { mapRegions } from '../../data/world'
import { parsePath } from '../../utils/path'

const REGION_FILL = {
  grad1: '#4a8c3f',
  grad2: '#5a9a4a',
}

export default function MapRegions({
  selectedRegion,
  onSelectRegion,
  brushActive = false,
}) {
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <Group>
      {mapRegions.filter((r) => r.path).map((region) => {
        const points = parsePath(region.path)
        if (points.length < 2) return null
        const isSelected = selectedRegion === region.id
        const isHovered = hoveredId === region.id
        const flat = points.flatMap((p) => p)
        return (
          <Group key={region.id}>
            <Line
              points={flat}
              closed
              fill={isSelected ? '#6aaa4f' : REGION_FILL[region.fillType] || '#4a8c3f'}
              opacity={isHovered ? 0.9 : 0.85}
              onClick={() => !brushActive && onSelectRegion?.(region.id)}
              onMouseEnter={() => setHoveredId(region.id)}
              onMouseLeave={() => setHoveredId(null)}
            />
            <Line
              points={flat}
              closed
              fill="transparent"
              stroke={isSelected ? '#ff4444' : '#2a5a1a'}
              strokeWidth={isSelected ? 3 : 2}
              dash={isSelected ? [10, 5] : undefined}
              listening={false}
            />
            {region.center && (
              <Text
                x={region.center[0] - 30}
                y={region.center[1] - 15}
                text={region.name}
                fontSize={region.id === 'ironcrags' ? 18 : 22}
                fontFamily="sans-serif"
                fontStyle="bold"
                fill={isSelected ? '#ffd700' : '#2a5a1a'}
                listening={false}
              />
            )}
          </Group>
        )
      })}
    </Group>
  )
}
