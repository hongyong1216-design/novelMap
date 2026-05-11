import { Group, Circle, Line, Rect, Text } from 'react-konva'

export default function MapOverlays() {
  return (
    <Group listening={false}>
      {/* 罗盘 */}
      <Group x={250} y={950}>
        <Circle radius={40} fill="rgba(0,0,0,0.3)" stroke="#c4a44a" strokeWidth={2} />
        <Line points={[0, -35, 0, 35]} stroke="#c4a44a" strokeWidth={1} />
        <Line points={[-35, 0, 35, 0]} stroke="#c4a44a" strokeWidth={1} />
        <Text x={-6}  y={-36} text="北" fontSize={14} fontStyle="bold" fill="#c4a44a" fontFamily="sans-serif" />
        <Text x={-6}  y={42}  text="南" fontSize={12} fill="#8a7a5a" fontFamily="sans-serif" />
        <Text x={-52} y={-4}  text="西" fontSize={12} fill="#8a7a5a" fontFamily="sans-serif" />
        <Text x={40}  y={-4}  text="东" fontSize={12} fill="#8a7a5a" fontFamily="sans-serif" />
      </Group>

      {/* 小地图 */}
      <Group x={1750} y={50}>
        <Rect width={200} height={120} cornerRadius={4} fill="rgba(0,0,0,0.5)" stroke="#555" strokeWidth={1} />
        <Rect x={30}  y={10} width={60}  height={30} cornerRadius={2} fill="#3a6a2a" opacity={0.6} />
        <Rect x={110} y={8}  width={50}  height={35} cornerRadius={2} fill="#4a7a3a" opacity={0.6} />
        <Rect x={40}  y={55} width={55}  height={30} cornerRadius={2} fill="#3a6a2a" opacity={0.6} />
        <Rect x={120} y={60} width={30}  height={20} cornerRadius={2} fill="#3a6a2a" opacity={0.6} />
        <Rect x={20}  y={95} width={160} height={15} cornerRadius={1} fill="#9aa8b0" opacity={0.3} />
        <Rect x={15}  y={5}  width={80}  height={50} cornerRadius={1} fill="rgba(0,0,0,0)" stroke="#fff" strokeWidth={1.5} />
      </Group>
    </Group>
  )
}
