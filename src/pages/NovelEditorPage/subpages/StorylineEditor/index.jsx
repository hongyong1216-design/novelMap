import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Modal, message } from 'antd'
import CanvasToolbar from './components/CanvasToolbar/CanvasToolbar'
import StoryCanvas from './components/StoryCanvas/StoryCanvas'
import CanvasFooter from './components/CanvasFooter/CanvasFooter'
import NodeEditModal from './components/NodeEditModal/NodeEditModal'
import {
  storyNodes as seedNodes,
  storyEdges as seedEdges,
  canvasStatus,
} from './data/storyline'
import savedStoryline from './data/storyline.json'
import { NODE_W, NODE_H } from './utils/geometry'
import './StorylineEditor.css'

// data/storyline.json 由工具栏的「保存」写入 (dev server 代笔, 见 plugins/storylineData.js)。
// 还没保存过时它是 {}, 此时用 storyline.js 里的种子数据开局。
const savedNodes = Array.isArray(savedStoryline?.nodes) ? savedStoryline.nodes : null
const savedEdges = Array.isArray(savedStoryline?.edges) ? savedStoryline.edges : null

/** 从视口中心开始找一个不压住已有节点的空位 */
function findFreeSpot(center, existing) {
  let x = Math.round(center.x - NODE_W / 2)
  let y = Math.round(center.y - NODE_H / 2)
  const overlaps = (px, py) =>
    existing.some(
      (n) =>
        Math.abs(n.x - px) < NODE_W + 24 && Math.abs(n.y - py) < NODE_H + 24,
    )
  for (let i = 0; overlaps(x, y) && i < 60; i++) {
    x += 40
    y += 40
  }
  return { x, y }
}

export default function StorylineEditor() {
  const [nodes, setNodes] = useState(savedNodes ?? seedNodes)
  const [edges, setEdges] = useState(savedEdges ?? seedEdges)
  const [zoom, setZoom] = useState(Math.round(0.85 * 100))
  // nodeId 为 null 表示新增
  const [modal, setModal] = useState({ open: false, mode: 'view', nodeId: null })
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  // 由画布回填，用来把新节点放在当前视口中间
  const viewportRef = useRef(null)

  // 节点 / 连线一动就算有未保存改动；首次挂载不算
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    setDirty(true)
  }, [nodes, edges])

  const handleScaleChange = useCallback((scale) => {
    setZoom(Math.round(scale * 100))
  }, [])

  const editingNode = useMemo(
    () => nodes.find((n) => n.id === modal.nodeId) || null,
    [nodes, modal.nodeId],
  )

  const openView = (node) =>
    setModal({ open: true, mode: 'view', nodeId: node.id })

  const openCreate = () => setModal({ open: true, mode: 'edit', nodeId: null })

  const closeModal = () => setModal((m) => ({ ...m, open: false }))

  const switchToEdit = () => setModal((m) => ({ ...m, mode: 'edit' }))

  const handleNodeMove = useCallback((id, x, y) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x, y } : n)),
    )
  }, [])

  const handleConnect = useCallback((from, to) => {
    setEdges((prev) => {
      const same = (a, b) => a.nodeId === b.nodeId && a.side === b.side
      const exists = prev.some(
        (e) =>
          (same(e.from, from) && same(e.to, to)) ||
          (same(e.from, to) && same(e.to, from)),
      )
      if (exists) {
        message.info('这两个连接点已经连过了')
        return prev
      }
      return [...prev, { id: `e${Date.now()}`, from, to }]
    })
  }, [])

  const handleDeleteEdge = useCallback((id) => {
    setEdges((prev) => prev.filter((e) => e.id !== id))
    message.success('已删除连线')
  }, [])

  // 删节点连它身上的连线一起删，不留悬空的线头
  const handleDeleteNode = () => {
    const node = editingNode
    if (!node) return

    const linked = edges.filter(
      (e) => e.from.nodeId === node.id || e.to.nodeId === node.id,
    ).length

    Modal.confirm({
      title: `删除「${node.title}」？`,
      content: linked
        ? `这个节点上还挂着 ${linked} 条连线，会一并删掉。删除后无法撤销。`
        : '删除后无法撤销。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setNodes((prev) => prev.filter((n) => n.id !== node.id))
        setEdges((prev) =>
          prev.filter(
            (e) => e.from.nodeId !== node.id && e.to.nodeId !== node.id,
          ),
        )
        closeModal()
        message.success(`已删除 ${node.title}`)
      },
    })
  }

  const handleSubmit = (values) => {
    if (modal.nodeId) {
      setNodes((prev) =>
        prev.map((n) => (n.id === modal.nodeId ? { ...n, ...values } : n)),
      )
      message.success(`已保存 ${values.title}`)
    } else {
      // 新节点落在视口中间的空位上，且不带任何连线
      const center = viewportRef.current?.() ?? { x: 400, y: 300 }
      setNodes((prev) => [
        ...prev,
        { id: `n${Date.now()}`, ...values, ...findFreeSpot(center, prev) },
      ])
      message.success(`已新增 ${values.title}，点连接点即可接入故事线`)
    }
    closeModal()
  }

  // 保存到项目: 把当前画布写进 data/storyline.json —— 刷新 / 换台机器都还在, 且能提交进 git
  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      const res = await fetch('/__api/save-storyline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)

      setDirty(false)
      const dropped = data.droppedEdges
        ? `，丢弃 ${data.droppedEdges} 条悬空连线`
        : ''
      message.success(
        `已保存到 ${data.file}（${data.nodeCount} 节点 / ${data.edgeCount} 连线${dropped}）`,
      )
    } catch (err) {
      Modal.error({
        title: '保存失败',
        content: `${String(err?.message || err)}（该功能依赖 dev server，需用 npm run dev 启动）`,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="storyline-editor">
      <div className="storyline-editor__bg-glow storyline-editor__bg-glow--primary" />
      <div className="storyline-editor__bg-glow storyline-editor__bg-glow--tertiary" />

      <CanvasToolbar
        version={canvasStatus.version}
        syncLabel={dirty ? '状态: 有未保存改动' : canvasStatus.syncLabel}
        onAddNode={openCreate}
        onSave={handleSave}
        saving={saving}
        dirty={dirty}
      />

      <StoryCanvas
        nodes={nodes}
        edges={edges}
        selectedId={modal.open ? modal.nodeId : null}
        onSelect={openView}
        onNodeMove={handleNodeMove}
        onConnect={handleConnect}
        onDeleteEdge={handleDeleteEdge}
        onScaleChange={handleScaleChange}
        viewportRef={viewportRef}
      />

      <CanvasFooter
        zoom={zoom}
        ready={canvasStatus.ready}
        charCount={canvasStatus.charCount}
      />

      <NodeEditModal
        open={modal.open}
        node={editingNode}
        mode={modal.mode}
        onEdit={switchToEdit}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        onDelete={handleDeleteNode}
      />
    </div>
  )
}
