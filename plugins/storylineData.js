import fs from 'node:fs'
import path from 'node:path'

// 开发期小工具: 故事线编辑器点工具栏"保存" → 把画布上的节点与连线写回项目文件。
// 浏览器碰不到本地文件, 只能由 dev server 代劳; 生产构建不挂载这个接口。
//
// 存 JSON 而不是写回 storyline.js: 章节名 / 标题 / 正文都是用户随手输的,
// 交给 JSON.stringify 转义比自己拼源码安全。

const API_SAVE = '/__api/save-storyline'

const TARGET_FILE =
  'src/pages/NovelEditorPage/subpages/StorylineEditor/data/storyline.json'

// 落盘校验只为两件事: 别写出一个撑爆的文件, 别写出让前端 import 后崩掉的形状
const ID_RE = /^[\w-]{1,64}$/
const SIDES = ['top', 'right', 'bottom', 'left']
const MAX_NODES = 500
const MAX_EDGES = 1000
const MAX_TAGS = 12

// 按 Buffer 收再一次性解码: 正文可以写几千字, body 会拆成多个 chunk 送达,
// 逐块 toString 会把跨块边界的那个中文字解成乱码
const readBody = (req, limit = 2 * 1024 * 1024) =>
  new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error('请求体过大'))
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })

const sendJson = (res, status, payload) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null)
const text = (v, max) => String(v ?? '').slice(0, max)

function cleanNode(node) {
  if (!ID_RE.test(node?.id || '')) throw new Error(`节点 ID 不合法: ${node?.id}`)

  const x = num(node?.x)
  const y = num(node?.y)
  if (x === null || y === null) {
    throw new Error(`节点坐标不合法: ${node.id} (${node?.x}, ${node?.y})`)
  }

  const tags = Array.isArray(node?.tags) ? node.tags : []

  return {
    id: node.id,
    act: text(node?.act, 40),
    title: text(node?.title, 120),
    desc: text(node?.desc, 4000),
    tags: tags.slice(0, MAX_TAGS).map((t) => text(t, 24)),
    // 拖动落点带小数, 取整让文件 diff 干净
    x: Math.round(x),
    y: Math.round(y),
  }
}

// 端点合法 = ID 规范 + 挂在真实存在的节点上 + 连接点是四边之一
const cleanEnd = (end, nodeIds) =>
  ID_RE.test(end?.nodeId || '') && nodeIds.has(end.nodeId) && SIDES.includes(end?.side)
    ? { nodeId: end.nodeId, side: end.side }
    : null

function cleanStoryline(payload) {
  const rawNodes = Array.isArray(payload?.nodes) ? payload.nodes : []
  const rawEdges = Array.isArray(payload?.edges) ? payload.edges : []
  if (rawNodes.length > MAX_NODES) throw new Error(`节点数量超出上限 ${MAX_NODES}`)
  if (rawEdges.length > MAX_EDGES) throw new Error(`连线数量超出上限 ${MAX_EDGES}`)

  const nodes = rawNodes.map(cleanNode)
  const nodeIds = new Set(nodes.map((n) => n.id))

  // 悬空连线直接丢: 删节点时连线未必跟着删干净, 存进去只会一直脏下去
  const edges = []
  for (const edge of rawEdges) {
    if (!ID_RE.test(edge?.id || '')) continue
    const from = cleanEnd(edge?.from, nodeIds)
    const to = cleanEnd(edge?.to, nodeIds)
    if (from && to) edges.push({ id: edge.id, from, to })
  }

  return { nodes, edges, droppedEdges: rawEdges.length - edges.length }
}

function saveStoryline(root, payload) {
  const { nodes, edges, droppedEdges } = cleanStoryline(payload)

  const filePath = path.join(root, TARGET_FILE)
  const store = { savedAt: new Date().toISOString(), nodes, edges }

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(store, null, 2)}\n`, 'utf8')

  return {
    file: TARGET_FILE,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    droppedEdges,
  }
}

export default function storylineData() {
  let root = process.cwd()

  return {
    name: 'novelmap:storyline-data',
    apply: 'serve',

    configResolved(config) {
      root = config.root
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split('?')[0] !== API_SAVE) return next()
        if (req.method !== 'POST') return sendJson(res, 405, { error: '仅支持 POST' })

        try {
          const payload = JSON.parse(await readBody(req))
          return sendJson(res, 200, saveStoryline(root, payload))
        } catch (err) {
          return sendJson(res, 500, { error: String(err?.message || err) })
        }
      })
    },
  }
}
