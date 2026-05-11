import { Menu } from 'antd'
import { useNavigate, useMatch, useParams } from 'react-router-dom'
import {
  EditOutlined,
  GlobalOutlined,
  ApartmentOutlined,
  TeamOutlined,
  BranchesOutlined,
} from '@ant-design/icons'
import './SideMenu.css'

const items = [
  { key: 'content', icon: <EditOutlined />, label: '内容编辑' },
  { key: 'map', icon: <GlobalOutlined />, label: '地图编辑' },
  { key: 'factions', icon: <ApartmentOutlined />, label: '势力编辑' },
  { key: 'characters', icon: <TeamOutlined />, label: '角色档案' },
  { key: 'storyline', icon: <BranchesOutlined />, label: '故事线' },
]

export default function SideMenu() {
  const navigate = useNavigate()
  const { novelId } = useParams()
  const match = useMatch('/editor/:novelId/:tab')
  const selected = match?.params.tab ?? 'content'

  return (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={[selected]}
      items={items}
      onClick={({ key }) => navigate(`/editor/${novelId}/${key}`)}
    />
  )
}
