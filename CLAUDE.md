# NovelMap 项目说明

## 技术栈

- React 18 + Vite
- react-router-dom v7（数据路由：`createBrowserRouter` + `RouterProvider`）
- antd v6（暗色主题）+ @ant-design/icons
- konva / react-konva / react-super-tilemap（地图编辑）

## 总体架构

- **页面为主导**：每个页面/子页面占据一个独立目录，所有专属组件、hooks、数据都放在该目录下。
- **小说编辑页是容器页**：左侧 antd `Menu`（位于 antd `Layout.Sider` 中）切换 5 个子页面，子页面通过嵌套路由 + `<Outlet />` 渲染。
- **整体布局全屏**：根 `Layout` 使用 `height: 100vh`，子页面在 `Layout.Content` 内自行滚动。
- **antd 暗色主题**：在 `main.jsx` 顶层用 `ConfigProvider` 注入 `theme.darkAlgorithm` 与 `zh_CN` locale。
- **旧代码归档**：原有 `src/components/`、`src/styles/`、`src/pages/EditorPage.jsx`、`src/data/` 全部移入 `src/_legacy/` 作为搬迁参考，新代码不引用。

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
│   │   ├── components/               # 待迁：Navbar / WelcomeSection / NovelGrid / NovelCard
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
│       ├── data/                     # 跨子页面共享的小说级数据（如角色基础信息）
│       │
│       └── subpages/
│           ├── ContentEditor/        # 小说内容编辑页
│           │   ├── index.jsx
│           │   ├── route.jsx
│           │   ├── ContentEditor.css
│           │   ├── components/       # 待迁：LeftSidebar / EditorToolbar / EditorContent / RightPanel
│           │   ├── hooks/
│           │   └── data/
│           │
│           ├── MapEditor/            # 地图编辑页
│           │   ├── index.jsx         # 模式切换：konva / tilemap
│           │   ├── route.jsx
│           │   ├── MapEditor.css
│           │   ├── components/       # Toolbar / ModeToggle
│           │   ├── KonvaMode/
│           │   │   ├── index.jsx
│           │   │   ├── components/   # LeftPanel / MapCanvas / RightPanel
│           │   │   └── data/         # brushes.js
│           │   └── TilemapMode/
│           │       ├── index.jsx
│           │       ├── components/   # TilemapLeftPanel / TilemapCanvas
│           │       ├── hooks/        # useTilemapStorage / useTilemapShortcuts
│           │       └── data/         # tileset-config / mountains-config / mountain-sprites-config
│           │
│           ├── FactionEditor/        # 势力编辑页
│           │   ├── index.jsx
│           │   ├── route.jsx
│           │   ├── FactionEditor.css
│           │   ├── components/
│           │   ├── hooks/
│           │   └── data/
│           │
│           ├── CharacterProfile/     # 角色档案页
│           │   ├── index.jsx
│           │   ├── route.jsx
│           │   ├── CharacterProfile.css
│           │   ├── components/
│           │   ├── hooks/
│           │   └── data/
│           │
│           └── StorylineEditor/      # 故事线编辑页
│               ├── index.jsx
│               ├── route.jsx
│               ├── StorylineEditor.css
│               ├── components/
│               ├── hooks/
│               └── data/
│
├── components/                       # 跨页面通用组件（先空着，按需上提）
├── hooks/                            # 通用 hook
├── utils/                            # 通用工具
├── data/                             # 跨页面全局数据
├── assets/
│
└── _legacy/                          # 旧代码归档（参考用，新代码不引用）
    ├── App.jsx                       # 原 src/App.jsx（已废弃）
    ├── App.css                       # 原 src/App.css（已废弃）
    ├── components/                   # 原 src/components/
    ├── styles/                       # 原 src/styles/
    ├── pages/
    │   └── EditorPage.jsx            # 原 src/pages/EditorPage.jsx
    └── data/                         # 原 src/data/
```

### 关键约定

1. **页面是边界**：`subpages/<Sub>/` 下的资源默认只服务该子页面。需要跨子页面共享则上提到 `NovelEditorPage/data/`，需要跨页面共享则上提到 `src/data/` 或 `src/components/`。
2. **组件文件夹自包含**：每个组件一个目录，`Component.jsx + Component.css` 就近放置，必要时加 `hooks/`、`utils/`。废弃顶层 `src/styles/`。
3. **路由入口统一 `index.jsx`**：路由文件（`route.jsx`）只引用页面/子页面目录，不关心内部实现。
4. **数据按归属下沉**：模拟数据、配置文件搬到使用方的 `data/` 子目录。
5. **左侧菜单属于容器层**：`SideMenu` 放在 `NovelEditorPage/components/`，不放进任何子页面。

---

## 路由组织

每个页面/子页面在自己目录内导出 `route.jsx`，由 `src/router/routes.js` 聚合。

### 路由表

| URL | 页面 |
|-----|------|
| `/` | HomePage |
| `/editor/:novelId` | NovelEditorPage（重定向到 `content`） |
| `/editor/:novelId/content` | ContentEditor |
| `/editor/:novelId/map` | MapEditor |
| `/editor/:novelId/factions` | FactionEditor |
| `/editor/:novelId/characters` | CharacterProfile |
| `/editor/:novelId/storyline` | StorylineEditor |

### 各层 route.jsx 示例

```jsx
// pages/HomePage/route.jsx
import HomePage from './index'
export default { path: '/', element: <HomePage /> }
```

```jsx
// pages/NovelEditorPage/subpages/ContentEditor/route.jsx
import ContentEditor from './index'
export default { path: 'content', element: <ContentEditor /> }
// map / factions / characters / storyline 同理
```

```jsx
// pages/NovelEditorPage/route.jsx
import { Navigate } from 'react-router-dom'
import NovelEditorPage from './index'
import contentRoute from './subpages/ContentEditor/route'
import mapRoute from './subpages/MapEditor/route'
import factionRoute from './subpages/FactionEditor/route'
import characterRoute from './subpages/CharacterProfile/route'
import storylineRoute from './subpages/StorylineEditor/route'

export default {
  path: '/editor/:novelId',
  element: <NovelEditorPage />,
  children: [
    { index: true, element: <Navigate to="content" replace /> },
    contentRoute, mapRoute, factionRoute, characterRoute, storylineRoute,
  ],
}
```

```js
// router/routes.js
import homeRoute from '../pages/HomePage/route'
import novelEditorRoute from '../pages/NovelEditorPage/route'
export const routes = [homeRoute, novelEditorRoute]
```

```js
// router/index.js
import { createBrowserRouter } from 'react-router-dom'
import { routes } from './routes'
export const router = createBrowserRouter(routes)
```

---

## 视觉规范（Cobalt Noir / Industrial Minimal）

源文档：`DESIGN.md`。下面是把它转译为可直接在 `src/index.css`、`src/theme/antdTheme.js`、组件样式中落地的代码与规则。

### 设计原则

- **No-Line Rule**：禁用 1px 实线边框分隔区域；用 surface 色阶差、留白和微渐变定义边界。
- **Luminance Layering**：通过分层堆叠的 surface 色阶制造"工业钢板"的厚度感，替代传统投影。
- **Ambient Glow**：必须浮起的元素（菜单、上下文面板）使用 32–64px 模糊、`primary` 8% 不透明度的环境光。
- **Ghost Border**：需要容纳感时用 `outline-variant` 15–20% 不透明度虚边，避免实边。
- **不要纯黑 `#000000`**：用 cobalt 偏色的 surface 最深阶替代。
- **不要 pill 圆角**：默认 `0.25rem`（`--radius-1`），浮层上限 `0.5rem`，Tooltip 用 `0` 锐角。
- **不要饱和过载**：cobalt / rust 仅作为"信号"（关键操作、警示），不入正文。

### 颜色（CSS Variables — 写入 `src/index.css`）

```css
:root {
  /* 主题色 */
  --color-primary: #005aff;          /* Deep Cobalt — 关键路径、激活态 */
  --color-primary-hover: #1f6dff;
  --color-secondary: #5d73c0;        /* Periwinkle Steel — 创作工具、元数据 */
  --color-tertiary: #c43801;         /* Rust Oxide — 故事 / 编辑提示 */
  --color-neutral: #757682;          /* Steel Gray — 中性文字 */

  /* Surface 阶梯（暗色，cobalt 偏色） */
  --surface: #0f1218;
  --surface-container-lowest: #0a0c12;   /* 编辑器写作区背景 */
  --surface-container-low: #11141a;      /* 侧栏 / 固定导航 */
  --surface-container: #161922;
  --surface-container-high: #1d2130;     /* 浮动工具栏、属性面板 */
  --surface-container-highest: #252a3b;  /* 浮层之上的卡片 */

  /* On-surface（前景） */
  --on-surface: #e8e9ec;
  --on-surface-variant: #a8aab2;
  --outline-variant: rgba(168, 170, 178, 0.18);

  /* 反色（Tooltip 等） */
  --inverse-surface: #e8e9ec;
  --inverse-on-surface: #11141a;

  /* 容器色（按钮、Chip） */
  --primary-container: #003ec1;
  --on-primary: #ffffff;
  --secondary-container: rgba(93, 115, 192, 0.18);
  --on-secondary-container: #c8d0ee;
}
```

### 字体（CSS Variables — 与上同文件）

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Newsreader:ital,wght@0,400;0,500;0,600;1,400&display=swap');

:root {
  --font-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: 'Newsreader', Georgia, 'Times New Roman', serif;

  --text-display-lg: 3.5rem;       /* 章节大标题（少用，电影感） */
  --text-display: 2.5rem;
  --text-headline: 1.75rem;
  --text-title: 1.25rem;
  --text-body-lg: 1.125rem;        /* 正文 serif（编辑器） */
  --text-body: 1rem;
  --text-label-md: 0.875rem;
  --text-label-sm: 0.6875rem;      /* HUD 元数据：全大写 + 10% 字距 */
}

body {
  font-family: var(--font-display);
  background: var(--surface);
  color: var(--on-surface);
}

/* 写作区 serif，仅用于正文 */
.editor-prose {
  font-family: var(--font-body);
  font-size: var(--text-body-lg);
  line-height: 1.75;
}

/* HUD 元数据 */
.label-hud {
  font-size: var(--text-label-sm);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--on-surface-variant);
}
```

### 圆角 / 间距 / 阴影

```css
:root {
  /* 圆角（无 pill） */
  --radius-sharp: 0;            /* Tooltip 等锐利风 */
  --radius-1: 0.25rem;          /* 默认 */
  --radius-2: 0.5rem;           /* 浮层、卡片上限 */

  /* 间距阶梯（基数 4） */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  /* Ambient 环境光（浮层用） */
  --shadow-ambient-sm: 0 0 32px rgba(0, 90, 255, 0.08);
  --shadow-ambient-lg: 0 0 64px rgba(0, 90, 255, 0.08);

  /* 主按钮 / 光标外发光 */
  --glow-primary-sm: 0 0 10px rgba(0, 90, 255, 0.60);
  --glow-primary-lg: 0 0 24px rgba(0, 90, 255, 0.45);
}
```

### antd Theme Token（写入 `src/theme/antdTheme.js`）

把上述视觉规范同步映射到 antd token，使 antd 组件天然吃这套 design system：

```js
import { theme } from 'antd'

export const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    // 颜色
    colorPrimary: '#005aff',
    colorInfo: '#005aff',
    colorWarning: '#c43801',
    colorError: '#c43801',
    colorTextBase: '#e8e9ec',
    colorBgBase: '#0f1218',
    colorBorder: 'rgba(168, 170, 178, 0.18)',     // Ghost Border
    colorBorderSecondary: 'rgba(168, 170, 178, 0.10)',

    // 字体
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,

    // 圆角（拒绝 pill）
    borderRadius: 4,
    borderRadiusLG: 8,
    borderRadiusSM: 2,

    // Ambient 阴影
    boxShadow: '0 0 32px rgba(0, 90, 255, 0.08)',
    boxShadowSecondary: '0 0 16px rgba(0, 90, 255, 0.06)',
  },
  components: {
    Layout: {
      bodyBg: '#0f1218',
      siderBg: '#11141a',
      headerBg: '#161922',
    },
    Menu: {
      darkItemBg: '#11141a',
      darkSubMenuItemBg: '#11141a',
      darkItemSelectedBg: 'rgba(0, 90, 255, 0.16)',
      darkItemHoverBg: 'rgba(0, 90, 255, 0.08)',
      darkItemSelectedColor: '#ffffff',
    },
    Button: {
      primaryShadow: '0 0 10px rgba(0, 90, 255, 0.55)',
    },
    Tooltip: {
      borderRadius: 0,
      colorBgSpotlight: '#e8e9ec',
      colorTextLightSolid: '#11141a',
    },
    Input: {
      activeBorderColor: '#005aff',
      activeShadow: '0 0 10px rgba(0, 90, 255, 0.45)',
    },
  },
}
```

### 组件视觉规则

| 组件 | 关键规则 |
|------|---------|
| 编辑器写作区 | 背景 `--surface-container-lowest`；正文 `--font-body` + `--text-body-lg` + 行高 1.75；光标 2px 实色块（`--color-primary`）+ 外发光 `--glow-primary-sm` |
| 主按钮 | 填充 `--color-primary`，文字 `--on-primary`；外发光 `--glow-primary-sm`；圆角 `--radius-1` |
| 次按钮 | 透明底 + Ghost Border（`--outline-variant`）；hover 填 `--secondary-container` |
| 文字按钮 | 纯文字；hover 显示 2px `--color-tertiary` 下划线 |
| 输入框 | 仅底边线（无框）；激活态底边换 `--color-primary` 发光（见 Input.activeShadow） |
| 标签 / Chip | 圆角 `--radius-1`；选中 `--secondary-container` 底 + `--on-secondary-container` 字 |
| Tooltip | 反色：`--inverse-surface` 底 + `--inverse-on-surface` 字；圆角 `--radius-sharp` |
| 浮层（菜单、属性面板） | 底色用更高的 surface 阶梯；阴影 `--shadow-ambient-sm/lg` |
| 分隔 | 不要 `border-bottom: 1px solid`；改用 surface 阶梯切换或 `--space-5/6` 留白 |

---

## 入口与主题

### main.jsx

```jsx
import { createRoot } from 'react-dom/client'
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

### theme/antdTheme.js（暗色 + Cobalt Noir）

完整 token 配置见上节《视觉规范 → antd Theme Token》。最简版可先用：

```js
import { theme } from 'antd'

export const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#005aff',
    colorBgBase: '#0f1218',
    colorTextBase: '#e8e9ec',
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
    borderRadius: 4,
  },
}
```

---

## NovelEditorPage 容器骨架

```jsx
// pages/NovelEditorPage/index.jsx
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import SideMenu from './components/SideMenu/SideMenu'
import './NovelEditorPage.css'

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

```jsx
// pages/NovelEditorPage/components/SideMenu/SideMenu.jsx
import { Menu } from 'antd'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import {
  EditOutlined, GlobalOutlined, ApartmentOutlined,
  TeamOutlined, BranchesOutlined,
} from '@ant-design/icons'

const items = [
  { key: 'content',    icon: <EditOutlined />,      label: '内容编辑' },
  { key: 'map',        icon: <GlobalOutlined />,    label: '地图编辑' },
  { key: 'factions',   icon: <ApartmentOutlined />, label: '势力编辑' },
  { key: 'characters', icon: <TeamOutlined />,      label: '角色档案' },
  { key: 'storyline',  icon: <BranchesOutlined />,  label: '故事线' },
]

export default function SideMenu() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { novelId } = useParams()
  const selected = pathname.split('/').pop()

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
```

---

## 旧代码搬迁映射（_legacy → 新位置）

| 旧位置 | 新位置 |
|--------|--------|
| `_legacy/components/Navbar.jsx` + `_legacy/styles/Navbar.css` | `pages/HomePage/components/Navbar/` |
| `_legacy/components/WelcomeSection.jsx` + `_legacy/styles/WelcomeSection.css` | `pages/HomePage/components/WelcomeSection/` |
| `_legacy/components/NovelGrid.jsx` + `_legacy/styles/NovelGrid.css` | `pages/HomePage/components/NovelGrid/` |
| `_legacy/components/NovelCard.jsx` + `_legacy/styles/NovelCard.css` | `pages/HomePage/components/NovelCard/` |
| `_legacy/data/novels.js` | `pages/HomePage/data/novels.js`（如编辑页也用，则提到 `src/data/`） |
| `_legacy/components/editor/LeftSidebar.*` | `pages/NovelEditorPage/subpages/ContentEditor/components/LeftSidebar/` |
| `_legacy/components/editor/EditorToolbar.*` | `…/ContentEditor/components/EditorToolbar/` |
| `_legacy/components/editor/EditorContent.*` | `…/ContentEditor/components/EditorContent/` |
| `_legacy/components/editor/RightPanel.*` | `…/ContentEditor/components/RightPanel/` |
| `_legacy/components/editor/MapEditor.*` | `pages/NovelEditorPage/subpages/MapEditor/index.jsx` |
| `_legacy/components/editor/map-editor/Toolbar.jsx` | `…/MapEditor/components/Toolbar/` |
| `_legacy/components/editor/map-editor/{LeftPanel,MapCanvas,RightPanel}.jsx` | `…/MapEditor/KonvaMode/components/` |
| `_legacy/components/editor/map-editor/Tilemap*.jsx` | `…/MapEditor/TilemapMode/components/` |
| `_legacy/components/editor/map-editor/data.js` | `…/MapEditor/KonvaMode/data/brushes.js` |
| `_legacy/components/editor/map-editor/icons.jsx` | `…/MapEditor/components/icons.jsx` |
| `_legacy/data/tileset-config.js` / `mountains-config.js` / `mountain-sprites-config.js` | `…/MapEditor/TilemapMode/data/` |
| `_legacy/styles/EditorPage.css` | `pages/NovelEditorPage/NovelEditorPage.css`（按需拆到子页面） |
| `_legacy/pages/EditorPage.jsx` 内联的 `novelsData/characters/timelineEntries/outlineData` | 按归属拆到对应子页面或 `NovelEditorPage/data/` |
| `_legacy/pages/EditorPage.jsx` 中的 tilemap 快捷键、localStorage 逻辑 | `…/TilemapMode/hooks/useTilemapShortcuts.js` 与 `useTilemapStorage.js` |

### 持久化

- 瓦片地图数据通过 `localStorage`（key：`novelmap_tilemap_data`）保存，搬迁后封装到 `useTilemapStorage` hook。

### 快捷键（地图编辑页 tilemap 模式）

- `Ctrl/Cmd + S` —— 保存
- `Ctrl/Cmd + Z` / `Ctrl/Cmd + Shift + Z` —— 撤销 / 重做
- `Ctrl/Cmd + =` / `Ctrl/Cmd + -` —— 放大 / 缩小
- `B` / `E` / `G` / `I` —— 画笔 / 橡皮 / 填充 / 吸色器

---

## 实施步骤

1. **装依赖 + 归档旧代码**
   - `npm i antd @ant-design/icons`
   - `git mv src/components src/_legacy/components`
   - `git mv src/styles src/_legacy/styles`
   - `git mv src/pages/EditorPage.jsx src/_legacy/pages/EditorPage.jsx`
   - `git mv src/data src/_legacy/data`
2. **建骨架**：按目录树新建空文件夹与占位 `index.jsx`（每个子页面先 `return <div>子页面名</div>`），写各自的 `route.jsx`、`router/index.js`、`router/routes.js`、`theme/antdTheme.js`。
3. **接通路由**：改写 `main.jsx`（包 `ConfigProvider` + `RouterProvider`），废弃旧 `App.jsx`（已归档至 `_legacy`）。
4. **跑通**：`npm run dev`，验证首页 → 5 个子路由切换、刷新、前进后退正常。
5. **逐个搬迁**：HomePage → ContentEditor → MapEditor → FactionEditor / CharacterProfile / StorylineEditor。每搬一个跑一次确认无回归。边搬边把手写样式替换为 antd 组件 + 必要的 `<Name>.css` 微调。
6. **清理**：所有新代码不再引用 `_legacy` 后，整体删除 `src/_legacy/`。
