import { useEffect, useRef, useState } from 'react'
import { Modal, Input, Button, Space, Tag, Typography, message } from 'antd'
import { CopyOutlined, PictureOutlined, DownloadOutlined } from '@ant-design/icons'
import { parseCellId } from '../../utils/grid'
import { buildRefTemplate, filledNeighborsOf, downloadBlob } from '../../utils/refTemplate'
import { DEFAULT_PROMPT, composePrompt } from './prompts'
import './CellPromptModal.css'

const { Text } = Typography

// 点击格子后的 AI 生图助手弹窗:
// 默认提示词(可改) + 本格补充提示词 + 复制提示词 + 生成邻居重叠参考图
export default function CellPromptModal({ open, cellId, cell, cells, onClose }) {
  const [basePrompt, setBasePrompt] = useState(DEFAULT_PROMPT)
  const [extraPrompt, setExtraPrompt] = useState('')
  const [building, setBuilding] = useState(false)
  const [preview, setPreview] = useState(null) // { url, blob, neighborCount }
  const previewUrlRef = useRef(null)

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
    if (preview) downloadBlob(preview.blob, `ref_${cellId}.png`)
  }

  return (
    <Modal
      title={
        <Space size={8}>
          <span>{cell?.name || cellId}</span>
          <Tag>{cellId}</Tag>
          <Tag color={cell?.src ? 'purple' : 'default'}>{cell?.src ? '已有图片' : '未探索'}</Tag>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      destroyOnHidden
    >
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
