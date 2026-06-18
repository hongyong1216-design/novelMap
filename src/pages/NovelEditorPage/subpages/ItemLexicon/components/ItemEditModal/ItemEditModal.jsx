import { useEffect, useRef, useState } from 'react'
import { Segmented, Select, Button } from 'antd'
import {
  DeleteOutlined,
  PictureOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  ShrinkOutlined,
} from '@ant-design/icons'
import FloatingModal from '../../../../../../components/FloatingModal/FloatingModal'
import { CATEGORIES, CATEGORY_MAP, RARITIES } from '../../data/items'
import './ItemEditModal.css'

// 衍生节点图标映射（设计稿用 material-symbols，这里改用 antd 图标）
const DERIVATIVE_ICONS = {
  data: <DatabaseOutlined />,
  energy: <ThunderboltOutlined />,
  shield: <SafetyOutlined />,
}

// 受控图片：加载失败回退到占位图标。src 变化时由调用方通过 key 重建以重置状态
function SmartImg({ src, alt, imgClass, phClass }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div className={phClass}>
        <PictureOutlined />
      </div>
    )
  }
  return (
    <img className={imgClass} src={src} alt={alt} onError={() => setErr(true)} />
  )
}

// 物品浮窗：
//   tree 模式 = 演化树状图（根物品 → 衍生组件 → 孙节点），默认查看视图
//             点击任意节点可放大查看完整文本，再点缩小（遮罩 / 按钮 / Esc）
//   edit 模式 = 编辑核心（复用表单编辑根物品的属性）
// 父级通过 key={item.id} 强制重建，使 draft / mode 每次以最新 item 初始化
export default function ItemEditModal({ open, item, onClose, onSave, onDelete }) {
  // 新建物品（无代号无描述）直接进入编辑；已有物品先看演化树
  const isNew = !(item?.name || item?.desc)
  const [mode, setMode] = useState(isNew ? 'edit' : 'tree')
  const [draft, setDraft] = useState(
    () =>
      item ?? {
        name: '',
        alias: '',
        type: '',
        desc: '',
        image: '',
        category: 'weapon',
        rarity: 'common',
      },
  )
  // 被放大查看的节点（标准化对象）；null 表示未放大
  const [focused, setFocused] = useState(null)
  const treeRef = useRef(null)

  // 放大查看时支持 Esc 缩小
  useEffect(() => {
    if (!focused) return
    const onKey = (e) => {
      if (e.key === 'Escape') setFocused(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focused])

  if (!item) return null

  const cat = CATEGORY_MAP[draft.category]
  const isEdit = mode === 'edit'
  const update = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const derivatives = item.derivatives ?? []
  // 水平分叉横条只连接首尾子节点的中心：n 个节点时左右内缩 50/n %
  const hbarInset =
    derivatives.length > 1 ? `${50 / derivatives.length}%` : null

  // 把不同层级的节点标准化为放大卡所需的数据
  const focusRoot = () =>
    setFocused({
      color: cat?.color,
      badge: 'Root Item',
      image: item.image,
      name: item.name || '未命名',
      subtitle: item.alias ? `${item.alias} // 核心架构` : '核心架构',
      desc: item.desc || '暂无描述…',
    })
  const focusDerivative = (d) =>
    setFocused({
      color: d.color,
      icon: d.icon,
      id: d.id,
      image: d.image,
      name: d.name,
      subtitle: [d.alias, d.role].filter(Boolean).join(' // '),
      desc: d.desc || '暂无描述…',
      progress: d.progress,
      children: d.children,
    })
  const focusLeaf = (g, color) =>
    setFocused({
      color,
      name: g.name,
      subtitle: g.alias,
      desc: g.desc || '该组件暂无更多文本信息。',
    })

  // 视差：鼠标在画布上移动时，整棵树轻微反向平移（直接改 style，避免频繁 setState）
  const handleParallax = (e) => {
    const el = treeRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height
    el.style.transform = `translate(${dx * -14}px, ${dy * -10}px)`
  }
  const resetParallax = () => {
    if (treeRef.current) treeRef.current.style.transform = 'translate(0, 0)'
  }

  // 导出该物品及其演化架构为 JSON 文件
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(item, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${item.name || 'item'}.architecture.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const title = (
    <div className="item-modal__title">
      <span className="item-modal__eyebrow">Structural Mapping // 结构映射</span>
      <span className="item-modal__headline">
        {isEdit ? draft.name || '登记新物品' : '项目演化树状图'}
      </span>
    </div>
  )

  const legend = (
    <div className="item-tree__legend">
      <span className="item-tree__legend-item">
        <i style={{ background: 'var(--accent-light)' }} />
        活跃演化
      </span>
      <span className="item-tree__legend-item">
        <i style={{ background: '#f5a05a' }} />
        编辑锁定
      </span>
    </div>
  )

  const deleteBtn = (
    <Button
      type="text"
      danger
      size="small"
      icon={<DeleteOutlined />}
      onClick={() => onDelete?.(item)}
    >
      删除
    </Button>
  )

  // 查看模式：主操作「编辑核心」，次操作「导出架构」；编辑模式：保存 / 取消
  const modeProps = isEdit
    ? {
        saveText: '保存',
        onSave: () => onSave?.(draft),
        cancelText: '取消',
        onCancel: () => {
          if (isNew) return onClose?.()
          setDraft(item)
          setMode('tree')
        },
        footerExtra: deleteBtn,
      }
    : {
        saveText: '编辑核心',
        onSave: () => setMode('edit'),
        cancelText: '导出架构',
        onCancel: handleExport,
        footerExtra: legend,
      }

  return (
    <FloatingModal
      open={open}
      onClose={onClose}
      title={title}
      defaultWidth={1040}
      defaultHeight={840}
      className="item-modal"
      {...modeProps}
    >
      {isEdit ? (
        <div className="item-edit__body" style={{ '--cat-color': cat?.color }}>
          <div className="item-edit__top">
            <div className="item-edit__media">
              <SmartImg
                key={draft.image}
                src={draft.image}
                alt={draft.name}
                imgClass="item-edit__img"
                phClass="item-edit__placeholder"
              />
            </div>

            <div className="item-edit__top-fields">
              <div className="item-edit__field">
                <span className="item-edit__label">分类</span>
                <Segmented
                  value={draft.category}
                  onChange={(v) => update({ category: v })}
                  options={CATEGORIES.map((c) => ({
                    label: c.label,
                    value: c.key,
                  }))}
                />
              </div>
              <div className="item-edit__field">
                <span className="item-edit__label">稀有度</span>
                <Select
                  value={draft.rarity}
                  onChange={(v) => update({ rarity: v })}
                  options={RARITIES.map((r) => ({
                    label: r.label,
                    value: r.key,
                  }))}
                  style={{ width: 140 }}
                />
              </div>
              <input
                className="item-edit__name-input"
                value={draft.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="物品代号"
              />
            </div>
          </div>

          <div className="item-edit__field">
            <span className="item-edit__label">别名</span>
            <input
              className="item-edit__line-input"
              value={draft.alias ?? ''}
              onChange={(e) => update({ alias: e.target.value })}
              placeholder="中文别名，如「虚空之刃」"
            />
          </div>
          <input
            className="item-edit__line-input"
            value={draft.type}
            onChange={(e) => update({ type: e.target.value })}
            placeholder="子类型，如「近战」「强化」「数据」"
          />
          <input
            className="item-edit__line-input"
            value={draft.image}
            onChange={(e) => update({ image: e.target.value })}
            placeholder="图片地址（URL，可留空）"
          />
          <textarea
            className="item-edit__textarea"
            value={draft.desc}
            onChange={(e) => update({ desc: e.target.value })}
            placeholder="描述这件物品的来历、特性与用途…"
          />
        </div>
      ) : (
        <div className="item-tree-wrap">
          <div
            className="item-tree"
            onMouseMove={handleParallax}
            onMouseLeave={resetParallax}
          >
            <div className="item-tree__grid-bg" />
            <div className="item-tree__canvas" ref={treeRef}>
              {/* === 根节点 === */}
              <div className="item-tree__root-wrap">
                <div
                  className="item-tree__root"
                  style={{ '--cat-color': cat?.color }}
                  onClick={focusRoot}
                  role="button"
                  tabIndex={0}
                >
                  <div className="item-tree__root-media">
                    <SmartImg
                      key={item.image}
                      src={item.image}
                      alt={item.name}
                      imgClass="item-tree__root-img"
                      phClass="item-tree__root-ph"
                    />
                    <span className="item-tree__root-badge">Root Item</span>
                  </div>
                  <div className="item-tree__root-info">
                    <h3 className="item-tree__root-name">
                      {item.name || '未命名'}
                    </h3>
                    <p className="item-tree__root-sub">
                      {item.alias ? `${item.alias} // 核心架构` : '核心架构'}
                    </p>
                    <p className="item-tree__root-desc">
                      {item.desc || '暂无描述…'}
                    </p>
                  </div>
                </div>
                {derivatives.length > 0 && <div className="item-tree__trunk" />}
              </div>

              {/* === 衍生子节点层 === */}
              {derivatives.length > 0 ? (
                <div className="item-tree__children">
                  {hbarInset && (
                    <div
                      className="item-tree__hbar"
                      style={{ left: hbarInset, right: hbarInset }}
                    />
                  )}
                  {derivatives.map((d) => (
                    <div className="item-tree__branch" key={d.id ?? d.name}>
                      <div className="item-tree__cline" />
                      <div
                        className="item-tree__node"
                        style={{ '--node-color': d.color }}
                        onClick={() => focusDerivative(d)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="item-tree__node-media">
                          <SmartImg
                            key={d.image}
                            src={d.image}
                            alt={d.name}
                            imgClass="item-tree__node-img"
                            phClass="item-tree__node-ph"
                          />
                        </div>
                        <div className="item-tree__node-body">
                          <div className="item-tree__node-head">
                            <span className="item-tree__node-icon">
                              {DERIVATIVE_ICONS[d.icon] ?? <DatabaseOutlined />}
                            </span>
                            {d.id && (
                              <span className="item-tree__node-id">
                                ID: {d.id}
                              </span>
                            )}
                          </div>
                          <h4 className="item-tree__node-name">{d.name}</h4>
                          <p className="item-tree__node-sub">
                            {[d.alias, d.role].filter(Boolean).join(' // ')}
                          </p>
                          <p className="item-tree__node-desc">{d.desc}</p>
                          {typeof d.progress === 'number' && (
                            <div className="item-tree__progress">
                              <span
                                style={{
                                  width: `${Math.round(d.progress * 100)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 孙节点 */}
                      {d.children?.length > 0 && (
                        <>
                          <div className="item-tree__cline item-tree__cline--grand" />
                          {d.children.map((g) => (
                            <div
                              className="item-tree__leaf"
                              key={g.name}
                              onClick={() => focusLeaf(g, d.color)}
                              role="button"
                              tabIndex={0}
                            >
                              <h5 className="item-tree__leaf-name">{g.name}</h5>
                              <p className="item-tree__leaf-sub">{g.alias}</p>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="item-tree__empty">
                  暂无衍生组件 · 点击「编辑核心」补充该物品的演化分支
                </p>
              )}
            </div>
          </div>

          {/* === 放大查看浮层 === */}
          {focused && (
            <div className="item-focus" onClick={() => setFocused(null)}>
              <div
                className="item-focus__card"
                style={{ '--focus-color': focused.color || 'var(--accent-light)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="item-focus__shrink"
                  onClick={() => setFocused(null)}
                  aria-label="缩小"
                  title="缩小（Esc）"
                >
                  <ShrinkOutlined />
                </button>

                {focused.image && (
                  <div className="item-focus__media">
                    <SmartImg
                      key={focused.image}
                      src={focused.image}
                      alt={focused.name}
                      imgClass="item-focus__img"
                      phClass="item-focus__ph"
                    />
                    {focused.badge && (
                      <span className="item-focus__badge">{focused.badge}</span>
                    )}
                  </div>
                )}

                <div className="item-focus__body">
                  <div className="item-focus__head">
                    {focused.icon && (
                      <span className="item-focus__icon">
                        {DERIVATIVE_ICONS[focused.icon] ?? <DatabaseOutlined />}
                      </span>
                    )}
                    <h3 className="item-focus__name">{focused.name}</h3>
                    {focused.id && (
                      <span className="item-focus__id">ID: {focused.id}</span>
                    )}
                  </div>
                  {focused.subtitle && (
                    <p className="item-focus__sub">{focused.subtitle}</p>
                  )}
                  <div className="item-focus__divider" />
                  <p className="item-focus__desc">{focused.desc}</p>

                  {typeof focused.progress === 'number' && (
                    <div className="item-focus__progress-row">
                      <div className="item-focus__progress">
                        <span
                          style={{
                            width: `${Math.round(focused.progress * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="item-focus__progress-val">
                        {Math.round(focused.progress * 100)}%
                      </span>
                    </div>
                  )}

                  {focused.children?.length > 0 && (
                    <div className="item-focus__children">
                      <span className="item-focus__children-label">衍生子项</span>
                      {focused.children.map((g) => (
                        <div className="item-focus__child" key={g.name}>
                          <span className="item-focus__child-name">{g.name}</span>
                          {g.alias && (
                            <span className="item-focus__child-alias">
                              {g.alias}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </FloatingModal>
  )
}
