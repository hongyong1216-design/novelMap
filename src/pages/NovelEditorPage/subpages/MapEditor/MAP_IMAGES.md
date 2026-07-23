# 地图图片配置说明

本文档说明 MapEditor 的网格规则、cell 命名以及图片资源的配置方式。

实际网格参数定义在 [`LeafletCanvas/utils/grid.js`](./components/LeafletCanvas/utils/grid.js),
示例数据在 [`LeafletCanvas/data/demoWorld.js`](./components/LeafletCanvas/data/demoWorld.js)。

---

## 1. 网格规格

世界为单层网格 (L0),单格固定 **4096 × 4096** 虚拟像素。

**重叠布局** (借鉴 FrameRonin MapStitch): 相邻格互相重叠 15% (`CELL_OVERLAP`),
格子原点步进为 `CELL_STEP = 4096 × 0.85 = 3481.6` 虚拟像素。
重叠区内容由"AI 参考图"机制保证一致 (见第 7 节),渲染时右/下格覆盖左/上格,接缝不可见。

| 项 | 值 |
|------|------|
| 默认格数 | 32 × 32 |
| 最小格数 | 1 × 1 |
| 最大格数 | 64 × 64 |
| 单格像素 | 4096 (`PX_PER_CELL`) |
| 邻格重叠 | 15% (`CELL_OVERLAP`),步进 3481.6 (`CELL_STEP`) |
| 世界尺寸 | `(格数-1) × 3481.6 + 4096` |
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

cell 图片占据的世界坐标范围 (相邻格互相重叠 15%):

```
左上: (x * 3481.6, y * 3481.6)
右下: (x * 3481.6 + 4096, y * 3481.6 + 4096)
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

---

## 7. AI 生图工作流 (重叠参考图)

点击任意格子会弹出 **AI 生图助手** (`CellPromptModal`):

1. **默认提示词** — 内置的地图补全提示词,可直接编辑。
2. **本格补充提示词** — 填写该格的地形/地标要求 (如"东侧为雪山山脉")。
3. **复制提示词** — 把默认 + 补充拼接后复制到剪贴板。
4. **生成参考图** — 把周边 8 方向 (含对角) 已填充邻居的重叠像素绘制成一张
   2048 × 2048 PNG: **边缘 15% 是邻居真实像素,中间透明**,可预览并下载。

拿参考图 + 提示词到任意 AI 生图工具 (Nano Banana / Gemini 等) 补全透明区,
生成的新图边缘与邻居像素完全一致,放回 `public/maps/` 注册后即与邻居无缝拼接
(重叠区显示时被上层格覆盖,内容一致所以看不出接缝)。

核心算法在 [`utils/refTemplate.js`](./components/LeafletCanvas/utils/refTemplate.js):
邻居整张图按 `(dx, dy) × 0.85 × 画布边长` 偏移绘制,canvas 边界自动裁出重叠带
(移植自 FrameRonin MapStitch 的模板生成逻辑)。

### 重叠区边缘羽化

显示层对重叠区做了**边缘羽化** (移植自 FrameRonin 的 `Aa` 函数,
CSS mask 实现,见 `LeafletCanvas.css` 的 `.cell-feather-*`):

- 渲染顺序右/下格在上,每格的**左边/上边**压住邻居 → 只对这两边羽化;
- 曲线: 距边 0~10% 完全透明 (裁掉本格照抄邻居的部分,露出下层原版),
  10%~15% 线性渐变,15% 以外完整保留;
- 只在该方向存在**已有图片**的邻居时才羽化,地图外缘不发虚。

即使重叠区两张图内容有细微差异 (AI 生成难免),接缝也呈渐变融合而非硬截断线。

> 注意: 旧的"紧邻切片"图片 (母图按格切开的瓦片) 在重叠布局下内容整体错位 15%,
> 羽化只能把接缝糊成过渡带,无法根治内容不连续;这类格子建议按新工作流重新生成,
> 或把 `CELL_OVERLAP` 暂时设为 0 回退。
