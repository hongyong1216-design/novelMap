import { useEffect, useRef, useState } from 'react'
import { Modal, Input, Button, Space, Tag, Tooltip, Typography, message } from 'antd'
import { CopyOutlined, PictureOutlined, DownloadOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons'
import { parseCellId } from '../../utils/grid'
import { buildRefTemplate, filledNeighborsOf, downloadBlob } from '../../utils/refTemplate'
import { DEFAULT_PROMPT, composePrompt } from './prompts'
import './CellPromptModal.css'

const { Text } = Typography

// 点击格子后的 AI 生图助手弹窗:
// 默认提示词(可改) + 本格补充提示词 + 复制提示词 + 生成邻居重叠参考图
//
// 两种登记模式 (提示词 / 参考图部分完全一样):
//   世界地图 —— 点标题把 IMAGES 条目写进 demoWorld.js (浏览器写不了文件, 由 dev server 代劳)
//   子地图   —— 传入 onSaveCell 即切到"就地登记": 名称 / 图片路径直接存进这张子地图的数据,
//               不碰源码也不需要 dev server
export default function CellPromptModal({
  open,
  cellId,
  cell,
  cells,
  defaultSrc,
  onSaveCell,
  onClearCell,
  zIndex,
  onClose,
}) {
  const [basePrompt, setBasePrompt] = useState(DEFAULT_PROMPT)
  const [extraPrompt, setExtraPrompt] = useState('')
  const [building, setBuilding] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [preview, setPreview] = useState(null) // { url, blob, neighborCount }
  const previewUrlRef = useRef(null)

  // 就地登记模式下这一格的可编辑字段
  const localMode = Boolean(onSaveCell)
  const [nameDraft, setNameDraft] = useState('')
  const [srcDraft, setSrcDraft] = useState('')

  const pos = parseCellId(cellId)
  const neighborCount = pos && cells ? filledNeighborsOf(cells, pos.x, pos.y).length : 0

  const clearPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setPreview(null)
  }

  // 每次换格子重置补充提示词与预览; 默认提示词保留用户的修改
  useEffect(() => {
    if (open) {
      setExtraPrompt('')
      clearPreview()
    }
  }, [open, cellId])

  // 就地登记模式: 表单跟着当前格子的实际数据走 (保存后弹窗不关, 好接着生成图片)
  useEffect(() => {
    if (!open) return
    setNameDraft(cell?.name || '')
    setSrcDraft(cell?.src || '')
  }, [open, cellId, cell?.name, cell?.src])

  useEffect(() => () => clearPreview(), [])

  const handleCopy = async () => {
    const text = composePrompt(basePrompt, extraPrompt)
    try {
      await navigator.clipboard.writeText(text)
      message.success('提示词已复制到剪贴板')
    } catch {
      message.error('复制失败, 请手动选择文本复制')
    }
  }

  const handleBuild = async () => {
    if (!pos) return
    setBuilding(true)
    try {
      const result = await buildRefTemplate(cells, pos.x, pos.y)
      if (!result) {
        message.warning('周边没有已填充图片的格子, 无法生成重叠参考图')
        return
      }
      clearPreview()
      const url = URL.createObjectURL(result.blob)
      previewUrlRef.current = url
      setPreview({ url, blob: result.blob, neighborCount: result.neighborCount })
      message.success(`参考图已生成 (采用 ${result.neighborCount} 个邻居的重叠像素)`)
    } catch (err) {
      message.error(String(err?.message || err))
    } finally {
      setBuilding(false)
    }
  }

  const handleDownload = () => {
    if (preview) downloadBlob(preview.blob, `${cellId}.png`)
  }

  // 点标题即把这一格的 IMAGES 条目写进 demoWorld.js (浏览器写不了文件, 由 dev server 代劳)
  const imageSrc = cell?.src || defaultSrc || `/maps/${cellId}.jpeg`
  const imageEntry = `'${cellId}': '${imageSrc}',`

  const handleRegisterEntry = async () => {
    if (registering) return
    setRegistering(true)
    try {
      const res = await fetch('/__api/register-cell-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cellId, src: imageSrc }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)

      if (data.status === 'already') {
        message.info(`${cellId} 已经注册过了`)
      } else if (data.fileExists) {
        message.success(`已写入 demoWorld.js: ${imageEntry}`)
      } else {
        message.warning(`条目已写入, 但 public${imageSrc} 还不存在, 记得把图片放进去`)
      }
    } catch (err) {
      // dev server 不可用 (如生产预览) 时退回老办法: 复制条目手动粘贴
      const reason = String(err?.message || err)
      try {
        await navigator.clipboard.writeText(imageEntry)
        message.warning(`写入失败 (${reason}), 已复制条目到剪贴板`)
      } catch {
        message.error(`写入失败: ${reason}`)
      }
    } finally {
      setRegistering(false)
    }
  }

  // 就地登记 (子地图): 直接写进这张图的数据, 不动源码
  const handleSaveCell = () => {
    const name = nameDraft.trim()
    if (!name) {
      message.warning('请先填写这一格的名称')
      return
    }
    onSaveCell({ name, src: srcDraft.trim() })
    message.success(`已登记 ${cellId}`)
  }

  const handleClearCell = () => {
    onClearCell?.()
    onClose()
  }

  return (
    <Modal
      title={
        <Space size={8}>
          {localMode ? (
            <span>{cell?.name || cellId}</span>
          ) : (
            <Tooltip title={`点击写入 demoWorld.js: ${imageEntry}`}>
              <span
                className={`cell-prompt-modal__entry${registering ? ' is-busy' : ''}`}
                onClick={handleRegisterEntry}
              >
                {cell?.name || cellId}
              </span>
            </Tooltip>
          )}
          <Tag>{cellId}</Tag>
          <Tag color={cell?.src ? 'purple' : 'default'}>{cell?.src ? '已有图片' : '未探索'}</Tag>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      zIndex={zIndex}
      destroyOnHidden
    >
      {localMode && (
        <div className="cell-prompt-modal__section cell-prompt-modal__cell-form">
          <Text type="secondary">这一格的名称与图片</Text>
          <Input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="例:王宫 / 市集 / 城南"
          />
          <Input
            value={srcDraft}
            onChange={(e) => setSrcDraft(e.target.value)}
            placeholder={defaultSrc || '/sub-maps/xxx.png'}
            allowClear
          />
          <Space wrap>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveCell}>
              保存这一格
            </Button>
            {cell?.name || cell?.src ? (
              <Button danger icon={<DeleteOutlined />} onClick={handleClearCell}>
                清空该格
              </Button>
            ) : null}
          </Space>
          <Text type="secondary" className="cell-prompt-modal__note">
            图片路径留空则只显示名称占位图。把生成好的图放进 public/ 下, 这里填它的 URL
            (建议就用占位提示里的那条, 一格一个文件名不会撞)。
          </Text>
        </div>
      )}

      <div className="cell-prompt-modal__section">
        <Text type="secondary">默认提示词 (可编辑)</Text>
        <Input.TextArea
          value={basePrompt}
          onChange={(e) => setBasePrompt(e.target.value)}
          autoSize={{ minRows: 4, maxRows: 8 }}
        />
      </div>

      <div className="cell-prompt-modal__section">
        <Text type="secondary">本格补充提示词 (地形、地标等要求)</Text>
        <Input.TextArea
          value={extraPrompt}
          onChange={(e) => setExtraPrompt(e.target.value)}
          placeholder="例: 东侧为雪山山脉, 西南角有一座环形湖, 湖心岛上是古代祭坛"
          autoSize={{ minRows: 2, maxRows: 5 }}
        />
      </div>

      <Space wrap>
        <Button icon={<CopyOutlined />} onClick={handleCopy}>
          复制提示词
        </Button>
        <Button
          type="primary"
          icon={<PictureOutlined />}
          loading={building}
          disabled={neighborCount === 0}
          onClick={handleBuild}
        >
          生成参考图
        </Button>
        {preview && (
          <Button icon={<DownloadOutlined />} onClick={handleDownload}>
            下载参考图
          </Button>
        )}
      </Space>

      <div className="cell-prompt-modal__hint">
        {neighborCount > 0 ? (
          <Text type="secondary">
            周边有 {neighborCount} 个已填充格子。参考图边缘 15% 为邻居真实像素,
            中间透明区为待生成区域; 把参考图和提示词一起交给 AI 补全, 新图即可与邻居无缝拼接。
          </Text>
        ) : (
          <Text type="secondary">
            周边暂无已填充格子, 无法提取重叠像素。可先直接用提示词生成本格, 或先填充相邻格。
          </Text>
        )}
      </div>

      {preview && (
        <div className="cell-prompt-modal__preview">
          <img src={preview.url} alt={`参考图 ${cellId}`} />
        </div>
      )}
    </Modal>
  )
}
