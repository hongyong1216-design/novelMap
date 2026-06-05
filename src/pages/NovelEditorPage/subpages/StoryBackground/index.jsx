import { useMemo, useRef, useState } from 'react'
import { Segmented } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import './StoryBackground.css'
import BackgroundCard from './components/BackgroundCard/BackgroundCard'
import CardEditModal from './components/CardEditModal/CardEditModal'
import { CATEGORIES, initialCards } from './data/backgroundCards'

const ALL = 'all'

export default function StoryBackground() {
  const [cards, setCards] = useState(initialCards)
  const [filter, setFilter] = useState(ALL)
  const [editing, setEditing] = useState(null)
  const idRef = useRef(1000)

  // 按当前筛选拆分成若干分区，每个分区携带其分类下的卡片
  const sections = useMemo(() => {
    const list =
      filter === ALL ? CATEGORIES : CATEGORIES.filter((c) => c.key === filter)
    return list.map((c) => ({
      ...c,
      cards: cards.filter((card) => card.category === c.key),
    }))
  }, [cards, filter])

  const openCard = (card) => setEditing(card)

  // 新建卡片不立即写入列表，仅打开编辑；保存时才落地（取消则自然丢弃）
  const createCard = (category) => {
    idRef.current += 1
    setEditing({ id: `bg-${idRef.current}`, category, title: '', content: '' })
  }

  const handleSave = (next) => {
    setCards((prev) =>
      prev.some((c) => c.id === next.id)
        ? prev.map((c) => (c.id === next.id ? { ...next } : c))
        : [...prev, { ...next }],
    )
    // TODO: 持久化到后端
    setEditing(null)
  }

  const handleDelete = (card) => {
    setCards((prev) => prev.filter((c) => c.id !== card.id))
    setEditing(null)
  }

  const filterOptions = [
    { label: '全部', value: ALL },
    ...CATEGORIES.map((c) => ({ label: c.label, value: c.key })),
  ]

  return (
    <div className="story-bg">
      <div className="story-bg__bg-grid" />

      <header className="story-bg__header">
        <div className="story-bg__heading">
          <span className="story-bg__eyebrow">WORLD CODEX</span>
          <h1 className="story-bg__title">故事背景</h1>
          <p className="story-bg__subtitle">
            以卡片管理世界观设定 · 点击卡片可查看与编辑完整内容
          </p>
        </div>
        <Segmented
          className="story-bg__filter"
          value={filter}
          onChange={setFilter}
          options={filterOptions}
        />
      </header>

      <main className="story-bg__content">
        {sections.map((section) => (
          <section key={section.key} className="story-bg__section">
            <div
              className="story-bg__section-head"
              style={{ '--cat-color': section.color }}
            >
              <span className="story-bg__section-dot" />
              <h2 className="story-bg__section-title">{section.label}</h2>
              <span className="story-bg__section-code">{section.code}</span>
              <span className="story-bg__section-count">
                {section.cards.length}
              </span>
            </div>

            <div className="story-bg__grid">
              {section.cards.map((card) => (
                <BackgroundCard key={card.id} card={card} onClick={openCard} />
              ))}
              <button
                type="button"
                className="story-bg__add-card"
                style={{ '--cat-color': section.color }}
                onClick={() => createCard(section.key)}
              >
                <PlusOutlined />
                <span>新建{section.label}</span>
              </button>
            </div>
          </section>
        ))}
      </main>

      <CardEditModal
        key={editing?.id ?? 'none'}
        open={!!editing}
        card={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
