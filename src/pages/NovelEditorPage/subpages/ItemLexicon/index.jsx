import { useMemo, useRef, useState } from 'react'
import { Segmented, Select, Input } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import './ItemLexicon.css'
import ItemCard from './components/ItemCard/ItemCard'
import ItemEditModal from './components/ItemEditModal/ItemEditModal'
import { CATEGORIES, RARITY_MAP, initialItems } from './data/items'

const ALL = 'all'

const SORTS = [
  { value: 'chronological', label: '时间顺序' },
  { value: 'alphabetical', label: '字母顺序' },
  { value: 'rarity', label: '稀有度' },
]

export default function ItemLexicon() {
  const [items, setItems] = useState(initialItems)
  const [filter, setFilter] = useState(ALL)
  const [sort, setSort] = useState('chronological')
  const [keyword, setKeyword] = useState('')
  const [editing, setEditing] = useState(null)
  const idRef = useRef(1000)

  // 按分类筛选 + 关键词检索 + 排序，得到当前可见的物品列表
  const visible = useMemo(() => {
    let list =
      filter === ALL ? items : items.filter((it) => it.category === filter)

    const kw = keyword.trim().toLowerCase()
    if (kw) {
      list = list.filter(
        (it) =>
          it.name?.toLowerCase().includes(kw) ||
          it.desc?.toLowerCase().includes(kw) ||
          it.type?.toLowerCase().includes(kw),
      )
    }

    const sorted = [...list]
    if (sort === 'alphabetical') {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else if (sort === 'rarity') {
      sorted.sort(
        (a, b) =>
          (RARITY_MAP[b.rarity]?.order || 0) -
          (RARITY_MAP[a.rarity]?.order || 0),
      )
    }
    // chronological：保持插入顺序（默认）
    return sorted
  }, [items, filter, sort, keyword])

  const openItem = (item) => setEditing(item)

  // 新建物品不立即写入列表，仅打开编辑；保存时才落地（取消则自然丢弃）
  const createItem = () => {
    idRef.current += 1
    setEditing({
      id: `item-${idRef.current}`,
      category: filter === ALL ? 'weapon' : filter,
      name: '',
      type: '',
      rarity: 'common',
      desc: '',
      image: '',
    })
  }

  const handleSave = (next) => {
    setItems((prev) =>
      prev.some((it) => it.id === next.id)
        ? prev.map((it) => (it.id === next.id ? { ...next } : it))
        : [...prev, { ...next }],
    )
    // TODO: 持久化到后端
    setEditing(null)
  }

  const handleDelete = (item) => {
    setItems((prev) => prev.filter((it) => it.id !== item.id))
    setEditing(null)
  }

  const filterOptions = [
    { label: '全部', value: ALL },
    ...CATEGORIES.map((c) => ({ label: c.label, value: c.key })),
  ]

  return (
    <div className="item-lex">
      <div className="item-lex__bg-grid" />

      <header className="item-lex__header">
        <div className="item-lex__heading">
          <span className="item-lex__eyebrow">LEXICON / ITEMS</span>
          <h1 className="item-lex__title">物品图鉴</h1>
          <p className="item-lex__subtitle">
            登记世界中的武器、造物与神器 · 点击卡片可查看与编辑
          </p>
        </div>
        <Input
          className="item-lex__search"
          allowClear
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          prefix={<SearchOutlined />}
          placeholder="检索物品…"
        />
      </header>

      <div className="item-lex__toolbar">
        <Segmented
          className="item-lex__filter"
          value={filter}
          onChange={setFilter}
          options={filterOptions}
        />
        <div className="item-lex__sort">
          <span className="item-lex__sort-label">排序</span>
          <Select
            value={sort}
            onChange={setSort}
            options={SORTS}
            variant="borderless"
            popupMatchSelectWidth={false}
          />
        </div>
      </div>

      <main className="item-lex__grid">
        {visible.map((item) => (
          <ItemCard key={item.id} item={item} onClick={openItem} />
        ))}

        <button
          type="button"
          className="item-lex__add-card"
          onClick={createItem}
        >
          <span className="item-lex__add-icon">
            <PlusOutlined />
          </span>
          <span>登记新物品</span>
        </button>
      </main>

      <ItemEditModal
        key={editing?.id ?? 'none'}
        open={!!editing}
        item={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
