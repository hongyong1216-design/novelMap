import { useEffect, useState } from 'react'
import { Button, Select } from 'antd'
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { NODE_KINDS } from '../../data/abilityTree'
import './NodeDetail.css'

const KIND_OPTIONS = Object.entries(NODE_KINDS).map(([value, k]) => ({
  value,
  label: k.label,
}))

// 右侧面板：view 态展示节点详情；edit 态用表单改 title/subtitle/kind/desc 与 attrs 行
export default function NodeDetail({
  node,
  mode,
  onEdit,
  onSave,
  onCancel,
  onAddChild,
  onDelete,
  canDelete,
}) {
  const [draft, setDraft] = useState(node)

  // 切换节点 / 进出编辑态时，把草稿同步为当前节点
  useEffect(() => {
    setDraft(node)
  }, [node, mode])

  if (!node) {
    return (
      <div className="atree-detail atree-detail--empty">
        选择左侧的节点查看与编辑
      </div>
    )
  }

  const kind = NODE_KINDS[node.kind] ?? NODE_KINDS.skill
  const update = (patch) => setDraft((d) => ({ ...d, ...patch }))

  const updateAttr = (i, patch) =>
    setDraft((d) => ({
      ...d,
      attrs: d.attrs.map((a, idx) => (idx === i ? { ...a, ...patch } : a)),
    }))
  const addAttr = () =>
    setDraft((d) => ({ ...d, attrs: [...(d.attrs ?? []), { label: '', value: '' }] }))
  const removeAttr = (i) =>
    setDraft((d) => ({ ...d, attrs: d.attrs.filter((_, idx) => idx !== i) }))

  // ===== 编辑态 =====
  if (mode === 'edit') {
    return (
      <div className="atree-detail">
        <div className="atree-detail__form">
          <div className="atree-detail__field">
            <span className="atree-detail__label">类型</span>
            <Select
              value={draft.kind}
              onChange={(v) => update({ kind: v })}
              options={KIND_OPTIONS}
              style={{ width: 140 }}
            />
          </div>
          <input
            className="atree-detail__input atree-detail__input--title"
            value={draft.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="名称"
          />
          <input
            className="atree-detail__input"
            value={draft.subtitle ?? ''}
            onChange={(e) => update({ subtitle: e.target.value })}
            placeholder="副标题 / 定位（可空）"
          />
          <textarea
            className="atree-detail__textarea"
            value={draft.desc ?? ''}
            onChange={(e) => update({ desc: e.target.value })}
            placeholder="描述这一节点的设定…"
          />

          <div className="atree-detail__attrs-head">
            <span className="atree-detail__label">属性</span>
            <Button size="small" type="text" icon={<PlusOutlined />} onClick={addAttr}>
              添加属性
            </Button>
          </div>
          {(draft.attrs ?? []).map((a, i) => (
            <div className="atree-detail__attr-row" key={i}>
              <input
                className="atree-detail__input atree-detail__input--attr-label"
                value={a.label}
                onChange={(e) => updateAttr(i, { label: e.target.value })}
                placeholder="标签"
              />
              <input
                className="atree-detail__input"
                value={a.value}
                onChange={(e) => updateAttr(i, { value: e.target.value })}
                placeholder="内容"
              />
              <button
                type="button"
                className="atree-detail__attr-del"
                onClick={() => removeAttr(i)}
                aria-label="删除属性"
              >
                <CloseOutlined />
              </button>
            </div>
          ))}
        </div>

        <div className="atree-detail__footer">
          <Button type="primary" onClick={() => onSave(draft)}>
            保存
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </div>
      </div>
    )
  }

  // ===== 查看态 =====
  return (
    <div className="atree-detail">
      <div className="atree-detail__body">
        <span
          className="atree-detail__badge"
          style={{ '--kind-color': kind.color }}
        >
          {kind.label}
        </span>
        <h2 className="atree-detail__title">{node.title || '未命名'}</h2>
        {node.subtitle && <p className="atree-detail__sub">{node.subtitle}</p>}
        {node.desc && <p className="atree-detail__desc">{node.desc}</p>}

        {node.attrs?.length > 0 && (
          <div className="atree-detail__attrs">
            {node.attrs.map((a, i) => (
              <div className="atree-detail__attr" key={i}>
                <span className="atree-detail__attr-label">{a.label}</span>
                <span className="atree-detail__attr-value">{a.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="atree-detail__footer">
        <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
          编辑
        </Button>
        <Button icon={<PlusOutlined />} onClick={onAddChild}>
          子节点
        </Button>
        <Button
          danger
          icon={<DeleteOutlined />}
          disabled={!canDelete}
          onClick={onDelete}
        >
          删除
        </Button>
      </div>
    </div>
  )
}
