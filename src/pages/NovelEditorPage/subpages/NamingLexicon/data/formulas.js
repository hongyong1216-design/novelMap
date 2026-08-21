// 命名库·组名公式
//
// 一条公式描述「怎么把语素拼成名字」：
//   slots     槽位，按顺序抽语素；pos 限词性、tags 限语义（命中任一即可）、空则不限
//   packs     该公式可用的语素包（见 morphemes.js 的 PACKS）
//   suffixes  尾缀，决定性别 / 种族 / 地形，text 为空表示不加尾缀
//   gloss     尾缀在释义里的说法（「微小星辰之男」的「男」），为空则释义不带「之X」
//
// 释义拼法由 mode 决定：
//   persona 角色名   → 语素义相连 + 之 + 尾缀义   微小星辰之男
//   arcana  称号法术 → 语素义相连 + 的 + 尾缀义   流动星辰的咒语
//   place   地名     → 语素义相连 + 之 + 尾缀义   森林星辰之城

export const MODES = [
  { key: 'persona', label: '角色名', code: 'PERSONA' },
  { key: 'arcana', label: '称号 / 法术', code: 'ARCANA' },
  { key: 'place', label: '地名', code: 'PLACE' },
]

export const STYLES = [
  { key: 'west', label: '西式', hint: '音译语素，异世界腔' },
  { key: 'cn', label: '中式', hint: '单字语素，东方玄幻腔' },
]

export const GENDERS = [
  { key: 'any', label: '不限' },
  { key: 'male', label: '男' },
  { key: 'female', label: '女' },
]

// 西式包默认可取的语素池：音译 + 祝福语素
const WEST_PACKS = ['west', 'bless']
// 古语词根单独作为可选池，由「掺入古语」开关决定是否并入
export const ANCIENT_PACK = 'ancient'
const CN_PACKS = ['cn']

// ---------- 角色名 · 西式（按物种） ----------
const PERSONA_WEST = [
  {
    key: 'human',
    label: '人类',
    hint: '通用',
    template: '形容词 + 名词 + 尔/丝/恩/娅',
    slots: [
      { label: '形容词', pos: 'adj' },
      { label: '名词', pos: 'noun' },
    ],
    suffixes: [
      { text: '尔', label: '男性', gloss: '男', gender: 'male' },
      { text: '恩', label: '尊男', gloss: '尊', gender: 'male' },
      { text: '丝', label: '女性', gloss: '女', gender: 'female' },
      { text: '娅', label: '女性', gloss: '女', gender: 'female' },
    ],
    examples: ['米艾尔', '菲莉丝', '奥诺恩'],
  },
  {
    key: 'elf',
    label: '精灵',
    hint: '自然名词叠用',
    template: '自然名词 + 自然名词 + 洛斯/莉安',
    slots: [
      { label: '自然名词', pos: 'noun', tags: ['nature', 'plant', 'sky', 'water'] },
      { label: '自然名词', pos: 'noun', tags: ['nature', 'plant', 'sky', 'water', 'light'] },
    ],
    suffixes: [
      { text: '洛斯', label: '精灵男性', gloss: '男', gender: 'male' },
      { text: '莉安', label: '精灵女性', gloss: '女', gender: 'female' },
    ],
    examples: ['洛莉莉安', '艾洛洛斯', '凯薇莉安'],
  },
  {
    key: 'dwarf',
    label: '矮人',
    hint: '大地 / 矿物',
    template: '大地或矿物名词 + 短后缀 林/达',
    slots: [
      { label: '大地 / 矿物', pos: 'noun', tags: ['earth', 'mineral'] },
      { label: '大地 / 力量', tags: ['earth', 'mineral', 'battle'] },
    ],
    suffixes: [
      { text: '林', label: '矮人男性', gloss: '男', gender: 'male' },
      { text: '达', label: '矮人女性', gloss: '女', gender: 'female' },
    ],
    examples: ['格巴林', '德格达'],
  },
  {
    key: 'orc',
    label: '兽人',
    hint: '力量 / 战斗',
    template: '战斗名词 + 力量语素 + 什',
    slots: [
      { label: '战斗名词', pos: 'noun', tags: ['battle'] },
      { label: '力量语素', tags: ['battle', 'earth', 'fire', 'airy'] },
    ],
    suffixes: [{ text: '什', label: '兽人', gloss: '兽人', gender: 'any' }],
    examples: ['卡雷什', '德巴什'],
  },
  {
    key: 'dragon',
    label: '龙族',
    hint: '元素起首',
    template: '元素名词 + 元素语素 + 苟斯/洛斯',
    slots: [
      { label: '元素名词', pos: 'noun', tags: ['element', 'fire', 'ice', 'light', 'water'] },
      { label: '元素语素', tags: ['element', 'fire', 'ice', 'light', 'battle', 'airy'] },
    ],
    suffixes: [
      { text: '苟斯', label: '龙', gloss: '龙', gender: 'any' },
      { text: '洛斯', label: '古龙', gloss: '古龙', gender: 'any' },
    ],
    examples: ['芙雷苟斯', '伊薇苟斯'],
  },
  {
    key: 'demon',
    label: '魔族',
    hint: '阴影 / 黑暗',
    template: '黑暗名词 + 语素 + 尔/克',
    slots: [
      { label: '黑暗名词', pos: 'noun', tags: ['dark', 'death', 'magic'] },
      { label: '任意语素', tags: ['dark', 'element', 'airy', 'mind', 'battle'] },
    ],
    suffixes: [
      { text: '尔', label: '魔族男性', gloss: '男', gender: 'male' },
      { text: '克', label: '魔族', gloss: '魔', gender: 'any' },
    ],
    examples: ['斯凯尔', '黛曼尔'],
  },
  {
    key: 'undead',
    label: '亡灵',
    hint: '死亡 / 寂静',
    template: '死亡或寂静名词 + 语素 + 恩/斯',
    slots: [
      { label: '死亡 / 寂静', tags: ['death', 'quiet', 'dark'] },
      { label: '幽暗语素', tags: ['death', 'quiet', 'dark', 'fate'] },
    ],
    suffixes: [
      { text: '斯', label: '亡灵', gloss: '亡灵', gender: 'any' },
      { text: '恩', label: '尊亡灵', gloss: '尊亡灵', gender: 'male' },
    ],
    examples: ['丹寂斯', '黛斯恩'],
  },
  {
    key: 'fairy',
    label: '妖精',
    hint: '轻快 / 叠音',
    template: '轻快名词 + 轻快语素（+ 轻后缀）',
    slots: [
      { label: '轻快名词', pos: 'noun', tags: ['airy', 'plant', 'light', 'sound'] },
      { label: '轻快语素', tags: ['airy', 'plant', 'light', 'sound', 'water'] },
    ],
    suffixes: [
      { text: '', label: '不加尾缀', gloss: '', gender: 'any' },
      { text: '莉', label: '轻后缀', gloss: '妖精', gender: 'female' },
      { text: '米', label: '叠音', gloss: '妖精', gender: 'any' },
    ],
    examples: ['米莉', '菲米', '露拉'],
  },
  {
    key: 'divine',
    label: '神族',
    hint: '神圣起首',
    template: '神圣名词 + 语素 + 弥/洛斯',
    slots: [
      { label: '神圣语素', tags: ['holy', 'light', 'bless'] },
      { label: '光辉语素', tags: ['holy', 'light', 'bless', 'fate', 'sky'] },
    ],
    suffixes: [
      { text: '弥', label: '神', gloss: '神', gender: 'any' },
      { text: '洛斯', label: '上神', gloss: '上神', gender: 'any' },
    ],
    examples: ['伊迪弥', '奥伊弥'],
  },
  {
    key: 'merfolk',
    label: '海族',
    hint: '水相关',
    template: '水相关名词 + 语素 + 音/娅',
    slots: [
      { label: '水相关名词', pos: 'noun', tags: ['water'] },
      { label: '水 / 月语素', tags: ['water', 'sky', 'light', 'ice'] },
    ],
    suffixes: [
      { text: '音', label: '海族女性', gloss: '女', gender: 'female' },
      { text: '娅', label: '海族女性', gloss: '女', gender: 'female' },
      { text: '洛', label: '海族男性', gloss: '男', gender: 'male' },
    ],
    examples: ['露西音', '莎露娅'],
  },
  {
    key: 'avian',
    label: '翼人',
    hint: '天空 / 风',
    template: '天空或风名词 + 语素 + 尔/娅',
    slots: [
      { label: '天空 / 风', pos: 'noun', tags: ['sky'] },
      { label: '轻盈语素', tags: ['sky', 'light', 'airy', 'element'] },
    ],
    suffixes: [
      { text: '尔', label: '男性', gloss: '男', gender: 'male' },
      { text: '娅', label: '女性', gloss: '女', gender: 'female' },
    ],
    examples: ['乔凯尔', '乔伊娅'],
  },
]

// ---------- 角色名 · 中式（按气质流派） ----------
const PERSONA_CN = [
  {
    key: 'cn-elegant',
    label: '清雅',
    hint: '山水草木',
    template: '轻盈形容词 + 自然名词',
    slots: [
      { label: '形容词', pos: 'adj', tags: ['airy', 'light', 'water', 'plant', 'quiet'] },
      { label: '自然名词', pos: 'noun', tags: ['nature', 'plant', 'water', 'sky'] },
    ],
    suffixes: [{ text: '', label: '二字名', gloss: '', gender: 'any' }],
    examples: ['澈川', '熹霞', '静林'],
  },
  {
    key: 'cn-martial',
    label: '刚烈',
    hint: '兵戈铁血',
    template: '刚烈形容词 + 战斗名词',
    slots: [
      { label: '形容词', pos: 'adj', tags: ['fire', 'battle', 'mineral'] },
      { label: '战斗名词', pos: 'noun', tags: ['battle', 'mineral'] },
    ],
    suffixes: [{ text: '', label: '二字名', gloss: '', gender: 'any' }],
    examples: ['烈锋', '刚铁', '灼兵'],
  },
  {
    key: 'cn-dark',
    label: '幽冥',
    hint: '阴翳死寂',
    template: '幽暗形容词 + 幽暗名词',
    slots: [
      { label: '形容词', pos: 'adj', tags: ['dark', 'quiet', 'death'] },
      { label: '幽暗名词', pos: 'noun', tags: ['dark', 'death', 'fate'] },
    ],
    suffixes: [{ text: '', label: '二字名', gloss: '', gender: 'any' }],
    examples: ['黯魂', '寂渊', '冥影'],
  },
  {
    key: 'cn-divine',
    label: '神圣',
    hint: '光辉神性',
    template: '光辉形容词 + 神圣名词',
    slots: [
      { label: '形容词', pos: 'adj', tags: ['light', 'holy', 'life'] },
      { label: '神圣名词', pos: 'noun', tags: ['holy', 'light', 'bless'] },
    ],
    suffixes: [{ text: '', label: '二字名', gloss: '', gender: 'any' }],
    examples: ['皓圣', '耀祝', '纯德'],
  },
  {
    key: 'cn-title',
    label: '尊名',
    hint: '三字带尊称',
    template: '形容词 + 名词 + 君/尊/子/仙/煞',
    slots: [
      { label: '形容词', pos: 'adj' },
      { label: '名词', pos: 'noun' },
    ],
    suffixes: [
      { text: '君', label: '君', gloss: '君', gender: 'male' },
      { text: '尊', label: '尊', gloss: '尊', gender: 'any' },
      { text: '子', label: '子', gloss: '子', gender: 'male' },
      { text: '仙', label: '仙', gloss: '仙', gender: 'any' },
      { text: '煞', label: '煞', gloss: '煞', gender: 'any' },
      { text: '姬', label: '姬', gloss: '女', gender: 'female' },
    ],
    examples: ['幽泽君', '炽焰煞', '澄霞姬'],
  },
  {
    key: 'cn-free',
    label: '自由组合',
    hint: '不限语义',
    template: '形容词 + 名词',
    slots: [
      { label: '形容词', pos: 'adj' },
      { label: '名词', pos: 'noun' },
    ],
    suffixes: [{ text: '', label: '二字名', gloss: '', gender: 'any' }],
    examples: ['恒契', '苍穹', '睿灵'],
  },
]

// ---------- 称号 / 法术 ----------
const ARCANA_WEST = [
  {
    key: 'arcana-west',
    label: '术式',
    hint: '动词起首',
    template: '动词 + 名词 + 咒/术/盾/斩',
    slots: [
      { label: '动词', pos: 'verb' },
      { label: '名词', pos: 'noun' },
    ],
    suffixes: [
      { text: '咒', label: '咒', gloss: '咒语', gender: 'any' },
      { text: '术', label: '术', gloss: '法术', gender: 'any' },
      { text: '盾', label: '盾', gloss: '护盾', gender: 'any' },
      { text: '斩', label: '斩', gloss: '斩击', gender: 'any' },
      { text: '印', label: '印', gloss: '封印', gender: 'any' },
    ],
    examples: ['加艾咒', '罗洛术', '特斯盾', '维伊斩'],
  },
]

const ARCANA_CN = [
  {
    key: 'arcana-cn',
    label: '功法',
    hint: '动词起首',
    template: '动词 + 名词 + 诀/术/式/典',
    slots: [
      { label: '动词', pos: 'verb' },
      { label: '名词', pos: 'noun' },
    ],
    suffixes: [
      { text: '诀', label: '诀', gloss: '秘诀', gender: 'any' },
      { text: '术', label: '术', gloss: '法术', gender: 'any' },
      { text: '式', label: '式', gloss: '招式', gender: 'any' },
      { text: '典', label: '典', gloss: '宝典', gender: 'any' },
      { text: '斩', label: '斩', gloss: '斩击', gender: 'any' },
      { text: '印', label: '印', gloss: '法印', gender: 'any' },
    ],
    examples: ['焚穹诀', '凝霜印', '斩魂式'],
  },
  {
    key: 'title-cn',
    label: '尊号',
    hint: '形容词起首',
    template: '形容词 + 名词 + 者/主/王',
    slots: [
      { label: '形容词', pos: 'adj' },
      { label: '名词', pos: 'noun' },
    ],
    suffixes: [
      // 尊号的释义到名词为止就够（「烬火者」＝余烬火焰），再接「之者」反而绕口
      { text: '者', label: '者', gloss: '', gender: 'any' },
      { text: '主', label: '主', gloss: '', gender: 'any' },
      { text: '王', label: '王', gloss: '', gender: 'any' },
      { text: '使', label: '使', gloss: '', gender: 'any' },
    ],
    examples: ['烬火者', '幽渊主', '恒时王'],
  },
]

// ---------- 地名 ----------
const PLACE_WEST = [
  {
    key: 'place-west',
    label: '据点',
    hint: '双名词',
    template: '名词 + 名词 + 城/堡/海/峰',
    slots: [
      { label: '名词', pos: 'noun' },
      { label: '名词', pos: 'noun' },
    ],
    suffixes: [
      { text: '城', label: '城', gloss: '城', gender: 'any' },
      { text: '堡', label: '堡', gloss: '堡垒', gender: 'any' },
      { text: '海', label: '海', gloss: '海', gender: 'any' },
      { text: '峰', label: '峰', gloss: '峰', gender: 'any' },
      { text: '港', label: '港', gloss: '港', gender: 'any' },
      { text: '塔', label: '塔', gloss: '塔', gender: 'any' },
    ],
    examples: ['洛艾城', '格巴堡', '露西海', '乔凯峰'],
  },
]

const PLACE_CN = [
  {
    key: 'place-cn',
    label: '疆域',
    hint: '形容词起首',
    template: '形容词 + 名词 + 关/岭/渊/墟',
    slots: [
      { label: '形容词', pos: 'adj' },
      { label: '名词', pos: 'noun', tags: ['nature', 'earth', 'sky', 'water', 'plant', 'mineral'] },
    ],
    suffixes: [
      { text: '关', label: '关', gloss: '关隘', gender: 'any' },
      { text: '岭', label: '岭', gloss: '山岭', gender: 'any' },
      { text: '渊', label: '渊', gloss: '深渊', gender: 'any' },
      { text: '墟', label: '墟', gloss: '废墟', gender: 'any' },
      { text: '城', label: '城', gloss: '城', gender: 'any' },
      { text: '原', label: '原', gloss: '原野', gender: 'any' },
    ],
    examples: ['苍穹城', '幽沼渊', '凛岚关'],
  },
]

// mode → style → 公式列表
const REGISTRY = {
  persona: { west: PERSONA_WEST, cn: PERSONA_CN },
  arcana: { west: ARCANA_WEST, cn: ARCANA_CN },
  place: { west: PLACE_WEST, cn: PLACE_CN },
}

// 取某个模式 + 风格下的全部公式，顺带把 packs 补齐（西式多一个祝福包）
// allowSurname：只有中式角色名冠姓，西式音译名体系里没有姓，法术和地名也不冠姓
export function getFormulas(mode, style) {
  const list = REGISTRY[mode]?.[style] ?? []
  const packs = style === 'cn' ? CN_PACKS : WEST_PACKS
  return list.map((f) => ({
    ...f,
    mode,
    style,
    packs: f.packs ?? packs,
    allowSurname: mode === 'persona' && style === 'cn',
  }))
}

export function getFormula(mode, style, key) {
  const list = getFormulas(mode, style)
  return list.find((f) => f.key === key) ?? list[0]
}
