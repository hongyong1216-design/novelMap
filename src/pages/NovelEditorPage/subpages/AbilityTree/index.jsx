import { useMemo, useRef, useState } from 'react'
import './AbilityTree.css'
import TreeNode from './components/TreeNode/TreeNode'
import NodeDetail from './components/NodeDetail/NodeDetail'
import { initialAbilityTree, DEFAULT_NEW_KIND } from './data/abilityTree'
import {
  findNode,
  updateNode,
  addChild,
  removeNode,
  parentIdOf,
} from './utils/treeOps'

export default function AbilityTree() {
  const [tree, setTree] = useState(initialAbilityTree)
  const [selectedId, setSelectedId] = useState('root')
  const [mode, setMode] = useState('view')
  // 默认展开根、两大纲目与两大源（天痕/心铸），及心铸的技法纲/心源纲
  const [expanded, setExpanded] = useState(
    () =>
      new Set([
        'root',
        'sec-realm',
        'sec-veins',
        'src-tianhen',
        'src-xinzhu',
        'sec-xz-jifa',
        'sec-xz-xinyuan',
      ]),
  )
  const idRef = useRef(1000)

  const selected = useMemo(
    () => findNode(tree, selectedId) ?? tree,
    [tree, selectedId],
  )

  const onSelect = (id) => {
    setSelectedId(id)
    setMode('view')
  }

  const onToggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSave = (draft) => {
    setTree((t) => updateNode(t, draft.id, draft))
    // TODO: 持久化到后端
    setMode('view')
  }

  const handleAddChild = () => {
    idRef.current += 1
    const newNode = {
      id: `n-${idRef.current}`,
      kind: DEFAULT_NEW_KIND,
      title: '新能力',
      subtitle: '',
      desc: '',
      attrs: [],
      children: [],
    }
    setTree((t) => addChild(t, selected.id, newNode))
    setExpanded((prev) => new Set(prev).add(selected.id))
    setSelectedId(newNode.id)
    setMode('edit')
  }

  const handleDelete = () => {
    if (selected.id === tree.id) return // 根不可删
    const fallback = parentIdOf(tree, selected.id)
    setTree((t) => removeNode(t, selected.id))
    // TODO: 持久化到后端
    setSelectedId(fallback)
    setMode('view')
  }

  return (
    <div className="ability-tree">
      <aside className="ability-tree__sidebar">
        <header className="ability-tree__head">
          <span className="ability-tree__eyebrow">ABILITY TREE</span>
          <h1 className="ability-tree__heading">能力树</h1>
        </header>
        <div className="ability-tree__tree">
          <TreeNode
            node={tree}
            depth={0}
            selectedId={selectedId}
            expanded={expanded}
            onSelect={onSelect}
            onToggle={onToggle}
          />
        </div>
      </aside>

      <section className="ability-tree__detail">
        <NodeDetail
          key={selected.id}
          node={selected}
          mode={mode}
          onEdit={() => setMode('edit')}
          onSave={handleSave}
          onCancel={() => setMode('view')}
          onAddChild={handleAddChild}
          onDelete={handleDelete}
          canDelete={selected.id !== tree.id}
        />
      </section>
    </div>
  )
}
