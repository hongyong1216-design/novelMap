import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// 开发期小工具, 服务三件事 (浏览器碰不到本地文件, 只能由 dev server 代劳; 生产构建不挂载):
//   1. 点弹窗标题 → 把单格的 IMAGES 条目写回 demoWorld.js
//   2. 点工具栏"同步" → 把下载夹里新生成的成图搬进 public/maps 并登记
//   3. 点子地图窗口"保存到项目" → 把这张子地图连同它所属的标记写进 data/subMaps.json
// 生产构建不挂载这些接口。

const API_REGISTER = '/__api/register-cell-image'
const API_SYNC = '/__api/sync-downloads'
const API_SAVE_SUB_MAP = '/__api/save-sub-map'

const TARGET_FILE =
  'src/pages/NovelEditorPage/subpages/MapEditor/components/LeafletCanvas/data/demoWorld.js'

// 子地图存 JSON 而不是 .js: 名称是用户随手输的, 交给 JSON.stringify 转义比自己拼源码安全
const SUB_MAPS_FILE =
  'src/pages/NovelEditorPage/subpages/MapEditor/components/LeafletCanvas/data/subMaps.json'

const MAPS_DIR = 'public/maps'

// 新条目追加到这个块的末尾
const BLOCK_START = 'Object.assign(IMAGES, {'

// 只接受 L0-12-15 这种格 ID 与 /maps/xxx 这种站内路径, 防止把任意内容写进源码
const CELL_ID_RE = /^L\d+-\d+-\d+$/
const SRC_RE = /^\/maps\/[\w.-]+$/

// 子地图落盘时的校验: 站内路径 / 合法 id / 规模上限
const MARKER_ID_RE = /^[\w-]{1,64}$/
const ASSET_SRC_RE = /^\/[\w./-]{1,180}$/
const SUB_GRID_MIN = 2
const SUB_GRID_MAX = 8
const MAX_CELLS = 256
const MAX_OBJECTS = 256

// 文件名开头的格 ID, 例: L0-18-27.png_2K_202608091632.jpeg → L0-18-27
const NAME_CELL_RE = /^(L\d+-\d+-\d+)/
const IMAGE_EXTS = ['.jpeg', '.jpg', '.png', '.webp']

// AI 出图工具常把原名嵌进结果里 (L0-18-27.png_2K_xxx.jpeg), 所以按最终后缀判断类型
const extOf = (name) => path.extname(name).toLowerCase()

const downloadDir = () =>
  process.env.NOVELMAP_DOWNLOAD_DIR || path.join(os.homedir(), 'Downloads')

const readBody = (req, limit = 4096) =>
  new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > limit) reject(new Error('请求体过大'))
    })
    req.on('end', () => resolve(raw))
    req.on('error', reject)
  })

const sendJson = (res, status, payload) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

// 定位 Object.assign(IMAGES, { ... }) 这一块的正文范围
function imagesBlockOf(source) {
  const eol = source.includes('\r\n') ? '\r\n' : '\n'

  const start = source.indexOf(BLOCK_START)
  if (start === -1) throw new Error(`未找到 ${BLOCK_START} 代码块`)

  // 块结束标志: 行首的 })
  const endMatch = new RegExp(`${eol}\\}\\)`).exec(source.slice(start))
  if (!endMatch) throw new Error('未找到 IMAGES 代码块的结束位置')

  return { eol, start, end: start + endMatch.index }
}

// 把 'L0-18-27': '/maps/L0-18-27.jpeg', 插到 IMAGES 块的最后一行之后
function insertEntry(source, cellId, src) {
  const { eol, end } = imagesBlockOf(source)
  return source.slice(0, end) + `${eol}  '${cellId}': '${src}',` + source.slice(end)
}

// 必须只在 IMAGES 块内找: ZT_NAMES 里的名字条目 ('L0-14-13': '珉西岭') 长得一模一样,
// 全文搜会把"只有名字没有图"的格子误判成已登记, 图片同步进去却不显示
function isRegistered(source, cellId) {
  const { start, end } = imagesBlockOf(source)
  return new RegExp(`'${cellId}'\\s*:`).test(source.slice(start, end))
}

// public/maps 下这一格是否已经有图 (不限后缀)
const findExistingImage = (mapsDir, cellId) =>
  IMAGE_EXTS.map((ext) => `${cellId}${ext}`).find((name) => fs.existsSync(path.join(mapsDir, name)))

// 扫描下载夹, 每格只留最新的一份成图
function collectCandidates(dir) {
  const picked = new Map() // cellId → { name, mtimeMs, size, ext }
  let refSkipped = 0

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile()) continue

    const cellId = NAME_CELL_RE.exec(entry.name)?.[1]
    if (!cellId) continue

    const ext = extOf(entry.name)
    if (!IMAGE_EXTS.includes(ext)) continue

    // 排除我们自己导出的邻居参考图 (中间是透明待补区, 当成图同步进去会毁掉这一格)
    if (entry.name === `${cellId}.png`) {
      refSkipped += 1
      continue
    }

    const stat = fs.statSync(path.join(dir, entry.name))
    const prev = picked.get(cellId)
    // 同一格反复出图时以最后一次为准
    if (!prev || stat.mtimeMs > prev.mtimeMs) {
      picked.set(cellId, { name: entry.name, mtimeMs: stat.mtimeMs, size: stat.size, ext })
    }
  }

  return { picked, refSkipped }
}

function syncDownloads(root) {
  const dir = downloadDir()
  if (!fs.existsSync(dir)) throw new Error(`下载目录不存在: ${dir}`)

  const mapsDir = path.join(root, MAPS_DIR)
  fs.mkdirSync(mapsDir, { recursive: true })

  const filePath = path.join(root, TARGET_FILE)
  let source = fs.readFileSync(filePath, 'utf8')

  const { picked, refSkipped } = collectCandidates(dir)
  const results = []

  // 按格 ID 排序, 让结果列表稳定好读
  for (const [cellId, info] of [...picked].sort(([a], [b]) => a.localeCompare(b))) {
    const existing = findExistingImage(mapsDir, cellId)
    const registered = isRegistered(source, cellId)

    // 图片在、条目也在 → 这一格早就同步过了
    if (existing && registered) {
      results.push({ cellId, from: info.name, action: 'skipped', to: existing })
      continue
    }

    const target = existing || `${cellId}${info.ext}`
    if (!existing) {
      fs.copyFileSync(path.join(dir, info.name), path.join(mapsDir, target))
    }
    if (!registered) {
      source = insertEntry(source, cellId, `/${path.posix.join('maps', target)}`)
    }

    results.push({
      cellId,
      from: info.name,
      to: target,
      size: info.size,
      // 补文件 / 补登记 / 全新, 三种都算同步成功, 但分开报给用户看
      action: existing ? 'registered' : registered ? 'copied' : 'synced',
    })
  }

  if (results.some((r) => r.action !== 'skipped')) {
    fs.writeFileSync(filePath, source, 'utf8')
  }

  return { dir, refSkipped, results }
}

// ---- 子地图落盘 ----
// 写的是 JSON, 不存在"拼进源码"的注入面; 这里的校验只为两件事:
// 别写出一个撑爆的文件, 别写出让前端 import 后崩掉的形状。
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null)
const text = (v, max) => String(v ?? '').slice(0, max)

const cleanCoord = (coord) => {
  const y = num(coord?.[0])
  const x = num(coord?.[1])
  if (y === null || x === null) throw new Error(`坐标不合法: ${JSON.stringify(coord)}`)
  return [y, x]
}

const cleanSrc = (src) => {
  const value = String(src || '')
  if (!value) return ''
  if (!ASSET_SRC_RE.test(value)) throw new Error(`图片路径不合法: ${value}`)
  return value
}

function cleanSubMap(sub) {
  const gridSize = num(sub?.gridSize)
  if (!Number.isInteger(gridSize) || gridSize < SUB_GRID_MIN || gridSize > SUB_GRID_MAX) {
    throw new Error(`网格规模不合法: ${sub?.gridSize}`)
  }

  const cellEntries = Object.entries(sub?.cells || {})
  const markers = Array.isArray(sub?.markers) ? sub.markers : []
  const labels = Array.isArray(sub?.labels) ? sub.labels : []
  if (cellEntries.length > MAX_CELLS) throw new Error(`格子数量超出上限 ${MAX_CELLS}`)
  if (markers.length + labels.length > MAX_OBJECTS) {
    throw new Error(`标记 / 标签数量超出上限 ${MAX_OBJECTS}`)
  }

  const cells = {}
  for (const [key, cell] of cellEntries) {
    if (!CELL_ID_RE.test(key)) throw new Error(`格 ID 不合法: ${key}`)
    cells[key] = { filled: true, name: text(cell?.name, 80), src: cleanSrc(cell?.src) }
  }

  return {
    gridSize,
    cells,
    markers: markers.map((m) => ({
      id: text(m?.id, 64),
      name: text(m?.name, 80),
      iconId: text(m?.iconId, 64),
      coord: cleanCoord(m?.coord),
    })),
    labels: labels.map((lb) => ({
      id: text(lb?.id, 64),
      text: text(lb?.text, 120),
      size: ['lg', 'md', 'sm'].includes(lb?.size) ? lb.size : 'md',
      coord: cleanCoord(lb?.coord),
    })),
  }
}

// 子地图连它所属的标记一起存: 只存子地图的话, 换台机器 / 清了 localStorage 之后
// 这张图就没有入口可以点开了
function cleanMarker(marker) {
  if (!MARKER_ID_RE.test(marker?.id || '')) throw new Error(`标记 ID 不合法: ${marker?.id}`)
  const cleaned = {
    id: marker.id,
    name: text(marker?.name, 80),
    iconId: text(marker?.iconId, 64),
    coord: cleanCoord(marker?.coord),
  }
  if (num(marker?.minZoom) !== null) cleaned.minZoom = num(marker.minZoom)
  if (num(marker?.maxZoom) !== null) cleaned.maxZoom = num(marker.maxZoom)
  return cleaned
}

function saveSubMap(root, { marker, subMap }) {
  const cleanedMarker = cleanMarker(marker)
  const cleanedSubMap = cleanSubMap(subMap)

  const filePath = path.join(root, SUB_MAPS_FILE)
  let store = {}
  if (fs.existsSync(filePath)) {
    try {
      store = JSON.parse(fs.readFileSync(filePath, 'utf8')) || {}
    } catch {
      throw new Error(`${SUB_MAPS_FILE} 不是合法 JSON, 请先修好或删掉它`)
    }
  }

  const existed = Boolean(store[cleanedMarker.id])
  store[cleanedMarker.id] = { marker: cleanedMarker, subMap: cleanedSubMap }

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(store, null, 2)}\n`, 'utf8')

  // 图片路径写进去了, 但文件可能还没放; 一并报回去免得保存完一片空白还找不到原因
  const missingImages = Object.values(cleanedSubMap.cells)
    .map((c) => c.src)
    .filter((src) => src && !fs.existsSync(path.join(root, 'public', src.replace(/^\//, ''))))

  return {
    status: existed ? 'updated' : 'added',
    file: SUB_MAPS_FILE,
    cellCount: Object.keys(cleanedSubMap.cells).length,
    markerCount: cleanedSubMap.markers.length,
    labelCount: cleanedSubMap.labels.length,
    missingImages,
  }
}

export default function mapAssets() {
  let root = process.cwd()

  return {
    name: 'novelmap:map-assets',
    apply: 'serve',

    configResolved(config) {
      root = config.root
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== API_REGISTER && url !== API_SYNC && url !== API_SAVE_SUB_MAP) return next()
        if (req.method !== 'POST') return sendJson(res, 405, { error: '仅支持 POST' })

        try {
          if (url === API_SYNC) return sendJson(res, 200, syncDownloads(root))

          if (url === API_SAVE_SUB_MAP) {
            // 一张子地图带着几十个格子和对象, 4KB 不够用
            const payload = JSON.parse(await readBody(req, 256 * 1024))
            return sendJson(res, 200, saveSubMap(root, payload))
          }

          const { cellId, src } = JSON.parse(await readBody(req))

          if (!CELL_ID_RE.test(cellId || '')) {
            return sendJson(res, 400, { error: `格 ID 不合法: ${cellId}` })
          }
          if (!SRC_RE.test(src || '')) {
            return sendJson(res, 400, { error: `图片路径不合法: ${src}` })
          }

          const filePath = path.join(root, TARGET_FILE)
          const source = fs.readFileSync(filePath, 'utf8')

          // 已注册过就不重复插入, 保持幂等
          if (isRegistered(source, cellId)) {
            return sendJson(res, 200, { status: 'already', cellId, src })
          }

          fs.writeFileSync(filePath, insertEntry(source, cellId, src), 'utf8')

          // 顺带告诉前端图片文件在不在, 免得注册完还是一片空白
          const fileExists = fs.existsSync(path.join(root, 'public', src.replace(/^\//, '')))
          return sendJson(res, 200, { status: 'added', cellId, src, fileExists })
        } catch (err) {
          return sendJson(res, 500, { error: String(err?.message || err) })
        }
      })
    },
  }
}
