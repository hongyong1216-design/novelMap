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
  onImport,
  onExport,
  onSync,
  syncing = false,
}) {
  const toggle = (mode) => onModeChange(editMode === mode ? 'idle' : mode)

  return (
    <div className={`edit-toolbar${iconPanelOpen ? ' edit-toolbar--expanded' : ''}`}>
      <div className="edit-toolbar__label">地图编辑</div>

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
        <Tooltip title="展开图标栏, 把图片图标拖到地图上">
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
        <IconPanel selectedId={selectedIconId} onSelect={onSelectIcon} />
      )}

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

      {editMode !== 'idle' && (
        <div className="edit-toolbar__hint">
          <span>{MODE_HINT[editMode]}</span>
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
