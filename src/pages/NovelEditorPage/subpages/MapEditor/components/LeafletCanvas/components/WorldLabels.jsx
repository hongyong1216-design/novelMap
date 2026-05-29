import { Marker } from 'react-leaflet'
import L from 'leaflet'
import useMapZoom from '../hooks/useMapZoom'
import { isVisibleAtZoom } from '../utils/visibilityPresets'

const SIZE_PX = { lg: 22, md: 16, sm: 12 }

const buildIcon = (lb) => {
  const size = SIZE_PX[lb.size] || SIZE_PX.md
  return L.divIcon({
    className: 'novelmap-label',
    html: `<div class="novelmap-label__text" style="font-size:${size}px">${lb.text}</div>`,
    iconSize: [200, size * 1.6],
    iconAnchor: [100, size],
  })
}

export default function WorldLabels({ labels, onLabelClick, interactive = false }) {
  const zoom = useMapZoom()
  const canClick = interactive && Boolean(onLabelClick)
  return labels
    .filter((lb) => isVisibleAtZoom(lb, zoom))
    .map((lb) => (
      <Marker
        key={lb.id}
        position={lb.coord}
        icon={buildIcon(lb)}
        interactive={canClick}
        keyboard={false}
        eventHandlers={canClick ? { click: () => onLabelClick(lb) } : {}}
      />
    ))
}
