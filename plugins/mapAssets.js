import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// 开发期小工具, 服务两件事 (浏览器碰不到本地文件, 只能由 dev server 代劳; 生产构建不挂载):
//   1. 点弹窗标题 → 把单格的 IMAGES 条目写回 demoWorld.js
//   2. 点工具栏"同步" → 把下载夹里新生成的成图搬进 public/maps 并登记
// 生产构建不挂载这两个接口。

const API_REGISTER = '/__api/register-cell-image'
const API_SYNC = '/__api/sync-downloads'

const TARGET_FILE =
  'src/pages/NovelEditorPage/subpages/MapEditor/components/LeafletCanvas/data/demoWorld.js'

const MAPS_DIR = 'public/maps'

// 新条目追加到这个块的末尾
const BLOCK_START = 'Object.assign(IMAGES, {'

// 只接受 L0-12-15 这种格 ID 与 /maps/xxx 这种站内路径, 防止把任意内容写进源码
const CELL_ID_RE = /^L\d+-\d+-\d+$/
const SRC_RE = /^\/maps\/[\w.-]+$/

// 文件名开头的格 ID, 例: L0-18-27.png_2K_202608091632.jpeg → L0-18-27
const NAME_CELL_RE = /^(L\d+-\d+-\d+)/
const IMAGE_EXTS = ['.jpeg', '.jpg', '.png', '.webp']

// AI 出图工具常把原名嵌进结果里 (L0-18-27.png_2K_xxx.jpeg), 所以按最终后缀判断类型
const extOf = (name) => path.extname(name).toLowerCase()

const downloadDir = () =>
  process.env.NOVELMAP_DOWNLOAD_DIR || path.join(os.homedir(), 'Downloads')

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 4096) reject(new Error('请求体过大'))
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
        if (url !== API_REGISTER && url !== API_SYNC) return next()
        if (req.method !== 'POST') return sendJson(res, 405, { error: '仅支持 POST' })

        try {
          if (url === API_SYNC) return sendJson(res, 200, syncDownloads(root))

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
