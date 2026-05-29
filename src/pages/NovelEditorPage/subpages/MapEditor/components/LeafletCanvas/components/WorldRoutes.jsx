import { Polyline } from 'react-leaflet'
import { Modal } from 'antd'
import useMapZoom from '../hooks/useMapZoom'
import { isVisibleAtZoom } from '../utils/visibilityPresets'

const showInfo = (t) => {
  Modal.info({
    title: t.name,
    content: (
      <div>
        <p>类型: route({t.style === 'dashed' ? '虚线' : '实线'})</p>
        <p>ID: {t.id}</p>
        <p>路径点数: {t.line.length}</p>
      </div>
    ),
  })
}

export default function WorldRoutes({ routes, interactive = true }) {
  const zoom = useMapZoom()
  return routes
    .filter((t) => isVisibleAtZoom(t, zoom))
    .map((t) => (
      <Polyline
        key={t.id}
        positions={t.line}
        interactive={interactive}
        pathOptions={{
          color: '#a29bfe',
          weight: 3,
          opacity: 0.85,
          dashArray: t.style === 'dashed' ? '10 8' : null,
        }}
        eventHandlers={interactive ? { click: () => showInfo(t) } : {}}
      />
    ))
}
