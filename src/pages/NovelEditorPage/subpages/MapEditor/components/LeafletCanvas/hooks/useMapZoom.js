import { useState } from 'react'
import { useMapEvents } from 'react-leaflet'

export default function useMapZoom() {
  const [zoom, setZoom] = useState(0)
  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
  })
  return zoom
}
