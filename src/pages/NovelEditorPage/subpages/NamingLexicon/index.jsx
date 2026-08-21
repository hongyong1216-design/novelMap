import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Tabs, Button, Empty, Modal, message } from 'antd'
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import './NamingLexicon.css'
import NameForge from './components/NameForge/NameForge'
import NameCard from './components/NameCard/NameCard'
import MorphemeLibrary from './components/MorphemeLibrary/MorphemeLibrary'
import { MORPHEMES, PACK_MAP, POS_MAP } from './data/morphemes'
import { ANCIENT_PACK, getFormula, getFormulas } from './data/formulas'
import { RANDOM_ANY } from './data/surnames'
import { rollName, rollBatch, findSlotFor } from './utils/generate'

const STORAGE_KEY = (novelId) => `novelmap:naming:${novelId || 'default'}`
const BATCH = 8

const INITIAL = {
  mode: 'persona',
  style: 'west',
  formulaKey: 'human',
  gender: 'any',
  useAncient: false,
  surname: RANDOM_ANY,
  locks: {},
}

const loadFavorites = (novelId) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(novelId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.warn('[NamingLexicon] localStorage load failed:', e)
    return []
  }
}

const saveFavorites = (novelId, list) => {
  try {
    localStorage.setItem(STORAGE_KEY(novelId), JSON.stringify(list))
  } catch (e) {
    console.warn('[NamingLexicon] localStorage save failed:', e)
  }
}

// 首屏就先铸一批，页面打开即有东西看
const seedForge = () => {
  const formula = getFormula(INITIAL.mode, INITIAL.style, INITIAL.formulaKey)
  const options = {
    gender: INITIAL.gender,
    packs: formula.packs,
    surname: INITIAL.surname,
    locks: {},
  }
  return {
    current: rollName(formula, options),
    candidates: rollBatch(formula, options, BATCH),
  }
}

export default function NamingLexicon() {
  const { novelId } = useParams()

  const [mode, setMode] = useState(INITIAL.mode)
  const [style, setStyle] = useState(INITIAL.style)
  const [formulaKey, setFormulaKey] = useState(INITIAL.formulaKey)
  const [gender, setGender] = useState(INITIAL.gender)
  const [useAncient, setUseAncient] = useState(INITIAL.useAncient)
  const [surname, setSurname] = useState(INITIAL.surname)
  const [locks, setLocks] = useState(INITIAL.locks)
  const [forge, setForge] = useState(seedForge)
  const [tab, setTab] = useState('candidates')
  const [favorites, setFavorites] = useState(() => loadFavorites(novelId))

  const formulaList = useMemo(() => getFormulas(mode, style), [mode, style])
  const formula = useMemo(
    () => getFormula(mode, style, formulaKey),
    [mode, style, formulaKey],
  )

  // 名册持久化；换小说时先重载，这一轮不回写，免得把上一本的名册写进新 key
  const loadedFor = useRef(novelId)
  useEffect(() => {
    if (loadedFor.current !== novelId) {
      loadedFor.current = novelId
      setFavorites(loadFavorites(novelId))
      return
    }
    saveFavorites(novelId, favorites)
  }, [novelId, favorites])

  // 参数改动后立刻重铸：patch 里带上这次要改的值，避免读到还没提交的 state
  const roll = (patch = {}) => {
    const next = {
      mode,
      style,
      formulaKey,
      gender,
      useAncient,
      surname,
      locks,
      ...patch,
    }
    const target = getFormula(next.mode, next.style, next.formulaKey)
    const packs = next.useAncient
      ? [...target.packs, ANCIENT_PACK]
      : target.packs
    const options = {
      gender: next.gender,
      packs,
      surname: next.surname,
      locks: next.locks,
    }
    setForge({
      current: rollName(target, options),
      candidates: rollBatch(target, options, BATCH),
    })
  }

  const changeMode = (value) => {
    const key = getFormulas(value, style)[0].key
    setMode(value)
    setFormulaKey(key)
    setLocks({})
    roll({ mode: value, formulaKey: key, locks: {} })
  }

  const changeStyle = (value) => {
    const key = getFormulas(mode, value)[0].key
    setStyle(value)
    setFormulaKey(key)
    setLocks({})
    roll({ style: value, formulaKey: key, locks: {} })
  }

  const changeFormula = (value) => {
    setFormulaKey(value)
    setLocks({})
    roll({ formulaKey: value, locks: {} })
  }

  const changeGender = (value) => {
    setGender(value)
    roll({ gender: value })
  }

  const changeAncient = (value) => {
    setUseAncient(value)
    roll({ useAncient: value })
  }

  const changeSurname = (value) => {
    setSurname(value)
    roll({ surname: value })
  }

  // 锁定只是打标记，下次铸名时这一位保持不变
  const toggleLock = (slot, value) => {
    setLocks((prev) => {
      const next = { ...prev }
      if (next[slot] != null) delete next[slot]
      else next[slot] = value
      return next
    })
  }

  const clearLocks = () => setLocks({})

  // 语素库 → 铸名台：找到能收下它的槽位，锁进去并立刻重铸
  const sendMorpheme = (morpheme) => {
    const ancientOn = useAncient || morpheme.pack === ANCIENT_PACK
    const packs = ancientOn ? [...formula.packs, ANCIENT_PACK] : formula.packs
    const index = findSlotFor(formula, morpheme, packs)

    if (index < 0) {
      // 两种落空：语素不在当前风格的池子里，或池子对但公式没有这个词性的槽位
      message.info(
        packs.includes(morpheme.pack)
          ? `当前公式没有${POS_MAP[morpheme.pos]?.label}槽位，换个公式或模式再送入「${morpheme.char}」`
          : `「${morpheme.char}」属于${PACK_MAP[morpheme.pack]?.label}，切到${
              morpheme.pack === 'cn' ? '中式' : '西式'
            }风格后再送入`,
      )
      return
    }

    const nextLocks = { ...locks, [index]: morpheme.id }
    if (ancientOn !== useAncient) setUseAncient(ancientOn)
    setLocks(nextLocks)
    roll({ locks: nextLocks, useAncient: ancientOn })
  }

  const pickName = (name) => {
    setLocks({})
    setForge((prev) => ({ ...prev, current: name }))
  }

  const favSet = useMemo(
    () => new Set(favorites.map((f) => f.text)),
    [favorites],
  )

  const toggleFavorite = (name) => {
    if (!name) return
    setFavorites((prev) =>
      prev.some((f) => f.text === name.text)
        ? prev.filter((f) => f.text !== name.text)
        : [{ ...name }, ...prev],
    )
  }

  const copyText = async (text, tip) => {
    try {
      await navigator.clipboard.writeText(text)
      message.success(tip)
    } catch {
      message.warning('复制失败，请手动选中')
    }
  }

  const copyName = (name) =>
    name && copyText(name.text, `已复制「${name.text}」`)

  const copyRoster = () => {
    if (!favorites.length) return
    const text = favorites.map((f) => `${f.text}\t${f.gloss}`).join('\n')
    copyText(text, `已复制名册 ${favorites.length} 条`)
  }

  const clearRoster = () => {
    Modal.confirm({
      title: '清空名册',
      content: `将移除 ${favorites.length} 个已存名字，此操作不可撤销。`,
      okText: '清空',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => setFavorites([]),
    })
  }

  const lockedIds = useMemo(
    () =>
      Object.entries(locks)
        .filter(([key]) => key !== 'suffix')
        .map(([, value]) => value),
    [locks],
  )

  const tabItems = [
    {
      key: 'candidates',
      label: `候选 ${forge.candidates.length}`,
      children: (
        <div className="nlex__cards">
          {forge.candidates.map((name) => (
            <NameCard
              key={name.id}
              name={name}
              active={name.id === forge.current?.id}
              favored={favSet.has(name.text)}
              onPick={pickName}
              onFavorite={toggleFavorite}
              onCopy={copyName}
            />
          ))}
        </div>
      ),
    },
    {
      key: 'favorites',
      label: `名册 ${favorites.length}`,
      children: favorites.length ? (
        <>
          <div className="nlex__roster-bar">
            <Button size="small" icon={<CopyOutlined />} onClick={copyRoster}>
              复制全部
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={clearRoster}
            >
              清空
            </Button>
          </div>
          <div className="nlex__cards">
            {favorites.map((name) => (
              <NameCard
                key={name.id}
                name={name}
                active={name.id === forge.current?.id}
                favored
                onPick={pickName}
                onCopy={copyName}
                onRemove={toggleFavorite}
              />
            ))}
          </div>
        </>
      ) : (
        <Empty
          className="nlex__empty"
          description="名册还是空的，铸出满意的名字就存进来"
        />
      ),
    },
  ]

  return (
    <div className="nlex">
      <div className="nlex__bg-grid" />

      <header className="nlex__header">
        <div className="nlex__heading">
          <span className="nlex__eyebrow">LEXICON / NAMES</span>
          <h1 className="nlex__title">命名库</h1>
          <p className="nlex__subtitle">
            用语素拼装角色名、称号法术与地名 · 每个名字都带得出释义
          </p>
        </div>
        <dl className="nlex__stats">
          <div>
            <dt>语素</dt>
            <dd>{MORPHEMES.length}</dd>
          </div>
          <div>
            <dt>公式</dt>
            <dd>{formulaList.length}</dd>
          </div>
          <div>
            <dt>名册</dt>
            <dd>{favorites.length}</dd>
          </div>
        </dl>
      </header>

      <div className="nlex__body">
        <aside className="nlex__side">
          <NameForge
            mode={mode}
            style={style}
            gender={gender}
            formula={formula}
            formulaList={formulaList}
            useAncient={useAncient}
            surname={surname}
            current={forge.current}
            locks={locks}
            favored={!!forge.current && favSet.has(forge.current.text)}
            onMode={changeMode}
            onStyle={changeStyle}
            onGender={changeGender}
            onFormula={changeFormula}
            onAncient={changeAncient}
            onSurname={changeSurname}
            onRoll={() => roll()}
            onToggleLock={toggleLock}
            onClearLocks={clearLocks}
            onFavorite={() => toggleFavorite(forge.current)}
            onCopy={() => copyName(forge.current)}
          />

          <Tabs
            className="nlex__tabs"
            activeKey={tab}
            onChange={setTab}
            items={tabItems}
          />
        </aside>

        <div className="nlex__library">
          <MorphemeLibrary onSend={sendMorpheme} lockedIds={lockedIds} />
        </div>
      </div>
    </div>
  )
}
