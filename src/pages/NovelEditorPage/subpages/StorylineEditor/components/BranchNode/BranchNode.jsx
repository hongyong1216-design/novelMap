import './BranchNode.css'

export default function BranchNode({ branch, position = 'bottom' }) {
  if (!branch) return null
  const tone = branch.labelTone || 'tertiary'
  const positionClass = `branch-node--${position}`

  return (
    <div className={`branch-node ${positionClass}`}>
      <span className="branch-node__connector" />
      <div className="branch-node__card">
        {branch.image && (
          <div className="branch-node__image-wrap">
            <img
              src={branch.image}
              alt={branch.label}
              className="branch-node__image"
              loading="lazy"
            />
          </div>
        )}
        <span className={`branch-node__label branch-node__label--${tone}`}>
          {branch.label}
        </span>
        {branch.title && (
          <h4 className="branch-node__title">{branch.title}</h4>
        )}
      </div>
    </div>
  )
}
