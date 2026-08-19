import { Button, Tooltip } from 'antd'
import {
  CloseOutlined,
  EnvironmentOutlined,
  ImportOutlined,
  ExportOutlined,
  TagOutlined,
  CloudDownloadOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import IconPanel from '../IconPanel/IconPanel'
import { zoomTierName } from '../../utils/visibilityPresets'
import './EditToolbar.css'

const MODE_HINT = {
  'adding-label': '点击地图任意位置添加标签',
  'adding-marker': '点击地图任意位置添加标记',
  'adding-icon': '点击地图任意位置放置图标',
}

export default function EditToolbar({
  editMode = 'idle',
  onModeChange,
  iconPanelOpen = false,
  onToggleIconPanel,
  selectedIconId,
  onSelectIcon,
  iconPlaceable = true,
  currentZoom = 0,
  onImport,
  onExport,
  onSync,
  syncing = false,
  // 子地图窗口里复用同一套工具, 但不需要同步/导入/导出 (数据随主地图一起走)
  showFileActions = true,
  className = '',
  label = '地图编辑',
}) {
  const toggle = (mode) => onModeChange(editMode === mode ? 'idle' : mode)

  // 图标模式下越了层, 把提示换成"要缩小地图"而不是"点地图落点"
  const iconBlocked = editMode === 'adding-icon' && !iconPlaceable
  const hint = iconBlocked
    ? `图标只能加在大陆 / 国家层, 请缩小地图 (当前「${zoomTierName(currentZoom)}」)`
    : MODE_HINT[editMode]

  return (
    <div
      className={
        'edit-toolbar' +
        (iconPanelOpen ? ' edit-toolbar--expanded' : '') +
        (className ? ` ${className}` : '')
      }
    >
      <div className="edit-toolbar__label">{label}</div>

      <div className="edit-toolbar__row">
        <Tooltip title="添加文字标签 (国名 / 区域名 / 注释)">
          <Button
            type={editMode === 'adding-label' ? 'primary' : 'default'}
            icon={<TagOutlined />}
            onClick={() => toggle('adding-label')}
          >
            标签
          </Button>
        </Tooltip>
        <Tooltip title="添加点标记 (城市 / 建筑 / 地标)">
          <Button
            type={editMode === 'adding-marker' ? 'primary' : 'default'}
            icon={<EnvironmentOutlined />}
            onClick={() => toggle('adding-marker')}
          >
            标记
          </Button>
        </Tooltip>
        <Tooltip title="展开图标栏, 把图片图标拖到地图上 (仅大陆 / 国家层可放置)">
          <Button
            type={iconPanelOpen ? 'primary' : 'default'}
            icon={<AppstoreOutlined />}
            onClick={onToggleIconPanel}
          >
            图标
          </Button>
        </Tooltip>
      </div>

      {iconPanelOpen && (
        <IconPanel
          selectedId={selectedIconId}
          onSelect={onSelectIcon}
          placeable={iconPlaceable}
          currentZoom={currentZoom}
        />
      )}

      {showFileActions && (
        <div className="edit-toolbar__row edit-toolbar__row--small">
          <Tooltip title="把下载夹里新生成的地图图片搬进 public/maps 并登记到 demoWorld.js">
            <Button
              size="small"
              icon={<CloudDownloadOutlined />}
              loading={syncing}
              onClick={onSync}
            >
              同步
            </Button>
          </Tooltip>
          <Tooltip title="导入 JSON">
            <Button
              size="small"
              icon={<ImportOutlined />}
              onClick={onImport}
            >
              导入
            </Button>
          </Tooltip>
          <Tooltip title="导出当前地图为 JSON">
            <Button
              size="small"
              icon={<ExportOutlined />}
              onClick={onExport}
            >
              导出
            </Button>
          </Tooltip>
        </div>
      )}

      {editMode !== 'idle' && (
        <div className={`edit-toolbar__hint${iconBlocked ? ' edit-toolbar__hint--warn' : ''}`}>
          <span>{hint}</span>
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={() => onModeChange('idle')}
          />
        </div>
      )}
    </div>
  )
}
