# 地图图标资源

工具栏「图标」工具用的图片图标放这里。

## 现有图标

文件名与 `data/mapIcons.js` 里的 `id` 一一对应（`<id>.png`）。

**建筑**（`bld-*`）

| 文件 | 名称 | 内容 |
|---|---|---|
| `bld-classic-polis.png` | 古典城邦 | 白石神庙 + 橘顶民居的希腊式城邦 |
| `bld-walled-palace.png` | 围城王宫 | 紫石围墙、内庭花园与方尖碑 |
| `bld-ring-sanctum.png` | 环墙圣城 | 米黄环形城墙包住中央神殿 |
| `bld-desert-citadel.png` | 沙漠城塞 | 土黄城池，插蓝旗，内有绿庭 |
| `bld-adobe-town.png` | 土坯之城 | 黄土尖塔群，周围沙漠仙人掌 |
| `bld-canyon-palace.png` | 峡谷金宫 | 岩壁环抱中的金顶宫殿 |
| `bld-step-pyramid.png` | 金字塔城 | 草原上的阶梯金字塔群 |
| `bld-lake-pyramids.png` | 湖心金塔 | 湖中金字塔与堤道 |
| `bld-moat-temple.png` | 环水神庙 | 高棉式神庙群，环绕护城水 |
| `bld-cliff-shrine.png` | 崖间神殿 | 山崖石殿与瀑布 |
| `bld-crystal-spires.png` | 晶塔之城 | 冰蓝色水晶尖塔群 |
| `bld-spiral-towers.png` | 螺旋海塔 | 海面上的白色螺旋高塔 |
| `bld-obelisk-ruins.png` | 方尖遗迹 | 沙地中的方尖碑与断柱 |

**自然地标**（`nat-*`）

| 文件 | 名称 | 内容 |
|---|---|---|
| `nat-volcano.png` | 火山 | 黑岩火山口与熔岩流 |
| `nat-ice-crystals.png` | 冰晶簇 | 雪原上的蓝色晶体群 |
| `nat-glow-blooms.png` | 荧花丛 | 发光的蓝紫巨花与菌菇聚落 |

## 怎么加新图标

1. 把图片放进本目录，文件名建议直接用 id，例如 `bld-harbor.png`
2. 打开 `src/pages/NovelEditorPage/subpages/MapEditor/components/LeafletCanvas/data/mapIcons.js`
3. 在对应分类的 `icons` 数组里追加一条：
   ```js
   { id: 'bld-harbor', label: '港口', src: '/map-icons/bld-harbor.png' }
   ```

保存后页面自动生效，不需要改其他代码。
`src` 先留 `''` 也可以——图标栏和地图上会显示虚线占位框，图后面再补。

`id` 会写进标记数据并随 JSON 导出，**定好后不要再改**，否则已放置的标记会找不到图标（退回默认色点）。

## 图片规格建议

| 项 | 建议 |
|---|---|
| 尺寸 | 128×128 或 256×256（正方形） |
| 格式 | 透明底 PNG，或 SVG |
| 内容 | 主体居中、留 8~10% 边距，避免贴边 |
| 风格 | 深色地图上要看得清，浅色描边或高对比主体效果最好 |

地图上按 48×48 渲染（`object-fit: contain`），非正方形图不会变形，但会留白。
