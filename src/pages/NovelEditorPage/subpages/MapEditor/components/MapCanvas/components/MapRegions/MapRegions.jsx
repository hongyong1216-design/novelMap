import { useState } from 'react'
import { Group, Line, Text } from 'react-konva'
import {
  mapRegions, mapDesert, mapGlacier,
  mapNorthIce1, mapNorthIce2, mapSouthIce,
} from '../../data/world'
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

      {/* 沙漠 */}
      <Line
        points={parsePath(mapDesert).flatMap((p) => p)}
        closed
        fill="#c4a44a"
        stroke="#aa8a3a"
        strokeWidth={1}
        opacity={0.8}
        listening={false}
      />
      <Text
        x={620}
        y={545}
        text="大荒漠"
        fontSize={14}
        fill="#8a6a2a"
        fontFamily="sans-serif"
        listening={false}
      />

      {/* 冰川 */}
      <Line
        points={parsePath(mapGlacier).flatMap((p) => p)}
        closed
        fill="#d8dde0"
        stroke="#8a9aa0"
        strokeWidth={1}
        opacity={0.8}
        listening={false}
      />

      {/* 南北冰原 */}
      <Line points={parsePath(mapNorthIce1).flatMap((p) => p)} closed fill="#b8c8d0" stroke="#8a9aa0" strokeWidth={1} opacity={0.6} listening={false} />
      <Line points={parsePath(mapNorthIce2).flatMap((p) => p)} closed fill="#b8c8d0" stroke="#8a9aa0" strokeWidth={1} opacity={0.6} listening={false} />
      <Line points={parsePath(mapSouthIce).flatMap((p) => p)} closed fill="#b8c8d0" stroke="#8a9aa0" strokeWidth={1} opacity={0.5} listening={false} />
      <Text x={900} y={1135} text="冻土荒原" fontSize={24} fontStyle="bold" fill="#6a7a8a" fontFamily="sans-serif" listening={false} />
    </Group>
  )
}
