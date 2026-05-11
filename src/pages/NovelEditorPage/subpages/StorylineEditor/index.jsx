import { useMemo, useState } from 'react'
import { message } from 'antd'
import CanvasToolbar from './components/CanvasToolbar/CanvasToolbar'
import StoryCanvas from './components/StoryCanvas/StoryCanvas'
import CanvasFooter from './components/CanvasFooter/CanvasFooter'
import InspectorPanel from './components/InspectorPanel/InspectorPanel'
import {
  storyNodes as seedNodes,
  inspectorRelations as seedRelations,
  canvasStatus,
} from './data/storyline'
import './StorylineEditor.css'

const DEFAULT_DESCRIPTION =
  '这个节点是故事的第一幕高潮，主角必须面对自己真实身份的揭露。环境氛围应该是压抑的，带有持续的低频嗡鸣声。'

export default function StorylineEditor() {
  const [nodes, setNodes] = useState(seedNodes)
  const [selectedId, setSelectedId] = useState('n3')
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION)
  const [relations, setRelations] = useState(seedRelations)

  const selected = useMemo(
    () => nodes.find((n) => n.id === selectedId),
    [nodes, selectedId],
  )

  const patchSelected = (patch) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === selectedId ? { ...n, ...patch } : n)),
    )
  }

  const handleSelectOption = (node, option) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === node.id
          ? {
              ...n,
              options: n.options.map((o) => ({
                ...o,
                selected: o.id === option.id,
              })),
            }
          : n,
      ),
    )
  }

  const handleAddRelation = () => {
    const id = `r${Date.now()}`
    setRelations((prev) => [
      ...prev,
      { id, kind: 'link', tone: 'default', label: '链接至: [未命名节点]' },
    ])
  }

  const handleRemoveRelation = (id) => {
    setRelations((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="storyline-editor">
      <div className="storyline-editor__bg-glow storyline-editor__bg-glow--primary" />
      <div className="storyline-editor__bg-glow storyline-editor__bg-glow--tertiary" />

      <CanvasToolbar
        version={canvasStatus.version}
        syncLabel={canvasStatus.syncLabel}
        conflicts={canvasStatus.conflicts}
        onFilter={() => message.info('过滤器即将开放')}
        onAddBranch={() => message.info('新增分支即将开放')}
      />

      <StoryCanvas
        nodes={nodes}
        selectedId={selectedId}
        onSelect={(node) => setSelectedId(node.id)}
        onEdit={(node) => setSelectedId(node.id)}
        onSelectOption={handleSelectOption}
        onAddNode={() => message.info('扩展叙事即将开放')}
      />

      <CanvasFooter
        zoom={canvasStatus.zoom}
        ready={canvasStatus.ready}
        charCount={canvasStatus.charCount}
      />

      <InspectorPanel
        node={selected}
        description={description}
        relations={relations}
        onTitleChange={(title) => patchSelected({ title })}
        onDescriptionChange={setDescription}
        onAddRelation={handleAddRelation}
        onRemoveRelation={handleRemoveRelation}
        onSave={() => selected && message.success(`已保存 ${selected.title}`)}
      />
    </div>
  )
}
