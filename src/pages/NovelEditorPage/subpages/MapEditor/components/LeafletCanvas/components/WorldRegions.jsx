import { Polygon } from 'react-leaflet'
import { Modal } from 'antd'
import useMapZoom from '../hooks/useMapZoom'
import { isVisibleAtZoom } from '../utils/visibilityPresets'

const showInfo = (r) => {
  Modal.info({
    title: r.name,
    content: (
      <div>
        <p>类型: region(多边形 / 势力领地)</p>
        <p>ID: {r.id}</p>
        <p>顶点数: {r.polygon.length}</p>
      </div>
    ),
  })
}

export default function WorldRegions({ regions, interactive = true }) {
  const zoom = useMapZoom()
  return regions
    .filter((r) => isVisibleAtZoom(r, zoom))
    .map((r) => (
      <Polygon
        key={r.id}
        positions={r.polygon}
        interactive={interactive}
        pathOptions={{
          color: 'rgba(255, 255, 255, 0.12)',
          weight: 1,
          fillColor: '#6c5ce7',
          fillOpacity: 0.12,
        }}
        eventHandlers={interactive ? { click: () => showInfo(r) } : {}}
      />
    ))
}
