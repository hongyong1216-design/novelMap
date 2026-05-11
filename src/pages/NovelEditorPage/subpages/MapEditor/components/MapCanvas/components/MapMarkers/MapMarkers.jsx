import { Group, Line, Circle, Text } from 'react-konva'
import { mapMountains, mapRoutes, mapCities } from '../../data/world'
import { parsePath } from '../../utils/path'

export default function MapMarkers() {
  return (
    <Group listening={false}>
      {/* 山脉 */}
      {mapMountains.map((path, i) => (
        <Line
          key={`mtn${i}`}
          points={parsePath(path).flatMap((p) => p)}
          stroke="#5a4a2a"
          strokeWidth={2.5}
        />
      ))}

      {/* 航线 */}
      {mapRoutes.map((route) => (
        <Line
          key={route.id}
          points={route.points.flatMap((p) => p)}
          stroke={route.color}
          strokeWidth={1.5}
          dash={[8, 4]}
          opacity={route.opacity}
          tension={0.3}
        />
      ))}

      {/* 城市标记 */}
      {mapCities.map((city) => (
        <Group key={city.id}>
          <Circle
            x={city.x}
            y={city.y}
            radius={city.size}
            fill={city.color}
            stroke="#333"
            strokeWidth={city.size > 5 ? 2 : 1.5}
          />
          <Text
            x={city.x - 30}
            y={city.y + city.size + 10}
            text={city.name}
            fontSize={city.size > 5 ? 18 : 14}
            fontFamily="sans-serif"
            fill={city.color}
            align="center"
            width={60}
          />
        </Group>
      ))}
    </Group>
  )
}
