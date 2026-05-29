import { Marker } from 'react-leaflet'
import L from 'leaflet'
import useMapZoom from '../hooks/useMapZoom'
import { isVisibleAtZoom } from '../utils/visibilityPresets'
import { resolveIcon } from '../utils/iconLibrary'

const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const buildIcon = (m) => {
  const visual = resolveIcon(m)
  const name = escapeHtml(m.name)
  let inner
  let anchorY
  if (visual.kind === 'emoji') {
    inner = `<div class="novelmap-marker__emoji">${visual.char}</div>`
    anchorY = 14
  } else {
    const color = visual.color || '#6c5ce7'
    inner = `<div class="novelmap-marker__dot" style="background:${color};box-shadow:0 0 12px ${color}"></div>`
    anchorY = 8
  }
  return L.divIcon({
    className: 'novelmap-marker',
    html: `${inner}<div class="novelmap-marker__label">${name}</div>`,
    iconSize: [120, 48],
    iconAnchor: [60, anchorY],
  })
}

export default function WorldMarkers({ markers, onMarkerClick, interactive = true }) {
  const zoom = useMapZoom()
  return markers
    .filter((m) => isVisibleAtZoom(m, zoom))
    .map((m) => (
      <Marker
        key={m.id}
        position={m.coord}
        icon={buildIcon(m)}
        interactive={interactive}
        eventHandlers={
          interactive && onMarkerClick ? { click: () => onMarkerClick(m) } : {}
        }
      />
    ))
}
