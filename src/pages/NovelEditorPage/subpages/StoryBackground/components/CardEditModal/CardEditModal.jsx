import { useState } from 'react'
import { Segmented, Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import FloatingModal from '../../../../../../components/FloatingModal/FloatingModal'
import { CATEGORIES, CATEGORY_MAP } from '../../data/backgroundCards'
import './CardEditModal.css'

const countWords = (text) => text.replace(/\s/g, '').length

// 行首「短名称：描述」识别为精细条目（名称 ≤16 字、不含标点与空格，冒号后须有内容）
const TERM_RE = /^([^，。；！？、,.;!?\s：:]{2,16})[：:]\s*(.+)$/

// 把 content 解析为块：空行/换行分段，识别【小节】标题、精细条目与有序列表项
const parseBlocks = (content) =>
  (content || '')
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text, i) => {
      if (/^【.+】$/.test(text)) {
        return { key: i, kind: 'heading', text: text.replace(/^【|】$/g, '') }
      }
      const term = text.match(TERM_RE)
      if (term) {
        return { key: i, kind: 'term', term: term[1], text: term[2] }
      }
      if (/^\d+[.、]/.test(text)) {
        return { key: i, kind: 'list', text }
      }
      return { key: i, kind: 'para', text }
    })

// 背景卡片浮窗：默认「阅读模式」舒适查看，点「编辑」切到表单编辑
// 父级通过 key={card.id} 强制重建，使 draft / mode 每次以最新 card 初始化
export default function CardEditModal({ open, card, onClose, onSave, onDelete }) {
  // 新建卡片（无标题无内容）直接进入编辑；已有卡片先进入阅读
  const isNew = !(card?.title || card?.content)
  const [mode, setMode] = useState(isNew ? 'edit' : 'view')
  const [draft, setDraft] = useState(
    () => card ?? { title: '', content: '', category: 'story' },
  )

  if (!card) return null

  const cat = CATEGORY_MAP[draft.category]
  const wordCount = countWords(draft.title) + countWords(draft.content)
  const update = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const isEdit = mode === 'edit'

  const title = (
    <span className="card-edit__title">
      <span className="card-edit__tag" style={{ '--cat-color': cat?.color }}>
        {cat?.code}
      </span>
      {draft.title || (isEdit ? '新建背景卡片' : '未命名')}
    </span>
  )

  const footerExtra = (
    <div className="card-edit__footer-extra">
      <Button
        type="text"
        danger
        size="small"
        icon={<DeleteOutlined />}
        onClick={() => onDelete?.(card)}
      >
        删除
      </Button>
      <span className="card-edit__word-count">字数 {wordCount}</span>
    </div>
  )

  // 阅读模式：主操作为「编辑」；编辑模式：「保存」/「取消」（取消丢弃改动退回阅读）
  const modeProps = isEdit
    ? {
        saveText: '保存',
        onSave: () => onSave?.(draft),
        cancelText: '取消',
        onCancel: () => {
          if (isNew) return onClose?.()
          setDraft(card)
          setMode('view')
        },
      }
    : {
        saveText: '编辑',
        onSave: () => setMode('edit'),
        cancelText: '关闭',
        onCancel: onClose,
      }

  const blocks = parseBlocks(draft.content)

  return (
    <FloatingModal
      open={open}
      onClose={onClose}
      title={title}
      defaultWidth={1040}
      defaultHeight={860}
      className="card-edit__modal"
      footerExtra={footerExtra}
      {...modeProps}
    >
      {isEdit ? (
        <div className="card-edit__body" style={{ '--cat-color': cat?.color }}>
          <div className="card-edit__field">
            <span className="card-edit__label">分类</span>
            <Segmented
              value={draft.category}
              onChange={(v) => update({ category: v })}
              options={CATEGORIES.map((c) => ({ label: c.label, value: c.key }))}
            />
          </div>

          <input
            className="card-edit__title-input"
            value={draft.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="背景标题"
          />

          <textarea
            className="card-edit__textarea"
            value={draft.content}
            onChange={(e) => update({ content: e.target.value })}
            placeholder="在此书写完整的背景设定…"
          />
        </div>
      ) : (
        <article className="card-view" style={{ '--cat-color': cat?.color }}>
          <div className="card-view__inner">
            <span className="card-view__eyebrow">
              {cat?.label} · {cat?.code}
            </span>
            <h1 className="card-view__title">{draft.title || '未命名'}</h1>
            <div className="card-view__divider" />
            {blocks.length === 0 ? (
              <p className="card-view__empty">
                暂无内容，点击右下角「编辑」开始书写…
              </p>
            ) : (
              blocks.map((b) =>
                b.kind === 'heading' ? (
                  <h2 key={b.key} className="card-view__section">
                    {b.text}
                  </h2>
                ) : b.kind === 'term' ? (
                  <p key={b.key} className="card-view__term">
                    <span className="card-view__term-name">{b.term}</span>
                    <span className="card-view__term-desc">{b.text}</span>
                  </p>
                ) : (
                  <p
                    key={b.key}
                    className={
                      b.kind === 'list'
                        ? 'card-view__para card-view__para--list'
                        : 'card-view__para'
                    }
                  >
                    {b.text}
                  </p>
                ),
              )
            )}
          </div>
        </article>
      )}
    </FloatingModal>
  )
}
