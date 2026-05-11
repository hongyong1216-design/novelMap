import { Button, Input } from 'antd'
import {
  ArrowRightOutlined,
  WarningOutlined,
  LinkOutlined,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import './InspectorPanel.css'

const RELATION_ICONS = {
  cause: <ArrowRightOutlined />,
  lock:  <WarningOutlined />,
  link:  <LinkOutlined />,
}

export default function InspectorPanel({
  node,
  description = '',
  relations = [],
  onTitleChange,
  onDescriptionChange,
  onRemoveRelation,
  onAddRelation,
  onSave,
}) {
  if (!node) {
    return (
      <aside className="inspector-panel inspector-panel--empty">
        <h4 className="inspector-panel__heading">节点检查器</h4>
        <p className="inspector-panel__empty-hint">从画布选择一个节点开始编辑</p>
      </aside>
    )
  }

  return (
    <aside className="inspector-panel">
      <div className="inspector-panel__section">
        <h4 className="inspector-panel__heading">节点检查器</h4>
        <div className="inspector-panel__title-wrap">
          <label className="inspector-panel__label">节点标题</label>
          <Input
            value={node.title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            variant="borderless"
            className="inspector-panel__title-input"
          />
        </div>
      </div>

      <div className="inspector-panel__scroll">
        <div className="inspector-panel__field">
          <label className="inspector-panel__label">叙事描述</label>
          <Input.TextArea
            value={description}
            onChange={(e) => onDescriptionChange?.(e.target.value)}
            autoSize={{ minRows: 5 }}
            className="inspector-panel__textarea"
          />
        </div>

        <div className="inspector-panel__field">
          <label className="inspector-panel__label">逻辑关系</label>
          <ul className="inspector-panel__relations">
            {relations.map((r) => (
              <li
                key={r.id}
                className={`inspector-panel__relation inspector-panel__relation--${r.tone}`}
              >
                <span className="inspector-panel__relation-text">
                  <span className="inspector-panel__relation-icon">
                    {RELATION_ICONS[r.kind] || <LinkOutlined />}
                  </span>
                  {r.label}
                </span>
                <button
                  type="button"
                  className="inspector-panel__relation-close"
                  onClick={() => onRemoveRelation?.(r.id)}
                  aria-label="移除关系"
                >
                  <CloseOutlined />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="inspector-panel__add-relation"
            onClick={onAddRelation}
          >
            <PlusOutlined /> 添加逻辑路径
          </button>
        </div>
      </div>

      <Button block onClick={onSave} className="inspector-panel__save">
        保存节点更改
      </Button>
    </aside>
  )
}
