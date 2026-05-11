import { ExclamationCircleFilled } from '@ant-design/icons'
import BranchNode from '../BranchNode/BranchNode'
import './DecisionNode.css'

function ConnectionDot({ side }) {
  return (
    <span
      className={`decision-node__dot decision-node__dot--${side}`}
      title={side === 'left' ? 'Target Connection' : 'Source Connection'}
    />
  )
}

export default function DecisionNode({
  node,
  selected = true,
  onSelect,
  onSelectOption,
}) {
  return (
    <div className="decision-node">
      <ConnectionDot side="left" />
      <ConnectionDot side="right" />

      <article
        className={
          selected
            ? 'decision-node__card decision-node__card--active'
            : 'decision-node__card'
        }
        onClick={() => onSelect?.(node)}
      >
        <header className="decision-node__head">
          <span className="decision-node__tag">{node.act}</span>
          <ExclamationCircleFilled className="decision-node__warn" />
        </header>

        <h3 className="decision-node__title">{node.title}</h3>

        <div className="decision-node__options">
          {node.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={
                opt.selected
                  ? 'decision-node__option decision-node__option--selected'
                  : 'decision-node__option'
              }
              onClick={(e) => {
                e.stopPropagation()
                onSelectOption?.(node, opt)
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </article>

      {node.topBranch && <BranchNode branch={node.topBranch} position="top" />}
      {node.bottomBranch && <BranchNode branch={node.bottomBranch} position="bottom" />}
    </div>
  )
}
