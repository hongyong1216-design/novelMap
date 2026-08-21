import { useMemo, useState } from 'react'
import { Input, Segmented, Empty } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import {
  MORPHEMES,
  PACKS,
  POS_LIST,
  POS_MAP,
  TAGS,
  ORIGINS,
} from '../../data/morphemes'
import './MorphemeLibrary.css'

const ALL = 'all'

const PACK_OPTIONS = [
  { label: '全部', value: ALL },
  ...PACKS.map((p) => ({ label: p.label, value: p.key })),
]

const POS_OPTIONS = [
  { label: '全部', value: ALL },
  ...POS_LIST.map((p) => ({ label: p.label, value: p.key })),
]

// 语素库：检索 / 按包与词性筛选，点一枚语素就把它锁进铸名台的对应槽位
export default function MorphemeLibrary({ onSend, lockedIds = [] }) {
  const [keyword, setKeyword] = useState('')
  const [pack, setPack] = useState(ALL)
  const [pos, setPos] = useState(ALL)

  const visible = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return MORPHEMES.filter((item) => {
      if (pack !== ALL && item.pack !== pack) return false
      if (pos !== ALL && item.pos !== pos) return false
      if (!kw) return true
      return (
        item.char.includes(kw) ||
        item.meaning.toLowerCase().includes(kw) ||
        (item.pinyin ?? '').toLowerCase().includes(kw) ||
        (item.root ?? '').toLowerCase().includes(kw)
      )
    })
  }, [keyword, pack, pos])

  // 按词性分组渲染，一眼能看清「这一格该填形容词还是名词」
  const groups = useMemo(
    () =>
      POS_LIST.map((p) => ({
        ...p,
        list: visible.filter((item) => item.pos === p.key),
      })).filter((g) => g.list.length),
    [visible],
  )

  return (
    <section className="mlib">
      <header className="mlib__header">
        <div>
          <span className="mlib__eyebrow">MORPHEMES</span>
          <h2 className="mlib__title">语素库</h2>
        </div>
        <span className="mlib__count">{visible.length} 枚</span>
      </header>

      {/* 语素多、滚得深，检索与筛选吸在顶上，滚到哪都能改条件 */}
      <div className="mlib__toolbar">
        <Input
          className="mlib__search"
          allowClear
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          prefix={<SearchOutlined />}
          placeholder="检索语素 · 字 / 拼音 / 含义 / 词根"
        />

        <div className="mlib__filters">
          <Segmented
            size="small"
            className="mlib__filter"
            value={pack}
            onChange={setPack}
            options={PACK_OPTIONS}
          />
          <Segmented
            size="small"
            className="mlib__filter"
            value={pos}
            onChange={setPos}
            options={POS_OPTIONS}
          />
        </div>
      </div>

      {groups.length === 0 && (
        <Empty className="mlib__empty" description="没有匹配的语素" />
      )}

      {groups.map((group) => (
        <div key={group.key} className="mlib__group">
          <h3 className="mlib__group-title">
            {group.label}
            <span className="mlib__group-count">{group.list.length}</span>
          </h3>

          <div className="mlib__grid">
            {group.list.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`mlib__cell${
                  lockedIds.includes(item.id) ? ' is-locked' : ''
                }`}
                onClick={() => onSend?.(item)}
                title={`送入铸名台 · ${item.meaning}`}
              >
                <span
                  className={`mlib__char${
                    item.char.length > 2 ? ' is-long' : ''
                  }`}
                >
                  {item.char}
                </span>
                <span className="mlib__pinyin">
                  {item.pinyin ?? item.root}
                </span>
                <span className="mlib__meaning">{item.meaning}</span>
                <span className="mlib__tags">
                  <em className="mlib__pos">{POS_MAP[item.pos]?.short}</em>
                  {item.origin && (
                    <em className="mlib__origin">{ORIGINS[item.origin]}</em>
                  )}
                  {item.tags.slice(0, 2).map((t) => (
                    <em key={t} className="mlib__tag">
                      {TAGS[t] ?? t}
                    </em>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
