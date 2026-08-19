import { useEffect, useMemo, useRef, useState } from 'react'
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
import SubMapWindow from './components/SubMapWindow/SubMapWindow'
import { ICON_DND_TYPE } from './components/IconPanel/IconPanel'
import useWorldData from './hooks/useWorldData'
import { demoWorld } from './data/demoWorld'
import { MAP_ICON_INDEX } from './data/mapIcons'
import { defaultZoomRangeFor, canPlaceIconAtZoom, iconPlacementHint } from './utils/visibilityPresets'
import { DEFAULT_GRID_SIZE, worldSizeOf } from './utils/grid'
import { TopDownSimpleCRS } from './utils/crs'
import { subMapIdSet } from './utils/subMap'
import './LeafletCanvas.css'

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
  // 图标栏展开状态 + 当前选中的图标 (选中后点地图落点; 拖拽落点则不依赖选中)
  const [iconPanelOpen, setIconPanelOpen] = useState(false)
  const [pendingIconId, setPendingIconId] = useState(null)
  // 图标正拖到地图上方, 用于给画布加高亮提示
  const [iconDragOver, setIconDragOver] = useState(false)
  // 当前展开了哪个标记的子地图 (点图标 →「展开地图」)
  const [subMapMarkerId, setSubMapMarkerId] = useState(null)
  // 开窗那一刻地图画布在屏幕上的位置, 用来让子地图窗口正好盖住地图编辑区
  const [subMapRect, setSubMapRect] = useState(null)
  const fileInputRef = useRef(null)
  const wrapRef = useRef(null)
  const {
    novelId,
    world,
    addMarker,
    updateMarker,
    removeMarker,
    addLabel,
    updateLabel,
    removeLabel,
    updateSubMap,
    resetSubMap,
    replaceAll,
  } = useWorldData()

  // 网格规格固定 (右上角面板只做展示), cells 直接取静态映射
  const gridSize = DEFAULT_GRID_SIZE
  const cells = demoWorld.cells
  const worldSize = worldSizeOf(gridSize)
  const initialCenter = [worldSize / 2, worldSize / 2]

  // 图标是"大陆 / 国家"级地标, 放大到城市 / 街道层就不许再落点;
  // 图标栏仍可浏览和选中, 只是要缩回去才放得下, 选中状态不丢
  const iconPlaceable = canPlaceIconAtZoom(zoom)

  // 已建过子地图的标记 (图标上挂角标) + 当前展开的那个
  const subMapIds = useMemo(() => subMapIdSet(world.subMaps), [world.subMaps])
  const subMapMarker = subMapMarkerId
    ? world.markers.find((m) => m.id === subMapMarkerId) || null
    : null

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

  // 离开图标放置模式时把待落点图标一并清掉, 免得下次误用上次的选择
  const handleModeChange = (mode) => {
    setEditMode(mode)
    if (mode !== 'adding-icon') setPendingIconId(null)
  }

  // 工具栏「图标」按钮: 展开/收起图标栏, 收起时顺带退出放置模式
  const handleToggleIconPanel = () => {
    if (iconPanelOpen) {
      setIconPanelOpen(false)
      handleModeChange('idle')
    } else {
      setIconPanelOpen(true)
    }
  }

  // 图标栏里点选: 选中即进入放置模式, 再点一次取消选中
  const handleSelectIcon = (iconId) => {
    setPendingIconId(iconId)
    setEditMode(iconId ? 'adding-icon' : 'idle')
  }

  // ---- 从图标栏拖到地图上落点 ----
  // 子地图浮窗是 portal 到 body 的, 但事件仍沿 React 树冒到这里。
  // 落在浮窗边框/标题栏上的拖放不该被算成"往世界地图上放", 用 DOM 包含关系筛掉
  const fromThisCanvas = (e) => Boolean(wrapRef.current?.contains(e.target))

  const handleIconDragOver = (e) => {
    if (!fromThisCanvas(e)) return
    if (!e.dataTransfer.types.includes(ICON_DND_TYPE)) return
    e.preventDefault() // 不阻止默认行为就不会触发 drop
    // 越层时给"禁止"光标, 但仍接管这次拖拽, 好在画布上打出为什么不能放
    e.dataTransfer.dropEffect = iconPlaceable ? 'copy' : 'none'
    if (!iconDragOver) setIconDragOver(true)
  }

  // dragleave 在子元素间移动也会触发, 用 relatedTarget 判断是否真的离开了画布
  const handleIconDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    setIconDragOver(false)
  }

  // 拖放是"快速落点": 直接用图标名建标记, 不打断为弹表单; 之后点标记可再改名/调可见性
  const handleIconDrop = (e) => {
    if (!fromThisCanvas(e)) return
    const iconId = e.dataTransfer.getData(ICON_DND_TYPE)
    setIconDragOver(false)
    if (!iconId || !mapInstance) return
    e.preventDefault()
    if (!iconPlaceable) {
      message.warning(iconPlacementHint(zoom))
      return
    }
    const latlng = mapInstance.mouseEventToLatLng(e.nativeEvent)
    const icon = MAP_ICON_INDEX[iconId]
    // 拖到世界边缘外时收回边界内, 避免落到 maxBounds 之外看不见
    const clamp = (v) => Math.max(0, Math.min(worldSize, v))
    addMarker({
      name: icon?.label || '新地标',
      iconId,
      coord: [clamp(latlng.lat), clamp(latlng.lng)],
      ...defaultZoomRangeFor(zoom),
    })
    message.success(`已放置「${icon?.label || '图标'}」, 点击可编辑`)
  }

  const handleMapClick = (e) => {
    if (editMode === 'idle') return
    if (editMode === 'adding-icon' && !iconPlaceable) {
      message.warning(iconPlacementHint(zoom))
      return
    }
    const coord = [e.latlng.lat, e.latlng.lng]
    const objectType = editMode === 'adding-label' ? 'label' : 'marker'
    setEditorState({
      objectType,
      mode: 'create',
      coord,
      // 图标模式下把选中的图标带进表单, 用户只需补个名称
      initialValues: editMode === 'adding-icon' ? { iconId: pendingIconId } : null,
      targetId: null,
    })
  }

  const handleCellClick = (id, cell) => {
    setPromptCell({ id, cell })
  }

  const handleMarkerEdit = (m) => {
    setEditorState({
      objectType: 'marker',
      mode: 'edit',
      coord: m.coord,
      initialValues: m,
      targetId: m.id,
    })
  }

  // 展开该地点自己的那张地图 (数据在 world.subMaps[m.id])
  // 顺手量一下画布此刻的屏幕矩形: 窗口按它开, 铺满地图区又不压住左侧菜单
  const handleMarkerExpand = (m) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    setSubMapRect(
      rect ? { x: rect.left, y: rect.top, w: rect.width, h: rect.height } : null
    )
    setSubMapMarkerId(m.id)
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
      handleModeChange('idle')
    } else {
      if (objectType === 'marker') updateMarker(targetId, values)
      else updateLabel(targetId, values)
    }
    setEditorState(null)
  }

  const handleEditorDelete = () => {
    if (!editorState) return
    const { objectType, targetId } = editorState
    if (objectType === 'marker') {
      removeMarker(targetId)
      // 标记连同子地图一起没了, 开着的窗口要跟着关
      if (subMapMarkerId === targetId) setSubMapMarkerId(null)
    } else {
      removeLabel(targetId)
    }
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
        subMaps: Object.keys(parsed.subMaps || {}).length,
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
              <li>{counts.subMaps} 张子地图</li>
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
  const dropClass = iconDragOver
    ? iconPlaceable
      ? ' icon-dropping'
      : ' icon-dropping-blocked'
    : ''

  return (
    <div
      ref={wrapRef}
      className={'leaflet-canvas-wrap' + (isAdding ? ' editing' : '') + dropClass}
      onDragOver={handleIconDragOver}
      onDragLeave={handleIconDragLeave}
      onDrop={handleIconDrop}
    >
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
          subMapIds={subMapIds}
          onMarkerEdit={isAdding ? null : handleMarkerEdit}
          onMarkerExpand={isAdding ? null : handleMarkerExpand}
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
        onModeChange={handleModeChange}
        iconPanelOpen={iconPanelOpen}
        onToggleIconPanel={handleToggleIconPanel}
        selectedIconId={pendingIconId}
        onSelectIcon={handleSelectIcon}
        iconPlaceable={iconPlaceable}
        currentZoom={zoom}
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
        iconPlaceable={iconPlaceable}
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

      <SubMapWindow
        open={Boolean(subMapMarker)}
        marker={subMapMarker}
        subMap={world.subMaps?.[subMapMarkerId]}
        anchorRect={subMapRect}
        onUpdate={(updater) => updateSubMap(subMapMarkerId, updater)}
        onReset={() => resetSubMap(subMapMarkerId)}
        onClose={() => setSubMapMarkerId(null)}
      />
    </div>
  )
}
