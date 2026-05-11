import { useMemo, useState } from 'react'
import { message } from 'antd'
import FactionList from './components/FactionList/FactionList'
import FactionDetail from './components/FactionDetail/FactionDetail'
import HistoryFab from './components/HistoryFab/HistoryFab'
import { factions as seedFactions } from './data/factions'
import './FactionEditor.css'

const nextFactionId = (factions) => {
  const codes = factions.map((f) => parseInt(f.id.replace(/[^0-9]/g, ''), 10) || 0)
  const max = codes.length ? Math.max(...codes) : 0
  return `0X-${String(max + 1).padStart(4, '0')}`
}

export default function FactionEditor() {
  const [factions, setFactions] = useState(seedFactions)
  const [selectedId, setSelectedId] = useState(seedFactions[0]?.id)

  const selected = useMemo(
    () => factions.find((f) => f.id === selectedId),
    [factions, selectedId],
  )

  const patchSelected = (patch) => {
    setFactions((prev) =>
      prev.map((f) => (f.id === selectedId ? { ...f, ...patch } : f)),
    )
  }

  const handleCreate = () => {
    const id = nextFactionId(factions)
    const draft = {
      id,
      name: '新势力',
      status: 'neutral',
      iconKey: 'default',
      summary: '',
      overview: '',
      leadership: '',
      sector: '',
      capabilities: [],
      members: [],
      updatedAt: '刚刚',
      connections: [],
    }
    setFactions((prev) => [draft, ...prev])
    setSelectedId(id)
  }

  const handleDelete = () => {
    if (!selected) return
    setFactions((prev) => {
      const next = prev.filter((f) => f.id !== selected.id)
      setSelectedId(next[0]?.id)
      return next
    })
    message.success(`已删除 ${selected.name}`)
  }

  const handleSave = () => {
    if (!selected) return
    message.success(`已保存 ${selected.name}`)
  }

  const handleAddConnection = () => {
    if (!selected) return
    patchSelected({
      connections: [
        ...selected.connections,
        { type: 'ally', title: '新关联', desc: '在此描述关联内容。' },
      ],
    })
  }

  return (
    <div className="faction-editor">
      <div className="faction-editor__grid">
        <div className="faction-editor__col faction-editor__col--list">
          <FactionList
            factions={factions}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreate={handleCreate}
          />
        </div>
        <div className="faction-editor__col faction-editor__col--detail">
          <FactionDetail
            faction={selected}
            onChange={patchSelected}
            onDelete={handleDelete}
            onSave={handleSave}
            onAddConnection={handleAddConnection}
          />
        </div>
      </div>

      <HistoryFab onClick={() => message.info('叙事历史功能即将开放')} />
    </div>
  )
}
