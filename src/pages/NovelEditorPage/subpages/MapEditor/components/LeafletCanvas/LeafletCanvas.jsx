import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Modal, message } from 'antd'
import 'leaflet/dist/leaflet.css'
import GridLayer from './components/GridLayer'
import GridSizeControl from './components/GridSizeControl'
import WorldRegions from './components/WorldRegions'
import WorldRoutes from './components/WorldRoutes'
import WorldMarkers from './components/WorldMarkers'
import WorldLabels from './components/WorldLabels'
import ZoomHUD from './components/ZoomHUD/ZoomHUD'
import EditToolbar from './components/EditToolbar/EditToolbar'
import ObjectEditorModal from './components/ObjectEditorModal/ObjectEditorModal'
import useWorldData from './hooks/useWorldData'
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

function ZoomReporter({ onZoom }) {
  const map = useMap()
  useEffect(() => {
    onZoom(map.getZoom())
  }, [map, onZoom])
  useMapEvents({
    zoomend: (e) => onZoom(e.target.getZoom()),
  })
  return null
}

function MapClickHandler({ onClick }) {
  useMapEvents({ click: onClick })
  return null
}

export default function LeafletCanvas() {
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE)
  const [cells, setCells] = useState(demoWorld.cells)
  const [zoom, setZoom] = useState(-4)
  const [editMode, setEditMode] = useState('idle')
  const [editorState, setEditorState] = useState(null)
  const fileInputRef = useRef(null)
  const {
    novelId,
    world,
    addMarker,
    updateMarker,
    removeMarker,
    addLabel,
    updateLabel,
    removeLabel,
    replaceAll,
  } = useWorldData()

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

  const handleMapClick = (e) => {
    if (editMode === 'idle') return
    const coord = [e.latlng.lat, e.latlng.lng]
    const objectType = editMode === 'adding-label' ? 'label' : 'marker'
    setEditorState({
      objectType,
      mode: 'create',
      coord,
      initialValues: null,
      targetId: null,
    })
  }

  const handleMarkerClick = (m) => {
    setEditorState({
      objectType: 'marker',
      mode: 'edit',
      coord: m.coord,
      initialValues: m,
      targetId: m.id,
    })
  }

  const handleLabelClick = (lb) => {
    setEditorState({
      objectType: 'label',
      mode: 'edit',
      coord: lb.coord,
      initialValues: lb,
      targetId: lb.id,
    })
  }

  const handleEditorOk = (values) => {
    if (!editorState) return
    const { objectType, mode, coord, targetId } = editorState
    if (mode === 'create') {
      const payload = { ...values, coord }
      if (objectType === 'marker') addMarker(payload)
      else addLabel(payload)
      setEditMode('idle')
    } else {
      if (objectType === 'marker') updateMarker(targetId, values)
      else updateLabel(targetId, values)
    }
    setEditorState(null)
  }

  const handleEditorDelete = () => {
    if (!editorState) return
    const { objectType, targetId } = editorState
    if (objectType === 'marker') removeMarker(targetId)
    else removeLabel(targetId)
    setEditorState(null)
  }

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(world, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `novelmap-${novelId || 'default'}-${date}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      message.success('已导出 JSON 文件')
    } catch (err) {
      message.error('导出失败:' + err.message)
    }
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // 允许重复选同一文件
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      let parsed
      try {
        parsed = JSON.parse(evt.target.result)
      } catch (err) {
        Modal.error({ title: '导入失败', content: '无法解析 JSON 文件' })
        return
      }
      const counts = {
        markers: parsed.markers?.length || 0,
        labels: parsed.labels?.length || 0,
        regions: parsed.regions?.length || 0,
        routes: parsed.routes?.length || 0,
      }
      Modal.confirm({
        title: '导入将覆盖当前地图数据',
        content: (
          <div>
            <p>读取到:</p>
            <ul>
              <li>{counts.markers} 个标记</li>
              <li>{counts.labels} 个标签</li>
              <li>{counts.regions} 个区域</li>
              <li>{counts.routes} 条路径</li>
            </ul>
            <p>确认导入并覆盖当前数据吗?</p>
          </div>
        ),
        okText: '导入',
        okButtonProps: { danger: true },
        cancelText: '取消',
        onOk: () => {
          replaceAll(parsed)
          message.success('导入成功')
        },
      })
    }
    reader.readAsText(file)
  }

  const isAdding = editMode !== 'idle'

  return (
    <div className={`leaflet-canvas-wrap${isAdding ? ' editing' : ''}`}>
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
        <ZoomReporter onZoom={setZoom} />
        <MapClickHandler onClick={handleMapClick} />
        <GridLayer gridSize={gridSize} cells={cells} interactive={!isAdding} />

        <WorldRegions regions={world.regions} interactive={!isAdding} />
        <WorldRoutes  routes={world.routes}  interactive={!isAdding} />
        <WorldMarkers
          markers={world.markers}
          interactive={!isAdding}
          onMarkerClick={isAdding ? null : handleMarkerClick}
        />
        <WorldLabels
          labels={world.labels}
          interactive={!isAdding}
          onLabelClick={isAdding ? null : handleLabelClick}
        />
      </MapContainer>

      <EditToolbar
        editMode={editMode}
        onModeChange={setEditMode}
        onImport={handleImport}
        onExport={handleExport}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />
      <GridSizeControl
        gridSize={gridSize}
        cells={cells}
        onChange={handleGridSizeChange}
      />
      <ZoomHUD zoom={zoom} />

      <ObjectEditorModal
        open={Boolean(editorState)}
        objectType={editorState?.objectType}
        mode={editorState?.mode}
        initialValues={editorState?.initialValues}
        currentZoom={zoom}
        onOk={handleEditorOk}
        onCancel={() => setEditorState(null)}
        onDelete={editorState?.mode === 'edit' ? handleEditorDelete : undefined}
      />
    </div>
  )
}
