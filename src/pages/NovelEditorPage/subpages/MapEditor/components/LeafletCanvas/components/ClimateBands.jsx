import { Pane, Polyline } from 'react-leaflet'
import { CLIMATE_BANDS } from '../data/climateBands'

// 气候带·地图内层: 只画带间分隔虚线 (色条 + 带名已移到左侧悬停标尺 ClimateRuler)
// - 独立 Pane 设 pointer-events:none, 点击穿透到下面的格/marker, 不影响编辑
// - interactive={false}, 不进 Leaflet 事件链
// - zIndex 450: 压在网格图(overlayPane 400)之上、点标记(markerPane 600)之下
export default function ClimateBands({ worldSize, visible = true, opacity = 0.85 }) {
  if (!visible) return null

  return (
    <Pane name="climate-bands" style={{ zIndex: 450, pointerEvents: 'none' }}>
      {/* 带间分隔线 (跳过世界最顶/最底边界); 加粗加深便于在地图上辨识纬度 */}
      {CLIMATE_BANDS.slice(1).map((band) => {
        const y = band.from * worldSize
        return (
          <Polyline
            key={`div-${band.id}`}
            positions={[[y, 0], [y, worldSize]]}
            pathOptions={{
              color: band.color,
              weight: 2.5,
              opacity: 0.85 * opacity,
              dashArray: '12 8',
            }}
            interactive={false}
          />
        )
      })}
    </Pane>
  )
}
