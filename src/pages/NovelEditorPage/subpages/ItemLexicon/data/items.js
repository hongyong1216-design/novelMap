// 物品图鉴的分类、稀有度定义与初始数据
// 当前为前端模拟数据，后续可替换为后端持久化（TODO）

// 物品大类：与「故事背景」中的物品背景设定呼应，这里管理具体的物品实例
// color 用于卡片分类标签的强调色，通过 CSS 变量 --cat-color 注入
export const CATEGORIES = [
  { key: 'weapon', label: '武器', code: 'WEAPON', color: '#ff7a92' },
  { key: 'tech', label: '科技', code: 'TECH', color: '#4ea8de' },
  { key: 'consumable', label: '消耗品', code: 'CONSUMABLE', color: '#4fd6c9' },
  { key: 'artifact', label: '神器', code: 'ARTIFACT', color: '#f5c451' },
]

export const CATEGORY_MAP = CATEGORIES.reduce((acc, c) => {
  acc[c.key] = c
  return acc
}, {})

// 稀有度 / 状态标签：渲染在卡片右上角的角标；common 视为「无标签」不渲染
// order 用于「按稀有度」排序（越大越靠前）
export const RARITIES = [
  { key: 'common', label: '普通', color: '#9494b8', order: 1 },
  { key: 'rare', label: '稀有', color: '#ffb59f', order: 2 },
  { key: 'active', label: '激活', color: '#b5c4ff', order: 3 },
  { key: 'experimental', label: '实验', color: '#a2b5ff', order: 4 },
  { key: 'relic', label: '遗物', color: '#ffb4ab', order: 5 },
]

export const RARITY_MAP = RARITIES.reduce((acc, r) => {
  acc[r.key] = r
  return acc
}, {})

// 演化树用的核心结构示意图（设计稿中根节点与各衍生节点共用同一张「核心」图）
const CORE_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAtxz2YqvK6TXBLpp7_hs1_Cu_nA3z6mMSYyesK8-yNFXdfPXOM7FDitIqtSqzAHhJq3swkV8qvRNn1l8-zM2DR3EscZDJrWBNHjBCMuI2cxGDh-oNHIhIoL3f2O9T5jaIM5usbZsnRcykjPWwO71AQ2tPU1kAvrYBkX6TA04AWCWMI3R28ksvxl5Z-LyvPjzTb7k7MtPpneIXIAkLggguzgh4w00frZZTy_JIwUbS0nGSMVe_8RTnuKV7-lshzHfWdC3hd0rrYPSw'

// 物品字段：
//   name 代号 / alias 中文别名 / type 子类描述 / rarity 稀有度 / desc 描述 / image 图片地址（可空）
//   derivatives 衍生组件（演化树的子节点），每个：
//     { id, name, alias, role, icon('data'|'energy'|'shield'), color, progress(0~1), image, desc, children:[{name, alias}] }
export const initialItems = [
  {
    id: 'item-1',
    category: 'weapon',
    name: 'VOID_EDGE',
    alias: '虚空之刃',
    type: '近战',
    rarity: 'rare',
    desc: '以超压缩碳锻造的刀刃，能以特定频率震荡，斩断分子间的化学键。它是一切衍生组件的奇点锚点，所有部件都与这一核心单元同步其时间频率。',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCjFUV39qS-pLf_WFSGwSdRp4pDlszoiA0X1PVuuHUAkF0zKdwzkQcD0NisvCI66UP2iRQ1kBP9NXTqil1xwgmWJ_Xi9yEqbmzRYH91Tu7KvyMS1wY3_Xh0JiUYlbrSctv-4Vo11EwGXfLUrRWjhU6L6Bxpfpt3kAvoeCT8Rw11ZjRZAeQpd_dWaTnOe4-UVz2FuEzEsosYobBy69Xow1a0Ad14WMo2M7zJxTxnJIamGWLQEBRX7mYBcOmi6kp8S654wxNURGyhKO0',
    derivatives: [
      {
        id: 'CS-091',
        name: 'CORE_SHARD',
        alias: '核心碎片',
        role: '进化分支',
        icon: 'data',
        color: '#a29bfe',
        progress: 0.66,
        image: CORE_IMG,
        desc: '精炼的晶体结构，可存储高密度的神经记忆模式。',
        children: [
          {
            name: 'NULL_VALVE',
            alias: '零点阀门',
            desc: '将核心碎片的溢出能量导入零点维度的单向阀门，防止结构在共振时过载。',
          },
        ],
      },
      {
        id: 'EC-114',
        name: 'ENERGY_CELL',
        alias: '能源电池',
        role: '逻辑回路',
        icon: 'energy',
        color: '#f5a05a',
        progress: 1,
        image: CORE_IMG,
        desc: '采用零点能量提取协议的高容量动力单元。',
      },
      {
        id: 'WS-022',
        name: 'WARP_SHIELD',
        alias: '扭曲护盾',
        role: '衍生组件',
        icon: 'shield',
        color: '#4ea8de',
        progress: 0.25,
        image: CORE_IMG,
        desc: '防御力场发生器，将来袭的动能重定向至虚空之中。',
      },
    ],
  },
  {
    id: 'item-2',
    category: 'tech',
    name: 'NEURAL_SYNC_V4',
    alias: '神经同步',
    type: '强化',
    rarity: 'active',
    desc: '脑机直连接口，让使用者在数字环境中获得亚毫秒级的反应速度。',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDgbcnUN9yiSpzZjYbOGvLL2YDymXSem7qi8l-Ylcidjs53Glpwy4hS2rtt_yvUd7vU5eOd906dbQ6rC93cZ1cwZheopRYCtUBSFSC5TX9j1PtrTxT8fHCP5n0_19RnUXJ7Tpevryxo-BJRSke4SzDO6etLlYxFugHzwX1LZ4ZhLKhZnuL8dtgAL-ghxR_c_ZpFFjpgEThs4IV6p7FOrdLUa98c4Rtyv5KR2Ixgmst_dqZqrD2z5PXedwoCu8vjuH8PXFCCsNfK-us',
    derivatives: [],
  },
  {
    id: 'item-3',
    category: 'consumable',
    name: 'ADRENAL_STIM',
    alias: '肾上腺激素',
    type: '医疗科技',
    rarity: 'common',
    desc: '短时代谢激发剂，消除一切疲惫，代价是事后剧烈的神经震颤。',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAYXlMDU9GWtPBDEqkcpoYnBRLhUSlTdU4bRloxLH4onBWunZsiORMvv35ef6LmHNhI09f93yrprWrVystR_rjmyDdKiTqZ3VEuDIR9oLSJyMjZm5_VMtgrv7zvBHhJV-vIPesHFSeWhkNsbDUAGbmjX6W9ZMzgAfAzkccgUmbu7kw2w0fmgan7ldxYOvA-8Q2OmjjPcdlYtXv2TgBAgslb2GeVIj9IAKFC1Gb090jyTW20E3ZED3WG79flIsL483ZdI8pfXB4MLC4',
    derivatives: [],
  },
  {
    id: 'item-4',
    category: 'artifact',
    name: 'DECR_TABLET',
    alias: '解密石板',
    type: '数据',
    rarity: 'relic',
    desc: '自第七区废墟中寻回，内含「大断连」时代的加密日志。',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBqy1ablDiZmR5jeKTXa9vULEEid-qK8oCVtZRWsXTWoQNcQfhpJfU3A3jkhehrJcqs2rgpLLObo4MR0j86yySNv-oUwnYKNDd3SgPDuRKm_w7WR9OZ_AG24hHjhAVpmZlWmqqL9Vq8O8VwIL4UNNF1rxMFASWTHuEbLytZPTp6NLKbfgPCgGtJ7c3kK1KzrnO_Q370dUAuXdary2CjSel718yW3GrWxaiW8mCOq85FCnNv8cCsn_Ut5KJa1nfwdFvX7mhx3GFWNck',
    derivatives: [],
  },
  {
    id: 'item-5',
    category: 'tech',
    name: 'SALVAGE_GRIPS',
    alias: '拆解握爪',
    type: '工具 / 动力',
    rarity: 'common',
    desc: '拆解作业队的标准配备，可将握力增幅 400%，用于徒手破开船体。',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBLWLZPfm1dTsZN4ZxgmkLCKOoCtLdl5CdswoelqgDa_m-vD6o2GxdZ1UsUBFONxyNWtKVGJ23bM4XTuS6ygkpVEfKZv5ZM8kgWVM0WHBJ0_exvkOiVcXwdZCPTn0HAnoaLolG7Dj3qrru00fzMEruAtT4NrDVbBZ8Bc_tbCFnjivCs95lcif43AjW9FmUIHhIN_g9BYWdX5A2wfIirrztldBNVggfX8jkrxjJ7eIAkX2jYv_JF4K4a5FEev5lEIHpZwOGwwj4eMAY',
    derivatives: [],
  },
  {
    id: 'item-6',
    category: 'artifact',
    name: 'GRAV_CORE',
    alias: '引力核心',
    type: '科技 / 引力',
    rarity: 'experimental',
    desc: '局部引力扭曲装置，极不稳定，务必在磁阻尼场中操作。',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLGMUq5VtzMt9idvQbAiSU8RnwFk6i6_HKb9d9WFN0MurlGHYX6beIKlR3uVn_xUWrbNBuQOA_0WnfGdFuqMQhi92oMkA9ewZ6Fevm9TqsbA6MyvtFwQQm4890B7CHOtlUzzYq_IRZDPZdW7bj-2-zJ7DHK9d23H29gRIssAE5AY0LOnRu7wBtwuIuHhQw0iziyG5HGENS4O9r8v4nJkriqPIfGLJapvsYz9TCmKDW6VaHv5paGnppcA6Twg7SQlV2Qe8OmV147R4',
    derivatives: [],
  },
]
