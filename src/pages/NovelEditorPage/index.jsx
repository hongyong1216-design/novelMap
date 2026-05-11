import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import SideMenu from './components/SideMenu/SideMenu'
import './NovelEditorPage.css'

export default function NovelEditorPage() {
  return (
    <Layout className="novel-editor-page">
      <Layout.Sider collapsible width={200} className="novel-editor-sider">
        <SideMenu />
      </Layout.Sider>
      <Layout.Content className="novel-editor-content">
        <Outlet />
      </Layout.Content>
    </Layout>
  )
}
