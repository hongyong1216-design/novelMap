import { useEffect, useRef, useState } from 'react'
import { MapContainer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Modal, message } from 'antd'
import 'leaflet/dist/leaflet.css'
import GridLayer from './components/GridLayer'
import GridInfoPanel from './components/GridInfoPanel/GridInfoPanel'
import ClimateBands from './components/ClimateBands'
import ClimateRuler from './components/ClimateRuler/ClimateRuler'
import ClimateBandControl from './components/ClimateBandControl/ClimateBandControl'
import WorldRegions from './components/WorldRegions'
import WorldRoutes from './components/WorldRoutes'
import WorldMarkers from './components/WorldMarkers'
import WorldLabels from './components/WorldLabels'
import ZoomHUD from './components/ZoomHUD/ZoomHUD'
import EditToolbar from './components/EditToolbar/EditToolbar'
import ObjectEditorModal from './components/ObjectEditorModal/ObjectEditorModal'
import CellPromptModal from './components/CellPromptModal/CellPromptModal'
import useWorldData from './hooks/useWorldData'
import { demoWorld } from './data/demoWorld'
import { DEFAULT_GRID_SIZE, worldSizeOf } from './utils/grid'
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

// 把 map 实例上抛给外层, 供屏幕固定的 ClimateRuler 做坐标投影
function MapReady({ onReady }) {
  const map = useMap()
  useEffect(() => {
    onReady(map)
  }, [map, onReady])
  return null
}

// 同步下载夹时, 一格可能缺文件也可能缺登记, 分开说清楚
const SYNC_ACTION_TEXT = {
  synced: '新增',
  copied: '补图片',
  registered: '补登记',
}

export default function LeafletCanvas() {
  const [zoom, setZoom] = useState(-4)
  const [editMode, setEditMode] = useState('idle')
  const [editorState, setEditorState] = useState(null)
  const [climateVisible, setClimateVisible] = useState(true)
  const [climateOpacity, setClimateOpacity] = useState(0.85)
  const [mapInstance, setMapInstance] = useState(null)
  // 每次点"刷新地图"自增, 传给 GridLayer 给图片 URL 换版本号 → 重新拉取 public/maps 下的文件
  const [mapVersion, setMapVersion] = useState(0)
  const [syncing, setSyncing] = useState(false)
  // 点击格子弹出的 AI 生图助手 (提示词 + 邻居重叠参考图)
  const [promptCell, setPromptCell] = useState(null)
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

  // 网格规格固定 (右上角面板只做展示), cells 直接取静态映射
  const gridSize = DEFAULT_GRID_SIZE
  const cells = demoWorld.cells
  const worldSize = worldSizeOf(gridSize)
  const initialCenter = [worldSize / 2, worldSize / 2]

  const handleRefreshMap = () => {
    setMapVersion((v) => v + 1)
    message.success('地图已刷新')
  }

  // 把下载夹里新出的成图搬进 public/maps 并登记, 每格只取最新一份, 已同步过的跳过
  const handleSync = async () => {
    if (syncing) return
    setSyncing(true)
    try {
      const res = await fetch('/__api/sync-downloads', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)

      const done = data.results.filter((r) => r.action !== 'skipped')
      const skipped = data.results.filter((r) => r.action === 'skipped')
      const tail = (
        <div className="map-sync-result__tail">
          {skipped.length > 0 && <p>已同步过, 跳过 {skipped.length} 格: {skipped.map((r) => r.cellId).join(', ')}</p>}
          {data.refSkipped > 0 && <p>另跳过 {data.refSkipped} 个参考图 (中间为透明待补区, 不能当成图)</p>}
          <p className="map-sync-result__dir">来源: {data.dir}</p>
        </div>
      )

      if (done.length === 0) {
        Modal.info({ title: '没有需要同步的图片', content: tail, okText: '知道了' })
        return
      }

      setMapVersion((v) => v + 1)
      Modal.success({
        title: `已同步 ${done.length} 格`,
        content: (
          <div className="map-sync-result">
            <ul>
              {done.map((r) => (
                <li key={r.cellId}>
                  <b>{r.cellId}</b> ({SYNC_ACTION_TEXT[r.action]}) ← {r.from}
                </li>
              ))}
            </ul>
            {tail}
          </div>
        ),
        okText: '完成',
      })
    } catch (err) {
      Modal.error({
        title: '同步失败',
        content: `${String(err?.message || err)} (该功能依赖 dev server, 需用 npm run dev 启动)`,
      })
    } finally {
      setSyncing(false)
    }
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

  const handleCellClick = (id, cell) => {
    setPromptCell({ id, cell })
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
        <MapReady onReady={setMapInstance} />
        <MapClickHandler onClick={handleMapClick} />
        <GridLayer
          gridSize={gridSize}
          cells={cells}
          interactive={!isAdding}
          onCellClick={handleCellClick}
          version={mapVersion}
        />

        <ClimateBands worldSize={worldSize} visible={climateVisible} opacity={climateOpacity} />

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

      <ClimateRuler
        map={mapInstance}
        worldSize={worldSize}
        visible={climateVisible}
        opacity={climateOpacity}
      />

      <EditToolbar
        editMode={editMode}
        onModeChange={setEditMode}
        onImport={handleImport}
        onExport={handleExport}
        onSync={handleSync}
        syncing={syncing}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />
      <GridInfoPanel gridSize={gridSize} onRefresh={handleRefreshMap} />
      <ZoomHUD zoom={zoom} />

      <ClimateBandControl
        visible={climateVisible}
        opacity={climateOpacity}
        onVisibleChange={setClimateVisible}
        onOpacityChange={setClimateOpacity}
      />

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

      <CellPromptModal
        open={Boolean(promptCell)}
        cellId={promptCell?.id}
        cell={promptCell?.cell}
        cells={cells}
        onClose={() => setPromptCell(null)}
      />
    </div>
  )
}
