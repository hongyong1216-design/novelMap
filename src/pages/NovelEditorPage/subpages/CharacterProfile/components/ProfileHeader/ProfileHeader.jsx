import { Button } from 'antd'
import { PlusOutlined, FilterOutlined } from '@ant-design/icons'
import './ProfileHeader.css'

export default function ProfileHeader({
  title = '角色档案',
  subtitle = 'ARCHIVE_01: CURRENT_ACTIVE_TIMELINE',
  onCreate,
  onFilter,
}) {
  return (
    <header className="profile-header">
      <div className="profile-header__text">
        <h2 className="profile-header__title">{title}</h2>
        <p className="profile-header__subtitle">{subtitle}</p>
      </div>
      <div className="profile-header__actions">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreate}
          className="profile-header__create"
        >
          新建档案
        </Button>
        <Button
          icon={<FilterOutlined />}
          onClick={onFilter}
          className="profile-header__filter"
          aria-label="筛选"
        />
      </div>
    </header>
  )
}
