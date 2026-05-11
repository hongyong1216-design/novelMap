import StoryNode from '../StoryNode/StoryNode'
import DecisionNode from '../DecisionNode/DecisionNode'
import AddNode from '../AddNode/AddNode'
import './StoryCanvas.css'

export default function StoryCanvas({
  nodes,
  selectedId,
  onSelect,
  onEdit,
  onSelectOption,
  onAddNode,
}) {
  return (
    <div className="story-canvas">
      <div className="story-canvas__stage">
        <div className="story-canvas__path">
          <span className="story-canvas__path-inner" />
        </div>

        <div className="story-canvas__nodes">
          {nodes.map((node) => {
            if (node.type === 'critical') {
              return (
                <DecisionNode
                  key={node.id}
                  node={node}
                  selected={node.id === selectedId}
                  onSelect={onSelect}
                  onSelectOption={onSelectOption}
                />
              )
            }
            return (
              <StoryNode
                key={node.id}
                node={node}
                selected={node.id === selectedId}
                onSelect={onSelect}
                onEdit={onEdit}
              />
            )
          })}
          <AddNode onClick={onAddNode} />
        </div>
      </div>
    </div>
  )
}
