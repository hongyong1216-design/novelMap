import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { Modal } from 'antd'
import useMapZoom from '../hooks/useMapZoom'

const TYPE_COLOR = {
  city:     '#6c5ce7',
  building: '#a29bfe',
  landmark: '#e8b25a',
}

const buildIcon = (m) => {
  const color = TYPE_COLOR[m.type] || '#6c5ce7'
  return L.divIcon({
    className: 'novelmap-marker',
    html: `<div class="novelmap-marker__dot" style="background:${color};box-shadow:0 0 12px ${color}"></div>
           <div class="novelmap-marker__label">${m.name}</div>`,
    iconSize: [120, 40],
    iconAnchor: [60, 8],
  })
}

const showInfo = (m) => {
  Modal.info({
    title: m.name,
    content: (
      <div>
        <p>类型: {m.type}</p>
        <p>ID: {m.id}</p>
        <p>坐标: [{m.coord.join(', ')}]</p>
      </div>
    ),
  })
}

export default function WorldMarkers({ markers }) {
  const zoom = useMapZoom()
  return markers
    .filter((m) => zoom >= m.minZoom)
    .map((m) => (
      <Marker
        key={m.id}
        position={m.coord}
        icon={buildIcon(m)}
        eventHandlers={{ click: () => showInfo(m) }}
      />
    ))
}
