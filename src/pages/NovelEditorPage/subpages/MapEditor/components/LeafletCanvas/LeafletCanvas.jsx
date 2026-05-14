import { MapContainer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import GridLayer from './components/GridLayer'
import WorldRegions from './components/WorldRegions'
import WorldRoutes from './components/WorldRoutes'
import WorldMarkers from './components/WorldMarkers'
import WorldLabels from './components/WorldLabels'
import { demoWorld } from './data/demoWorld'
import { WORLD } from './utils/grid'
import './LeafletCanvas.css'

const WORLD_BOUNDS = [[0, 0], [WORLD.size, WORLD.size]]

export default function LeafletCanvas() {
  return (
    <div className="leaflet-canvas-wrap">
      <MapContainer
        crs={L.CRS.Simple}
        center={[WORLD.size / 2, WORLD.size / 2]}
        zoom={-4}
        minZoom={-4}
        maxZoom={5}
        maxBounds={WORLD_BOUNDS}
        maxBoundsViscosity={1.0}
        zoomSnap={0.25}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={120}
        attributionControl={false}
        zoomControl={false}
        className="leaflet-canvas"
      >
        <GridLayer level={0} cells={demoWorld.cells} />
        <GridLayer level={1} cells={demoWorld.cells} />
        <GridLayer level={2} cells={demoWorld.cells} />

        <WorldRegions regions={demoWorld.regions} />
        <WorldRoutes  routes={demoWorld.routes} />
        <WorldMarkers markers={demoWorld.markers} />
        <WorldLabels  labels={demoWorld.labels} />
      </MapContainer>
    </div>
  )
}
