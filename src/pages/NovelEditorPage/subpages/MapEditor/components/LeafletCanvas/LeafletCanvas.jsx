import { useEffect, useMemo, useState } from 'react'
import { MapContainer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import GridLayer from './components/GridLayer'
import GridSizeControl from './components/GridSizeControl'
import WorldRegions from './components/WorldRegions'
import WorldRoutes from './components/WorldRoutes'
import WorldMarkers from './components/WorldMarkers'
import WorldLabels from './components/WorldLabels'
import { demoWorld } from './data/demoWorld'
import { DEFAULT_GRID_SIZE, parseCellId, worldSizeOf } from './utils/grid'
import './LeafletCanvas.css'

// 反转 Simple CRS 的 y 方向: 让 lat=0 在屏幕顶部, lat 越大越往下 (跟屏幕坐标一致)
// 这样 cell (x=0, y=0) 落在左上, (x=gridSize-1, y=gridSize-1) 落在右下,
// 增大 gridSize 时新增的格子自然出现在右边和下边
const TopDownSimpleCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0),
})

function MapBoundsUpdater({ worldSize }) {
  const map = useMap()
  useEffect(() => {
    const bounds = L.latLngBounds([0, 0], [worldSize, worldSize])
    map.setMaxBounds(bounds)
    if (!bounds.contains(map.getCenter())) {
      map.panInsideBounds(bounds, { animate: false })
    }
  }, [map, worldSize])
  return null
}

export default function LeafletCanvas() {
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE)
  const [cells, setCells] = useState(demoWorld.cells)

  const worldSize = useMemo(() => worldSizeOf(gridSize), [gridSize])
  const initialCenter = useMemo(
    () => [worldSizeOf(DEFAULT_GRID_SIZE) / 2, worldSizeOf(DEFAULT_GRID_SIZE) / 2],
    []
  )

  const handleGridSizeChange = (nextSize) => {
    setGridSize(nextSize)
    setCells((prev) => {
      const next = {}
      let pruned = false
      Object.entries(prev).forEach(([id, cell]) => {
        const pos = parseCellId(id)
        if (!pos) {
          next[id] = cell
          return
        }
        if (pos.x < nextSize && pos.y < nextSize) next[id] = cell
        else pruned = true
      })
      return pruned ? next : prev
    })
  }

  return (
    <div className="leaflet-canvas-wrap">
      <MapContainer
        crs={TopDownSimpleCRS}
        center={initialCenter}
        zoom={-4}
        minZoom={-4}
        maxZoom={5}
        maxBoundsViscosity={1.0}
        zoomSnap={0.25}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={120}
        attributionControl={false}
        zoomControl={false}
        className="leaflet-canvas"
      >
        <MapBoundsUpdater worldSize={worldSize} />
        <GridLayer gridSize={gridSize} cells={cells} />

        <WorldRegions regions={demoWorld.regions} />
        <WorldRoutes  routes={demoWorld.routes} />
        <WorldMarkers markers={demoWorld.markers} />
        <WorldLabels  labels={demoWorld.labels} />
      </MapContainer>

      <GridSizeControl
        gridSize={gridSize}
        cells={cells}
        onChange={handleGridSizeChange}
      />
    </div>
  )
}
