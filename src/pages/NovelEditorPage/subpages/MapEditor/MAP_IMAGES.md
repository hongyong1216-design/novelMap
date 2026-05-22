# 地图图片配置说明

本文档说明 MapEditor 的网格规则、cell 命名以及图片资源的配置方式。

实际网格参数定义在 [`LeafletCanvas/utils/grid.js`](./components/LeafletCanvas/utils/grid.js),
示例数据在 [`LeafletCanvas/data/demoWorld.js`](./components/LeafletCanvas/data/demoWorld.js)。

---

## 1. 网格规格

世界为单层网格 (L0),单格固定 **4096 × 4096** 虚拟像素。

| 项 | 值 |
|------|------|
| 默认格数 | 8 × 8 (世界 32768 × 32768) |
| 最小格数 | 1 × 1 |
| 最大格数 | 32 × 32 (世界 131072 × 131072) |
| 单格像素 | 4096 (`PX_PER_CELL`) |
| zoom 区间 | `[-4, 5]` |

格数可在地图右上角"网格规模"浮层调整:

- **增加**: 世界向右下扩展,已有格保留。
- **减少**: 若有"超出范围"的已填充格,会弹 Modal 确认后再删除;无影响则直接缩小。

---

## 2. cellId 命名规则

格式 `L0-{x}-{y}`:

- `x` — 列索引 (沿世界 X 轴),从 0 开始
- `y` — 行索引 (沿世界 Y 轴),从 0 开始
- 左上角是 `L0-0-0`

cell 占据的世界坐标范围:

```
左上: (x * 4096, y * 4096)
右下: ((x+1) * 4096, (y+1) * 4096)
```

---

## 3. 图片资源

### 存放位置

所有地图图片放在项目根的 [`public/maps/`](../../../../../public/maps/) 目录,
Vite 会自动暴露为 `/maps/xxx.ext`。

### 文件命名

**强烈建议** 用 cellId 作为文件名,例如:

```
public/maps/
├── L0-3-3.png
├── L0-3-4.jpeg
└── L0-4-3.webp
```

后缀可以是 `.png / .jpg / .jpeg / .webp / .svg / .gif`,按实际文件来。

### 建议尺寸

图片会被 Leaflet `ImageOverlay` 拉伸到单格 4096 px,**建议出图分辨率匹配或略大**:

| 用途 | 建议出图分辨率 |
|------|---------------|
| 占位 / 缩略 | 1024 × 1024 |
| 标准 | 2048 × 2048 |
| 高清 (放大不糊) | 4096 × 4096 |

### 注册图片到数据

在 [`LeafletCanvas/data/demoWorld.js`](./components/LeafletCanvas/data/demoWorld.js) 顶部的 `IMAGES` 字典里加一行:

```js
const IMAGES = {
  'L0-3-3': '/maps/L0-3-3.png',
  // ...
}
```

注册后再在 `demoWorld.cells` 里写一项 `cell('L0-3-3', { name: '北境联邦' })` 即可
(`cell()` 工具函数会自动从 `IMAGES` 字典里取 `src`)。

---

## 4. 占位 / 未探索

- **未在 `IMAGES` 中注册但 `cells` 字典里有的格**: 用内联 SVG 渲染 (深紫底 + 名称 + ID),表示"已填充但暂无图片"。
- **`cells` 字典里完全没有的格**: 自动用 SVG 占位渲染 (深底 + 虚线边框 + "未探索")。

占位 SVG 在 [`grid.js`](./components/LeafletCanvas/utils/grid.js) 的 `placeholderSvg()` 中生成,可按需调整配色。

---

## 5. 增量扩展流程

1. **画图** — 按目标 cell 的世界范围作图 (`x:[x*4096, (x+1)*4096], y:[y*4096, (y+1)*4096]`)。
2. **命名** — 文件名用对应 cellId,如 `L0-5-2.png`。
3. **放置** — 丢到 `public/maps/`。
4. **注册** — 在 `demoWorld.js` 的 `IMAGES` 字典里加映射。
5. **声明** — 在 `demoWorld.cells` 加 `cell('L0-5-2', { name: '...' })`。
6. **(可选)** — 添加该格内的 marker / region / route / label,记得 `minZoom` 设在 `[-4, 5]` 区间内。

修改后 Vite HMR 会自动刷新,不需要重启。

---

## 6. 注意

- Leaflet `L.CRS.Simple` 下 `LatLng` 顺序为 `[lat, lng]`,等价于 `[y, x]` —— marker/region/label 的 `coord` 字段是 `[y, x]`,不是 `[x, y]`。
- `regions.polygon` / `routes.line` 同样是 `[y, x]` 数组。
- 调整格数只影响"网格 + cells",已有 marker/region/route/label 的世界坐标不受影响;如果某对象坐标超出新世界,它仍然存在但落在不可达区域。
