import { Segmented, Select, Switch, Button, Tooltip } from 'antd'
import {
  ReloadOutlined,
  HeartOutlined,
  HeartFilled,
  CopyOutlined,
  LockFilled,
  ClearOutlined,
} from '@ant-design/icons'
import { MODES, STYLES, GENDERS } from '../../data/formulas'
import {
  SINGLE_SURNAMES,
  COMPOUND_SURNAMES,
  SURNAME_PRESETS,
  SURNAME_MAP,
  RANDOM_ANY,
} from '../../data/surnames'
import { suffixPinyin } from '../../utils/generate'
import './NameForge.css'

const surnameOption = (item) => ({
  value: item.char,
  label: `${item.char} ${item.pinyin}`,
})

// 复姓、双字祝福语素、三五个字的古语音译都要塞进同一个格子，按字数降档字号
const charClass = (text = '') => {
  if (text.length >= 3) return ' is-longer'
  if (text.length === 2) return ' is-long'
  return ''
}

// 预设在前，具体姓氏分单姓 / 复姓两组，可直接搜中文或拼音
const SURNAME_OPTIONS = [
  { label: '取姓方式', options: SURNAME_PRESETS },
  { label: '单姓', options: SINGLE_SURNAMES.map(surnameOption) },
  { label: '复姓', options: COMPOUND_SURNAMES.map(surnameOption) },
]

// 铸名台：选公式 → 抽名字 → 逐字锁定微调
// 名字的每个字都是一枚可点的 tile，点一下锁住这一位，再抽只换没锁的位
export default function NameForge({
  mode,
  style,
  gender,
  formula,
  formulaList,
  useAncient,
  surname,
  current,
  locks,
  favored,
  onMode,
  onStyle,
  onGender,
  onFormula,
  onAncient,
  onSurname,
  onRoll,
  onToggleLock,
  onClearLocks,
  onFavorite,
  onCopy,
}) {
  const suffix = current?.suffix
  const hasSuffix = !!suffix?.text
  const lockCount = Object.keys(locks).length
  const clan = current?.surname
  // 选中的是某个具体姓氏（而非「随机」之类的预设）时，姓氏这一格算锁定
  const surnameFixed = !!SURNAME_MAP[surname]

  return (
    <section className="forge">
      <Segmented
        block
        className="forge__mode"
        value={mode}
        onChange={onMode}
        options={MODES.map((m) => ({ label: m.label, value: m.key }))}
      />

      <div className="forge__params">
        <label className="forge__param">
          <span className="forge__param-label">风格</span>
          <Segmented
            size="small"
            value={style}
            onChange={onStyle}
            options={STYLES.map((s) => ({ label: s.label, value: s.key }))}
          />
        </label>

        <label className="forge__param">
          <span className="forge__param-label">
            {mode === 'persona' ? '物种 / 流派' : '类型'}
          </span>
          <Select
            size="small"
            value={formula.key}
            onChange={onFormula}
            popupMatchSelectWidth={false}
            options={formulaList.map((f) => ({
              value: f.key,
              label: f.hint ? `${f.label} · ${f.hint}` : f.label,
            }))}
          />
        </label>

        <label className="forge__param">
          <span className="forge__param-label">性别</span>
          <Segmented
            size="small"
            value={gender}
            onChange={onGender}
            options={GENDERS.map((g) => ({ label: g.label, value: g.key }))}
          />
        </label>

        {formula.allowSurname && (
          <label className="forge__param">
            <span className="forge__param-label">姓氏</span>
            <Select
              size="small"
              showSearch
              value={surname}
              onChange={onSurname}
              options={SURNAME_OPTIONS}
              popupMatchSelectWidth={false}
              placeholder="选姓或随机"
            />
          </label>
        )}

        <label className="forge__param forge__param--switch">
          <span className="forge__param-label">掺入古语词根</span>
          <Switch size="small" checked={useAncient} onChange={onAncient} />
        </label>
      </div>

      <p className="forge__template">{formula.template}</p>

      <div className="forge__stage">
        {current ? (
          <>
            <div className="forge__chars">
              {clan && (
                <button
                  type="button"
                  className={`forge__tile forge__tile--surname${
                    surnameFixed ? ' is-locked' : ''
                  }`}
                  onClick={() => onSurname(surnameFixed ? RANDOM_ANY : clan.char)}
                  title={surnameFixed ? '点击恢复随机取姓' : '点击固定这个姓'}
                >
                  {surnameFixed && (
                    <LockFilled className="forge__tile-lock" aria-hidden />
                  )}
                  <span
                    className={`forge__tile-char${charClass(clan.char)}`}
                  >
                    {clan.char}
                  </span>
                  <span className="forge__tile-pinyin">{clan.pinyin}</span>
                  <span className="forge__tile-gloss">姓</span>
                </button>
              )}

              {current.parts.map((part, index) => {
                const locked = !!locks[index]
                return (
                  <button
                    key={`${part.morpheme.id}-${index}`}
                    type="button"
                    className={`forge__tile${locked ? ' is-locked' : ''}`}
                    onClick={() => onToggleLock(index, part.morpheme.id)}
                    title={locked ? '点击解锁这一位' : '点击锁住这一位'}
                  >
                    {locked && (
                      <LockFilled className="forge__tile-lock" aria-hidden />
                    )}
                    <span className={`forge__tile-char${charClass(part.morpheme.char)}`}>
                      {part.morpheme.char}
                    </span>
                    <span className="forge__tile-pinyin">
                      {part.morpheme.pinyin ?? part.morpheme.root}
                    </span>
                    <span className="forge__tile-gloss">
                      {part.morpheme.gloss}
                    </span>
                  </button>
                )
              })}

              {hasSuffix && (
                <button
                  type="button"
                  className={`forge__tile forge__tile--suffix${
                    locks.suffix != null ? ' is-locked' : ''
                  }`}
                  onClick={() => onToggleLock('suffix', suffix.text)}
                  title={locks.suffix != null ? '点击解锁尾缀' : '点击锁住尾缀'}
                >
                  {locks.suffix != null && (
                    <LockFilled className="forge__tile-lock" aria-hidden />
                  )}
                  <span className={`forge__tile-char${charClass(suffix.text)}`}>
                    {suffix.text}
                  </span>
                  <span className="forge__tile-pinyin">
                    {suffixPinyin(suffix.text)}
                  </span>
                  <span className="forge__tile-gloss">{suffix.label}</span>
                </button>
              )}
            </div>

            <p className="forge__gloss">「{current.gloss}」</p>
          </>
        ) : (
          <p className="forge__empty">点下方按钮开始铸名</p>
        )}
      </div>

      <div className="forge__actions">
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={onRoll}
          className="forge__roll"
        >
          铸名
        </Button>
        <Tooltip title={favored ? '已在名册中' : '存入名册'}>
          <Button
            icon={favored ? <HeartFilled /> : <HeartOutlined />}
            onClick={onFavorite}
            disabled={!current}
            className={favored ? 'forge__fav is-on' : 'forge__fav'}
          />
        </Tooltip>
        <Tooltip title="复制名字">
          <Button icon={<CopyOutlined />} onClick={onCopy} disabled={!current} />
        </Tooltip>
        <Tooltip title={lockCount ? `解除 ${lockCount} 处锁定` : '暂无锁定'}>
          <Button
            icon={<ClearOutlined />}
            onClick={onClearLocks}
            disabled={!lockCount}
          />
        </Tooltip>
      </div>

      <p className="forge__examples">
        参考：{formula.examples.join(' · ')}
      </p>
    </section>
  )
}
