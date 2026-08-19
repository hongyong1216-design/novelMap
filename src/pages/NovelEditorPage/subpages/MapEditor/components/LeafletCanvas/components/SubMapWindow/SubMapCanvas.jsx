import { useCallback, useEffect, useRef, useState } from 'react'
import { MapContainer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Button, InputNumber, Modal, message } from 'antd'
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import GridLayer from '../GridLayer'
import WorldMarkers from '../WorldMarkers'
import WorldLabels from '../WorldLabels'
import EditToolbar from '../EditToolbar/EditToolbar'
import ObjectEditorModal from '../ObjectEditorModal/ObjectEditorModal'
import CellPromptModal from '../CellPromptModal/CellPromptModal'
import { ICON_DND_TYPE } from '../IconPanel/IconPanel'
import { MAP_ICON_INDEX } from '../../data/mapIcons'
import { TopDownSimpleCRS } from '../../utils/crs'
import { worldSizeOf } from '../../utils/grid'
import {
  MIN_SUB_GRID_SIZE,
  MAX_SUB_GRID_SIZE,
  subObjectId,
} from '../../utils/subMap'

// 子地图画布: 与世界地图共用格子几何 (GridLayer) 和对象图层 (WorldMarkers / WorldLabels),
// 但网格小得多、数据完全独立。
//
// 两点和世界地图不同:
// 1. 缩放范围随窗口尺寸自适应 (打开时 fitBounds 铺满窗口), 所以子地图里的对象一律不写
//    minZoom / maxZoom —— 始终可见, 不套"大陆/国家/城市"那套分档。
// 2. 不再往下套一层: 点子地图里的标记直接进编辑表单, 没有"再展开一张地图"。
const MIN_MAP_ZOOM = -8
const MAX_MAP_ZOOM = 4
// 浮窗本体是 z-index 1000, 窗口内弹出的表单要压在它上面
const MODAL_Z_INDEX = 1100

function MapReady({ onReady }) {
  const map = useMap()
  useEffect(() => {
    onReady(map)
  }, [map, onReady])
  return null
}

// 打开时 / 换网格规模时把整张图铺满窗口
function FitWorld({ worldSize }) {
  const map = useMap()
  useEffect(() => {
    const bounds = L.latLngBounds([0, 0], [worldSize, worldSize])
    map.setMaxBounds(bounds)
    map.fitBounds(bounds, { padding: [12, 12], animate: false })
  }, [map, worldSize])
  return null
}

function ZoomReporter({ onZoom }) {
  const map = useMap()
  useEffect(() => {
    onZoom(map.getZoom())
  }, [map, onZoom])
  useMapEvents({ zoomend: (e) => onZoom(e.target.getZoom()) })
  return null
}

function MapClickHandler({ onClick }) {
  useMapEvents({ click: onClick })
  return null
}

export default function SubMapCanvas({ marker, subMap, onUpdate, onReset }) {
  const [zoom, setZoom] = useState(-4)
  const [editMode, setEditMode] = useState('idle')
  const [editorState, setEditorState] = useState(null)
  // 只记 cellId, 格子数据每次渲染从 cells 里取 —— 保存后弹窗不关, 标签/表单要跟着刷新
  const [activeCellId, setActiveCellId] = useState(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [iconPanelOpen, setIconPanelOpen] = useState(false)
  const [pendingIconId, setPendingIconId] = useState(null)
  const [iconDragOver, setIconDragOver] = useState(false)
  const [saving, setSaving] = useState(false)
  const wrapRef = useRef(null)

  const markerId = marker.id
  const { gridSize, cells, markers, labels } = subMap
  const worldSize = worldSizeOf(gridSize)
  const center = [worldSize / 2, worldSize / 2]
  const activeCell = activeCellId ? cells[activeCellId] : null
  // 每格一个约定文件名: 用 markerId 分目录, 不同子地图的同名格子 (都叫 L0-1-1) 不会撞
  const defaultCellSrc = activeCellId ? `/sub-maps/${markerId}/${activeCellId}.png` : ''

  // 浮窗可拖拽改大小 / 最大化, 容器尺寸一变 Leaflet 必须重新量, 否则渲染错位
  useEffect(() => {
    if (!mapInstance || !wrapRef.current || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => mapInstance.invalidateSize())
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [mapInstance])

  const handleGridSizeChange = (value) => {
    if (value == null) return // 清空输入框时先按兵不动, 别把网格缩到最小
    const next = Math.round(value)
    if (next < MIN_SUB_GRID_SIZE || next > MAX_SUB_GRID_SIZE) return
    onUpdate((s) => ({ ...s, gridSize: next }))
  }

  // 保存到项目: 平时改动只落 localStorage, 点这里才把这张图 (连同它所属的标记)
  // 写进 data/subMaps.json —— 换台机器 / 清了 localStorage 也还在, 且能提交进 git
  const handleSaveToProject = async () => {
    if (saving) return
    setSaving(true)
    try {
      const res = await fetch('/__api/save-sub-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marker, subMap }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)

      const summary = `${data.cellCount} 格 / ${data.markerCount} 标记 / ${data.labelCount} 标签`
      if (data.missingImages?.length) {
        Modal.warning({
          title: `已保存到 ${data.file}`,
          zIndex: MODAL_Z_INDEX,
          okText: '知道了',
          content: (
            <div>
              <p>写入 {summary}。以下图片路径已登记, 但文件还不在 public 下:</p>
              <ul>
                {data.missingImages.map((src) => (
                  <li key={src}>{src}</li>
                ))}
              </ul>
            </div>
          ),
        })
      } else {
        message.success(`已保存到 ${data.file} (${summary})`)
      }
    } catch (err) {
      Modal.error({
        title: '保存失败',
        zIndex: MODAL_Z_INDEX,
        content: `${String(err?.message || err)} (该功能依赖 dev server, 需用 npm run dev 启动)`,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleModeChange = (mode) => {
    setEditMode(mode)
    if (mode !== 'adding-icon') setPendingIconId(null)
  }

  const handleToggleIconPanel = () => {
    if (iconPanelOpen) {
      setIconPanelOpen(false)
      handleModeChange('idle')
    } else {
      setIconPanelOpen(true)
    }
  }

  const handleSelectIcon = (iconId) => {
    setPendingIconId(iconId)
    setEditMode(iconId ? 'adding-icon' : 'idle')
  }

  // ---- 拖图标进来落点 ----
  // 浮窗是 React portal, 事件仍会顺着 React 树冒到世界地图的画布上,
  // 不掐断的话同一次拖放会在主地图上也落一个标记 → 三个 handler 都要 stopPropagation
  const handleIconDragOver = (e) => {
    if (!e.dataTransfer.types.includes(ICON_DND_TYPE)) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    if (!iconDragOver) setIconDragOver(true)
  }

  const handleIconDragLeave = (e) => {
    e.stopPropagation()
    if (e.currentTarget.contains(e.relatedTarget)) return
    setIconDragOver(false)
  }

  const handleIconDrop = (e) => {
    e.stopPropagation()
    const iconId = e.dataTransfer.getData(ICON_DND_TYPE)
    setIconDragOver(false)
    if (!iconId || !mapInstance) return
    e.preventDefault()
    const latlng = mapInstance.mouseEventToLatLng(e.nativeEvent)
    const icon = MAP_ICON_INDEX[iconId]
    const clamp = (v) => Math.max(0, Math.min(worldSize, v))
    onUpdate((s) => ({
      ...s,
      markers: [
        ...s.markers,
        {
          id: subObjectId('smk'),
          name: icon?.label || '新地标',
          iconId,
          coord: [clamp(latlng.lat), clamp(latlng.lng)],
        },
      ],
    }))
    message.success(`已放置「${icon?.label || '图标'}」, 点击可编辑`)
  }

  const handleMapClick = (e) => {
    if (editMode === 'idle') return
    setEditorState({
      objectType: editMode === 'adding-label' ? 'label' : 'marker',
      mode: 'create',
      coord: [e.latlng.lat, e.latlng.lng],
      initialValues: editMode === 'adding-icon' ? { iconId: pendingIconId } : null,
      targetId: null,
    })
  }

  const handleMarkerEdit = useCallback((m) => {
    setEditorState({
      objectType: 'marker',
      mode: 'edit',
      coord: m.coord,
      initialValues: m,
      targetId: m.id,
    })
  }, [])

  const handleLabelEdit = useCallback((lb) => {
    setEditorState({
      objectType: 'label',
      mode: 'edit',
      coord: lb.coord,
      initialValues: lb,
      targetId: lb.id,
    })
  }, [])

  const handleEditorOk = (values) => {
    if (!editorState) return
    const { objectType, mode, coord, targetId } = editorState
    const key = objectType === 'marker' ? 'markers' : 'labels'
    if (mode === 'create') {
      const prefix = objectType === 'marker' ? 'smk' : 'slb'
      onUpdate((s) => ({
        ...s,
        [key]: [...s[key], { id: subObjectId(prefix), ...values, coord }],
      }))
      handleModeChange('idle')
    } else {
      onUpdate((s) => ({
        ...s,
        [key]: s[key].map((o) => (o.id === targetId ? { ...o, ...values } : o)),
      }))
    }
    setEditorState(null)
  }

  const handleEditorDelete = () => {
    if (!editorState) return
    const { objectType, targetId } = editorState
    const key = objectType === 'marker' ? 'markers' : 'labels'
    onUpdate((s) => ({ ...s, [key]: s[key].filter((o) => o.id !== targetId) }))
    setEditorState(null)
  }

  // ---- 格子 ----
  const handleCellClick = (id) => {
    setActiveCellId(id)
  }

  // 保存后不关弹窗: 接着就要用同一个弹窗里的提示词 / 参考图去生成这一格的图
  const handleCellSave = ({ name, src }) => {
    onUpdate((s) => ({
      ...s,
      cells: { ...s.cells, [activeCellId]: { filled: true, name, src } },
    }))
  }

  const handleCellClear = () => {
    onUpdate((s) => {
      const next = { ...s.cells }
      delete next[activeCellId]
      return { ...s, cells: next }
    })
  }

  const isAdding = editMode !== 'idle'

  return (
    <div
      ref={wrapRef}
      className={
        'sub-map-canvas' +
        (isAdding ? ' editing' : '') +
        (iconDragOver ? ' icon-dropping' : '')
      }
      onDragOver={handleIconDragOver}
      onDragLeave={handleIconDragLeave}
      onDrop={handleIconDrop}
    >
      <MapContainer
        crs={TopDownSimpleCRS}
        center={center}
        zoom={-4}
        minZoom={MIN_MAP_ZOOM}
        maxZoom={MAX_MAP_ZOOM}
        maxBoundsViscosity={1.0}
        zoomSnap={0.25}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={120}
        attributionControl={false}
        zoomControl={false}
        className="sub-map-canvas__map"
      >
        <MapReady onReady={setMapInstance} />
        <FitWorld worldSize={worldSize} />
        <ZoomReporter onZoom={setZoom} />
        <MapClickHandler onClick={handleMapClick} />

        <GridLayer
          gridSize={gridSize}
          cells={cells}
          interactive={!isAdding}
          onCellClick={handleCellClick}
        />
        <WorldMarkers
          markers={markers}
          interactive={!isAdding}
          onMarkerEdit={isAdding ? null : handleMarkerEdit}
        />
        <WorldLabels
          labels={labels}
          interactive={!isAdding}
          onLabelClick={isAdding ? null : handleLabelEdit}
        />
      </MapContainer>

      <EditToolbar
        label="子地图编辑"
        className="edit-toolbar--sub"
        showFileActions={false}
        editMode={editMode}
        onModeChange={handleModeChange}
        iconPanelOpen={iconPanelOpen}
        onToggleIconPanel={handleToggleIconPanel}
        selectedIconId={pendingIconId}
        onSelectIcon={handleSelectIcon}
        currentZoom={zoom}
      />

      <div className="sub-map-canvas__panel">
        <Button
          type="primary"
          size="small"
          block
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSaveToProject}
        >
          保存到项目
        </Button>
        <div className="sub-map-canvas__panel-row">
          <span className="sub-map-canvas__panel-label">网格</span>
          <InputNumber
            size="small"
            min={MIN_SUB_GRID_SIZE}
            max={MAX_SUB_GRID_SIZE}
            value={gridSize}
            onChange={handleGridSizeChange}
            style={{ width: 58 }}
          />
          <span className="sub-map-canvas__panel-suffix">× {gridSize}</span>
        </div>
        <div className="sub-map-canvas__panel-hint">
          点格子填名称和图片,未填的显示"未探索"。改动即时暂存,点上方保存才写进项目。
        </div>
        <Button size="small" danger type="text" icon={<DeleteOutlined />} onClick={onReset}>
          清空这张图
        </Button>
      </div>

      <ObjectEditorModal
        open={Boolean(editorState)}
        objectType={editorState?.objectType}
        mode={editorState?.mode}
        initialValues={editorState?.initialValues}
        currentZoom={zoom}
        showVisibility={false}
        zIndex={MODAL_Z_INDEX}
        onOk={handleEditorOk}
        onCancel={() => setEditorState(null)}
        onDelete={editorState?.mode === 'edit' ? handleEditorDelete : undefined}
      />

      <CellPromptModal
        open={Boolean(activeCellId)}
        cellId={activeCellId}
        cell={activeCell}
        cells={cells}
        defaultSrc={defaultCellSrc}
        zIndex={MODAL_Z_INDEX}
        onSaveCell={handleCellSave}
        onClearCell={handleCellClear}
        onClose={() => setActiveCellId(null)}
      />
    </div>
  )
}
