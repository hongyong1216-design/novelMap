import {
  EditOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  AudioOutlined,
} from '@ant-design/icons'
import BranchNode from '../BranchNode/BranchNode'
import './StoryNode.css'

const ICON_MAP = {
  description: <FileTextOutlined />,
  hub:         <ApartmentOutlined />,
  mic:         <AudioOutlined />,
}

function ConnectionDot({ side }) {
  return (
    <span
      className={`story-node__dot story-node__dot--${side}`}
      title={side === 'left' ? 'Target Connection' : 'Source Connection'}
    />
  )
}

export default function StoryNode({ node, selected = false, onSelect, onEdit }) {
  const icon = ICON_MAP[node.icon] || <FileTextOutlined />

  return (
    <div className="story-node">
      <ConnectionDot side="left" />
      <ConnectionDot side="right" />

      <article
        className={
          selected
            ? 'story-node__card story-node__card--selected'
            : 'story-node__card'
        }
        onClick={() => onSelect?.(node)}
      >
        <span className="story-node__act">{node.act}</span>
        <h3 className="story-node__title">{node.title}</h3>
        <p className="story-node__desc">{node.desc}</p>

        {node.characters?.length > 0 && (
          <div className="story-node__chars">
            <label className="story-node__chars-label">
              Characters &amp; Factions
            </label>
            <div className="story-node__chars-list">
              {node.characters.map((c) => (
                <span
                  key={c.name}
                  className={`story-node__char story-node__char--${c.tone || 'primary'}`}
                >
                  <span className="story-node__char-name">{c.name}</span>
                  <span className="story-node__char-faction">{c.faction}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <footer className="story-node__foot">
          <span className="story-node__icon">{icon}</span>
          <button
            type="button"
            className="story-node__edit"
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(node)
            }}
            aria-label="编辑节点"
          >
            <EditOutlined />
          </button>
        </footer>
      </article>

      {node.topBranch && <BranchNode branch={node.topBranch} position="top" />}
      {node.bottomBranch && <BranchNode branch={node.bottomBranch} position="bottom" />}
    </div>
  )
}
