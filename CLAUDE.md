# NovelMap 项目说明

## 技术栈

- React 18 + Vite
- react-router-dom v7（数据路由：`createBrowserRouter` + `RouterProvider`）
- antd v6（暗色主题）+ @ant-design/icons
- leaflet + react-leaflet（地图编辑器，使用 `L.CRS.Simple` 虚拟坐标系）

## 总体架构

- **页面为主导**：每个页面/子页面占据一个独立目录，所有专属组件、hooks、数据都放在该目录下。
- **小说编辑页是容器页**：左侧 antd `Menu`（位于 antd `Layout.Sider` 中）切换 5 个子页面，子页面通过嵌套路由 + `<Outlet />` 渲染。
- **整体布局全屏**：根 `Layout` 使用 `height: 100vh`，子页面在 `Layout.Content` 内自行滚动。
- **antd 暗色主题**：在 `main.jsx` 顶层用 `ConfigProvider` 注入 `theme.darkAlgorithm` 与 `zh_CN` locale。

---

## 目录结构

```
src/
├── main.jsx                          # ConfigProvider + RouterProvider 入口
├── index.css                         # 全局样式（reset、CSS 变量）
│
├── router/                           # 路由聚合
│   ├── index.js                      # createBrowserRouter(routes)
│   └── routes.js                     # 汇总各页面导出的 route 对象
│
├── theme/
│   └── antdTheme.js                  # antd 暗色主题（darkAlgorithm + token 自定义）
│
├── pages/
│   ├── HomePage/
│   │   ├── index.jsx
│   │   ├── route.jsx                 # { path: '/', element: <HomePage /> }
│   │   ├── HomePage.css
│   │   ├── components/               # Navbar / WelcomeSection / NovelGrid / NovelCard
│   │   ├── hooks/
│   │   └── data/
│   │
│   └── NovelEditorPage/              # 容器页：antd Layout + Sider 菜单 + Outlet
│       ├── index.jsx
│       ├── route.jsx                 # 含 children 子路由
│       ├── NovelEditorPage.css
│       ├── components/
│       │   └── SideMenu/             # 基于 antd Menu，items 接 NavLink
│       │       ├── SideMenu.jsx
│       │       └── SideMenu.css
│       ├── hooks/
│       │   └── useNovel.js
│       ├── data/                     # 跨子页面共享的小说级数据
│       │
│       └── subpages/
│           ├── ContentEditor/        # 小说内容编辑页
│           ├── MapEditor/            # 地图编辑页（Leaflet 实现）
│           │   ├── index.jsx
│           │   ├── route.jsx
│           │   ├── MapEditor.css
│           │   └── components/
│           │       └── LeafletCanvas/
│           │           ├── LeafletCanvas.jsx     # MapContainer + 各层组装
│           │           ├── LeafletCanvas.css
│           │           ├── components/
│           │           │   ├── GridLayer.jsx     # 嵌套网格图层(ImageOverlay 拼接)
│           │           │   ├── WorldRegions.jsx  # 多边形(势力领地)
│           │           │   ├── WorldRoutes.jsx   # 折线(道路/河流/边境)
│           │           │   ├── WorldMarkers.jsx  # 点标记(城市/建筑/地标)
│           │           │   └── WorldLabels.jsx   # 文字标签(纯文本 divIcon)
│           │           ├── hooks/
│           │           │   ├── useMapZoom.js     # 监听 zoom 变化
│           │           │   └── useCellAt.js      # 世界坐标 → 格 ID
│           │           ├── utils/
│           │           │   └── grid.js           # 网格常量 / cellId / 占位 SVG
│           │           └── data/
│           │               └── demoWorld.js      # 网格定义 + cells + 对象数据
│           ├── FactionEditor/        # 势力编辑页
│           ├── CharacterProfile/     # 角色档案页
│           └── StorylineEditor/      # 故事线编辑页
│
├── components/                       # 跨页面通用组件
│   └── FloatingModal/                # 可拖拽/可缩放浮窗
├── hooks/                            # 通用 hook
├── utils/                            # 通用工具
├── data/                             # 跨页面全局数据
└── assets/
```

### 关键约定

1. **页面是边界**：`subpages/<Sub>/` 下的资源默认只服务该子页面。
2. **组件文件夹自包含**：每个组件一个目录，`Component.jsx + Component.css` 就近放置。
3. **路由入口统一 `index.jsx`**：`route.jsx` 只引用页面目录，不关心内部实现。
4. **数据按归属下沉**：模拟数据、配置文件搬到使用方的 `data/` 子目录。

---

## 路由组织

| URL | 页面 |
|-----|------|
| `/` | HomePage |
| `/editor/:novelId` | NovelEditorPage（重定向到 `content`） |
| `/editor/:novelId/content` | ContentEditor |
| `/editor/:novelId/map` | MapEditor |
| `/editor/:novelId/factions` | FactionEditor |
| `/editor/:novelId/characters` | CharacterProfile |
| `/editor/:novelId/storyline` | StorylineEditor |

---

## MapEditor 架构（Leaflet + 四叉树嵌套网格）

### 核心思路

借鉴 Minecraft chunk / Google Maps 瓦片金字塔 / 原神区域加载的"**嵌套网格**"模式：

```
Level 0 (世界级)  : 8×8 = 64 格    单格 4096px  zoom 区间 [-4, 1]
Level 1 (区域级)  : 32×32 = 1024 格 单格 1024px zoom 区间 [1, 3]
Level 2 (地点级)  : 128×128 = 16384格 单格 256px zoom 区间 [3, 5]
```

主世界坐标系 `32768 × 32768` 像素（虚拟单位）。每格唯一 ID：`L{level}-{x}-{y}`。

**优势：**
- 对齐难题消失（几何位置固定）
- 增量扩展（先做核心格，后续慢慢补，未填的显示"未探索"占位）
- 资源结构统一（每格独立图片）
- 任意 zoom 都能放大看精细图（每层用独立高清图）

### Leaflet 配置

- `L.CRS.Simple` 虚拟坐标系，`minZoom: -4 / maxZoom: 5`
- `MapContainer bounds = [[0,0], [32768, 32768]]`
- 每个 cell 用独立 `ImageOverlay` 渲染（不用 Leaflet `L.GridLayer`——它的 tileSize 是为瓦片金字塔设计，不适合"固定网格"语义）
- 对象层（Marker / Polygon / Polyline / Label）用 react-leaflet 原生组件 + `minZoom` 控制显隐

### 资源约定

- 真实图片放 `public/maps/`，命名建议 `L0-3-3.png` / `L1-13-16.jpeg` 等
- 在 `data/demoWorld.js` 的 `IMAGES` 字典里映射 cellId → 路径
- 未映射的填充格 fallback 到内联 SVG 占位（深紫底 + 名称）
- 未探索格 fallback 到内联 SVG 占位（深底 + 虚线边框 + "未探索"）

### 数据模型

```js
demoWorld = {
  cells: {
    'L0-3-3': { filled: true, name: '北境联邦', src: '/maps/L0-3-3.png' },
    'L1-13-16': { filled: true, parent: 'L0-3-4', name: '王城周边' },
    // ...
  },
  markers:  [{ id, type:'city|building|landmark', name, coord:[y,x], minZoom }],
  regions:  [{ id, name, polygon:[[y,x]...], minZoom }],
  routes:   [{ id, name, line:[[y,x]...], style:'solid|dashed', minZoom }],
  labels:   [{ id, text, coord:[y,x], size:'lg|md|sm', minZoom }],
}
```

注意：Leaflet `L.CRS.Simple` 下 LatLng 顺序为 `[lat, lng]`，等价于 `[y, x]`。

---

## 视觉规范

实际项目沿用 `src/index.css` 的紫色调暗色变量（`--bg-primary: #0c0c1d`, `--accent: #6c5ce7`）。`DESIGN.md` 中的 Cobalt Noir 是设计参考，尚未全面落地，新增组件以现有变量为准。

主要规则：

- **暗色为主**：背景 `--bg-primary`，文字 `--text-primary`
- **Accent 用于强调**：`--accent`（主紫）/ `--accent-light`（亮紫）
- **拒绝 pill 圆角**：默认 `4px`，浮层上限 `8px`
- **避免硬边框**：用 surface 阶梯差或半透明 ghost border 代替 1px 实线
- **标签可读性**：文字加深色 text-shadow 避免与背景图争抢

---

## 入口与主题

```jsx
// main.jsx
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { antdTheme } from './theme/antdTheme'
import './index.css'

createRoot(document.getElementById('root')).render(
  <ConfigProvider locale={zhCN} theme={antdTheme}>
    <RouterProvider router={router} />
  </ConfigProvider>
)
```

```js
// theme/antdTheme.js
import { theme } from 'antd'
export const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {},
}
```

---

## NovelEditorPage 容器骨架

```jsx
// pages/NovelEditorPage/index.jsx
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import SideMenu from './components/SideMenu/SideMenu'

export default function NovelEditorPage() {
  return (
    <Layout style={{ height: '100vh' }}>
      <Layout.Sider collapsible>
        <SideMenu />
      </Layout.Sider>
      <Layout.Content style={{ overflow: 'auto' }}>
        <Outlet />
      </Layout.Content>
    </Layout>
  )
}
```

`SideMenu` 是基于 antd `Menu`，items 通过 `useNavigate` 切换路由。
