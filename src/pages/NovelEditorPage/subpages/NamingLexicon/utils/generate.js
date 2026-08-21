import { MORPHEMES, MORPHEME_MAP } from '../data/morphemes'
import { surnamePool } from '../data/surnames'

// 尾缀读音表：尾缀写在公式里只有汉字，读音集中在这里按字查，
// 免得每条公式都重复标一遍拼音
const SUFFIX_PINYIN = {
  尔: 'ěr', 丝: 'sī', 恩: 'ēn', 娅: 'yà', 洛: 'luò', 斯: 'sī',
  莉: 'lì', 安: 'ān', 林: 'lín', 达: 'dá', 什: 'shí', 苟: 'gǒu',
  克: 'kè', 米: 'mǐ', 弥: 'mí', 音: 'yīn', 君: 'jūn', 尊: 'zūn',
  子: 'zǐ', 仙: 'xiān', 煞: 'shà', 姬: 'jī', 咒: 'zhòu', 术: 'shù',
  盾: 'dùn', 斩: 'zhǎn', 印: 'yìn', 诀: 'jué', 式: 'shì', 典: 'diǎn',
  者: 'zhě', 主: 'zhǔ', 王: 'wáng', 使: 'shǐ', 城: 'chéng', 堡: 'bǎo',
  海: 'hǎi', 峰: 'fēng', 港: 'gǎng', 塔: 'tǎ', 关: 'guān', 岭: 'lǐng',
  渊: 'yuān', 墟: 'xū', 原: 'yuán',
}

export const suffixPinyin = (text = '') =>
  text
    .split('')
    .map((c) => SUFFIX_PINYIN[c] || '')
    .filter(Boolean)
    .join(' ')

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

const genId = () =>
  `nm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

// 槽位候选：pack → pos → tags 逐级收窄，收窄到空就退回上一级，
// 保证任何公式都抽得出语素（标签定得再窄也不会卡住）
export function slotCandidates(slot, packs) {
  const inPack = MORPHEMES.filter((item) => packs.includes(item.pack))
  const byPos = slot.pos
    ? inPack.filter((item) => item.pos === slot.pos)
    : inPack
  const base = byPos.length ? byPos : inPack

  if (slot.tags?.length) {
    const byTag = base.filter((item) =>
      slot.tags.some((t) => item.tags.includes(t)),
    )
    if (byTag.length) return byTag
  }
  return base
}

// 抽一个名字
//   locks   槽位锁定：{ 0: morphemeId, 1: morphemeId, suffix: '尔' }，锁住的位不重抽
//   gender  尾缀性别过滤，该性别无可用尾缀时自动放开（如海族只有女性尾缀）
//   surname 姓氏选择器的取值，仅对 allowSurname 的公式（中式角色名）生效
export function rollName(formula, options = {}) {
  const { gender = 'any', packs, locks = {}, surname = '' } = options
  const pool = packs?.length ? packs : formula.packs

  const usedChars = new Set()
  const parts = formula.slots.map((slot, index) => {
    const locked = locks[index] ? MORPHEME_MAP[locks[index]] : null
    let morpheme = locked

    if (!morpheme) {
      const candidates = slotCandidates(slot, pool)
      // 同名两次读着别扭，先排掉已用过的字
      const fresh = candidates.filter((item) => !usedChars.has(item.char))
      morpheme = pick(fresh.length ? fresh : candidates)
    }

    usedChars.add(morpheme.char)
    return { slot: slot.label, morpheme, locked: !!locked }
  })

  const suffix = rollSuffix(formula, { gender, locks, usedChars })
  const chars = parts.map((p) => p.morpheme.char).join('')
  const clan = formula.allowSurname
    ? rollSurname(surname, parts[0]?.morpheme.char)
    : null
  const body = parts.map((p) => p.morpheme.gloss).join('')
  const connector = formula.mode === 'arcana' ? '的' : '之'

  return {
    id: genId(),
    text: (clan?.char ?? '') + chars + (suffix?.text ?? ''),
    surname: clan,
    parts,
    suffix,
    // 姓不带实义，释义只讲名的部分
    gloss: suffix?.gloss ? `${body}${connector}${suffix.gloss}` : body,
    pinyin: [
      clan?.pinyin ?? '',
      ...parts.map((p) => p.morpheme.pinyin ?? p.morpheme.root ?? ''),
      suffixPinyin(suffix?.text ?? ''),
    ]
      .filter(Boolean)
      .join(' '),
    formulaKey: formula.key,
    formulaLabel: formula.label,
    mode: formula.mode,
    style: formula.style,
  }
}

// 「林」姓配上「林霞」会读成叠字，随机时避开与名首字同字的姓
function rollSurname(value, firstChar) {
  const candidates = surnamePool(value)
  if (!candidates?.length) return null
  const fresh = candidates.filter((item) => item.char.slice(-1) !== firstChar)
  return pick(fresh.length ? fresh : candidates)
}

function rollSuffix(formula, { gender, locks, usedChars }) {
  const list = formula.suffixes ?? []
  if (!list.length) return null

  if (locks.suffix != null) {
    const found = list.find((s) => s.text === locks.suffix)
    if (found) return { ...found, locked: true }
  }

  let pool = list
  if (gender && gender !== 'any') {
    const matched = pool.filter((s) => s.gender === gender || s.gender === 'any')
    if (matched.length) pool = matched
  }

  // 尾缀首字撞上末位语素（「斯」+「斯凯」）时换一个
  const lastChar = [...usedChars].pop()?.slice(-1)
  const noEcho = pool.filter((s) => !s.text || s.text[0] !== lastChar)
  return pick(noEcho.length ? noEcho : pool)
}

// 批量抽取并按名字去重；多抽几轮兜底，抽不满就返回实际条数
export function rollBatch(formula, options = {}, count = 8) {
  const seen = new Set()
  const out = []
  for (let i = 0; i < count * 10 && out.length < count; i += 1) {
    const name = rollName(formula, options)
    if (seen.has(name.text)) continue
    seen.add(name.text)
    out.push(name)
  }
  return out
}

// 语素能落进公式的哪个槽位：给「语素库 → 铸名台」的一键锁定用
export function findSlotFor(formula, morpheme, packs) {
  const pool = packs?.length ? packs : formula.packs
  if (!pool.includes(morpheme.pack)) return -1

  const exact = formula.slots.findIndex(
    (slot) =>
      (!slot.pos || slot.pos === morpheme.pos) &&
      (!slot.tags?.length || slot.tags.some((t) => morpheme.tags.includes(t))),
  )
  if (exact >= 0) return exact

  const byPos = formula.slots.findIndex(
    (slot) => !slot.pos || slot.pos === morpheme.pos,
  )
  return byPos
}
