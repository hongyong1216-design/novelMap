import { Button, Input } from 'antd'
import {
  ExperimentOutlined,
  ApartmentOutlined,
  EyeInvisibleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { FACTION_STATUS } from '../../data/factions'
import './DetailHeader.css'

const ICON_MAP = {
  water: <ExperimentOutlined />,
  iron:  <ApartmentOutlined />,
  void:  <EyeInvisibleOutlined />,
  default: <ThunderboltOutlined />,
}

export default function DetailHeader({
  faction,
  onChange,
  onDelete,
  onSave,
}) {
  const status = FACTION_STATUS[faction.status] || FACTION_STATUS.neutral
  const icon = ICON_MAP[faction.iconKey] || ICON_MAP.default

  return (
    <header className="detail-header">
      <div className="detail-header__icon">
        <span className="detail-header__icon-inner">{icon}</span>
      </div>

      <div className="detail-header__meta">
        <Input
          value={faction.name}
          onChange={(e) => onChange?.({ name: e.target.value })}
          placeholder="势力名称"
          variant="borderless"
          className="detail-header__name"
        />
        <div className="detail-header__sub">
          <span className="detail-header__status">
            <span
              className="detail-header__status-dot"
              style={{ backgroundColor: status.dotColor }}
            />
            <span className="detail-header__status-label">
              状态: {status.label}
            </span>
          </span>
          <span className="detail-header__divider" />
          <span className="detail-header__status-label">
            ID: {faction.id}
          </span>
        </div>
      </div>

      <div className="detail-header__actions">
        <Button onClick={onDelete} className="detail-header__btn">
          删除
        </Button>
        <Button
          type="primary"
          onClick={onSave}
          className="detail-header__btn detail-header__btn--primary"
        >
          保存更改
        </Button>
      </div>
    </header>
  )
}
