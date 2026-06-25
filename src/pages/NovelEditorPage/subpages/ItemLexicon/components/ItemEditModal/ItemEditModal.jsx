import { useEffect, useState } from 'react'
import { Segmented, Select, Button } from 'antd'
import {
  DeleteOutlined,
  PictureOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import FloatingModal from '../../../../../../components/FloatingModal/FloatingModal'
import { CATEGORIES, CATEGORY_MAP, RARITIES, RARITY_MAP } from '../../data/items'
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
//             点击任意节点弹出「资产详情」浮层（关联 / 主体 / 技术说明三栏），点遮罩 / 关闭 / Esc 收起
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
  // 仅在单行（≤3 个）布局下渲染；更多节点会换行成网格，此时横条无意义
  const hbarInset =
    derivatives.length > 1 && derivatives.length <= 3
      ? `${50 / derivatives.length}%`
      : null

  // 把不同层级的节点标准化为「资产详情」浮层所需的数据：
  //   eyebrow 类型标签 / name 主标题 / subtitle 副标题 / desc 架构概述
  //   badge 角标 / progress 同步度 / meta 右栏参数行 / related 左栏关联资产
  const focusRoot = () =>
    setFocused({
      color: cat?.color,
      eyebrow: 'Root Asset // 核心资产',
      badge: 'Root Item',
      image: item.image,
      name: item.name || '未命名',
      subtitle: item.alias ? `${item.alias} // 核心架构` : '核心架构',
      desc: item.desc || '暂无描述…',
      meta: [
        cat && { label: '分类', value: cat.label },
        RARITY_MAP[item.rarity] && {
          label: '稀有度',
          value: RARITY_MAP[item.rarity].label,
        },
        { label: '衍生分支', value: String(derivatives.length) },
      ].filter(Boolean),
      related: derivatives.map((d) => ({
        key: d.id ?? d.name,
        eyebrow: d.id ? `ID ${d.id}` : '衍生组件',
        color: d.color,
        icon: d.icon,
        image: d.image,
        name: d.name,
        desc: d.desc,
      })),
    })
  const focusDerivative = (d) =>
    setFocused({
      color: d.color,
      eyebrow: d.id ? `Derivative // ${d.id}` : 'Derivative // 衍生组件',
      icon: d.icon,
      image: d.image,
      name: d.name,
      subtitle: [d.alias, d.role].filter(Boolean).join(' // '),
      desc: d.desc || '暂无描述…',
      progress: d.progress,
      meta: [
        d.id && { label: 'ID', value: d.id },
        d.role && { label: '角色', value: d.role },
        typeof d.progress === 'number' && {
          label: '完成度',
          value: `${Math.round(d.progress * 100)}%`,
        },
      ].filter(Boolean),
      related: (d.children ?? []).map((g) => ({
        key: g.name,
        eyebrow: g.alias || '子组件',
        name: g.name,
        desc: g.desc,
      })),
    })
  const focusLeaf = (g, color) =>
    setFocused({
      color,
      eyebrow: 'Leaf Component // 末端组件',
      name: g.name,
      subtitle: g.alias,
      desc: g.desc || '该组件暂无更多文本信息。',
      meta: [{ label: '层级', value: '末端组件' }],
      related: [],
    })

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
          <div className="item-tree">
            <div className="item-tree__grid-bg" />
            <div className="item-tree__canvas">
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

          {/* === 资产详情浮层（点击节点弹出） === */}
          {focused && (
            <div className="item-focus" onClick={() => setFocused(null)}>
              <div
                className="item-focus__panel"
                style={{
                  '--focus-color': focused.color || 'var(--accent-light)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <header className="item-focus__header">
                  <div className="item-focus__heading">
                    <span className="item-focus__eyebrow">
                      {focused.eyebrow || 'Asset Detail // 资产详情'}
                    </span>
                    <h2 className="item-focus__title">{focused.name}</h2>
                  </div>
                  <button
                    type="button"
                    className="item-focus__close"
                    onClick={() => setFocused(null)}
                    aria-label="关闭"
                    title="关闭（Esc）"
                  >
                    <CloseOutlined />
                  </button>
                </header>

                <div className="item-focus__layout">
                  {/* 左：关联资产 */}
                  <aside className="item-focus__aside">
                    <h3 className="item-focus__section-label">
                      关联资产 / Related
                    </h3>
                    {focused.related?.length > 0 ? (
                      focused.related.map((r) => (
                        <div
                          className="item-focus__link"
                          key={r.key}
                          style={{
                            '--link-color': r.color || 'var(--accent-light)',
                          }}
                        >
                          <div className="item-focus__link-media">
                            <SmartImg
                              key={r.image}
                              src={r.image}
                              alt={r.name}
                              imgClass="item-focus__link-img"
                              phClass="item-focus__link-ph"
                            />
                          </div>
                          <div className="item-focus__link-info">
                            <span className="item-focus__link-eyebrow">
                              {r.icon && (
                                <span className="item-focus__link-icon">
                                  {DERIVATIVE_ICONS[r.icon] ?? (
                                    <DatabaseOutlined />
                                  )}
                                </span>
                              )}
                              {r.eyebrow}
                            </span>
                            <h4 className="item-focus__link-name">{r.name}</h4>
                            {r.desc && (
                              <p className="item-focus__link-desc">{r.desc}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="item-focus__aside-empty">暂无关联组件</p>
                    )}
                  </aside>

                  {/* 中：主体大图 + HUD */}
                  <section className="item-focus__stage">
                    <div className="item-focus__media scan-line">
                      <SmartImg
                        key={focused.image}
                        src={focused.image}
                        alt={focused.name}
                        imgClass="item-focus__img"
                        phClass="item-focus__ph"
                      />
                      <div className="item-focus__hud">
                        <span className="item-focus__hud-tag">
                          {typeof focused.progress === 'number'
                            ? `SYNC ${Math.round(focused.progress * 100)}%`
                            : focused.badge || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="item-focus__stage-foot">
                        <h3 className="item-focus__stage-name">{focused.name}</h3>
                        {focused.subtitle && (
                          <div className="item-focus__stage-meta">
                            <span className="item-focus__status">
                              <i className="item-focus__status-dot" />
                              {focused.subtitle}
                            </span>
                          </div>
                        )}
                        {typeof focused.progress === 'number' && (
                          <div className="item-focus__stage-progress">
                            <span
                              style={{
                                width: `${Math.round(focused.progress * 100)}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* 右：技术说明 */}
                  <section className="item-focus__specs">
                    <div className="item-focus__spec-group">
                      <h3 className="item-focus__section-label item-focus__section-label--accent">
                        技术说明 / Specs
                      </h3>
                      <div className="item-focus__spec-block">
                        <h4 className="item-focus__spec-title">架构概述</h4>
                        <p className="item-focus__spec-text">{focused.desc}</p>
                      </div>
                    </div>

                    {focused.meta?.length > 0 && (
                      <div className="item-focus__meta">
                        {focused.meta.map((m) => (
                          <div className="item-focus__meta-row" key={m.label}>
                            <span className="item-focus__meta-label">
                              {m.label}
                            </span>
                            <span className="item-focus__meta-value">
                              {m.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </FloatingModal>
  )
}
