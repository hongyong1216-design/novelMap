import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons'
import { NODE_KINDS } from '../../data/abilityTree'
import './TreeNode.css'

// 左树的递归节点：缩进行（展开箭头 + kind 色点 + 标题/副标题），展开则递归渲染子节点
export default function TreeNode({
  node,
  depth = 0,
  selectedId,
  expanded,
  onSelect,
  onToggle,
}) {
  const kind = NODE_KINDS[node.kind] ?? NODE_KINDS.skill
  const hasChildren = (node.children?.length ?? 0) > 0
  const isOpen = expanded.has(node.id)
  const isSelected = selectedId === node.id

  return (
    <div className="atree-node">
      <div
        className={`atree-node__row${isSelected ? ' is-selected' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 8}px`, '--kind-color': kind.color }}
        onClick={() => onSelect(node.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(node.id)
          }
        }}
      >
        <span
          className="atree-node__caret"
          onClick={(e) => {
            e.stopPropagation()
            if (hasChildren) onToggle(node.id)
          }}
        >
          {hasChildren ? (
            isOpen ? (
              <CaretDownOutlined />
            ) : (
              <CaretRightOutlined />
            )
          ) : null}
        </span>
        <span className="atree-node__dot" />
        <span className="atree-node__title">{node.title || '未命名'}</span>
        {node.subtitle && (
          <span className="atree-node__sub">{node.subtitle}</span>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="atree-node__children">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
