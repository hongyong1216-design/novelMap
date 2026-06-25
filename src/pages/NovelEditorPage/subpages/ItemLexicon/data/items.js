// 物品图鉴的分类、稀有度定义与初始数据
// 当前为前端模拟数据，后续可替换为后端持久化（TODO）

// 物品大类：与「故事背景」中的物品背景设定呼应，这里管理具体的物品实例
// color 用于卡片分类标签的强调色，通过 CSS 变量 --cat-color 注入
export const CATEGORIES = [
  { key: 'vehicle', label: '载具', code: 'VEHICLE', color: '#6ea8ff' },
  { key: 'gear', label: '装备', code: 'GEAR', color: '#a98bff' },
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
    id: 'item-vessel-xingcha',
    category: 'vehicle',
    name: '星槎号',
    alias: '星槎级旗舰',
    type: '深空载具 / 旗舰',
    rarity: 'active',
    desc: '2075 年人类深空时代的标志性产物——集星际运输、科学考察与深空救援于一体的模块化旗舰级深空载具。沿用代达罗斯计划的核聚变推进架构、石墨烯-碳纳米管复合超材料船体，由地球轨道船坞集群与月球背面制造基地联合建造，全舰可经轨道工厂在轨更换任务模块。',
    image: CORE_IMG,
    derivatives: [
      {
        name: '推进系统',
        role: '双模式聚变推进',
        icon: 'energy',
        color: '#f5a05a',
        progress: 1,
        image: CORE_IMG,
        desc: '惯性约束核聚变主引擎（ICFE-Mk.IX）＋VASIMR 电推阵列的「粗调＋精调」双模式系统，巡航比冲约 15,000 秒、冲刺可达 50,000 秒，携 8.5 万吨氘-氦3 混合燃料。',
        children: [
          {
            name: '聚变主引擎',
            desc: '高能激光阵列点燃氘-氦3 燃料微球，超导磁喷嘴将高能等离子体定向后方喷射；巡航/冲刺双模式切换。',
          },
          {
            name: '电推阵列',
            desc: '6 台可变比冲磁等离子体火箭，以锂金属蒸气为推进剂、聚变堆供电，单台 500kW–1MW、比冲 3,000–30,000 秒可调，主机关闭时做精确调姿。',
          },
          {
            name: '化学起降模块',
            desc: '可分离化学辅助推进，液态甲烷＋液氧，用于地球/火星等有大气天体起降（火星可经 Sabatier 过程原位制燃料）。',
          },
        ],
      },
      {
        name: '材料与结构',
        role: '超材料船体',
        icon: 'shield',
        color: '#4fd6c9',
        progress: 1,
        image: CORE_IMG,
        desc: '石墨烯-碳纳米管复合超材料为骨，抗拉强度超钢铁 100 倍、干重较铝合金降低约 60%，由轨道 3D 打印工厂分段制造、微重力成型组装；外覆三层防护装甲。全长 650 米，满载约 12 万吨。',
        children: [
          {
            name: '装甲外层',
            desc: '石墨烯增强陶瓷基复合材料，抵御微流星体撞击。',
          },
          {
            name: '装甲中层',
            desc: '再生式辐射屏蔽层（富氢高分子材料），吸收银河宇宙射线。',
          },
          {
            name: '装甲内层',
            desc: '自修复聚合物，微损伤后自动密封。',
          },
        ],
      },
      {
        name: '能源系统',
        role: '聚变供电',
        icon: 'energy',
        color: '#f5c451',
        progress: 1,
        image: CORE_IMG,
        desc: '同一座核聚变堆既驱动喷流、也供养全船 200 兆瓦电力；另备太阳能帆板、飞轮储能与小型裂变堆，以防主堆停摆。',
        children: [
          {
            name: '主反应堆',
            desc: '核聚变堆提供 200 兆瓦持续电力。',
          },
          {
            name: '太阳能帆板',
            desc: '大面积石墨烯基太阳能帆板，翼展 300 米，峰值功率 15 兆瓦。',
          },
          {
            name: '应急电源',
            desc: '超导飞轮储能系统＋小型裂变备用堆。',
          },
        ],
      },
      {
        name: '生命支持',
        role: '闭环维生',
        icon: 'data',
        color: '#4ea8de',
        progress: 0.99,
        image: CORE_IMG,
        desc: '闭环生命支持系统（ECLSS）以 Sabatier 过程再生氧气，水循环回收率 99.9%、空气 99.5%；居住区缓慢旋转模拟 0.6–0.9G 人工重力，生态舱供给新鲜口粮。',
        children: [
          {
            name: '水气循环',
            desc: '水回收率 99.9%、空气回收率 99.5%，Sabatier 过程令二氧化碳与氢反应生成甲烷与水。',
          },
          {
            name: '人工重力',
            desc: '居住区每分钟 0.8 转，产生 0.6–0.9G。',
          },
          {
            name: '生态舱',
            desc: '垂直农场与水培系统，产新鲜蔬果与藻类蛋白，并以基因编辑优化作物的抗辐射能力。',
          },
        ],
      },
      {
        name: '通讯导航',
        role: '自主航行',
        icon: 'data',
        color: '#a29bfe',
        progress: 0.95,
        image: CORE_IMG,
        desc: '深空通联时延显著，星槎号高度倚重自主：激光通信对地 10 Gbps，星敏感器＋脉冲星导航 1 光年定位精度 10 公里，舰载强人工智能独力担纲航线规划、故障诊断与紧急决策。',
        children: [
          {
            name: '激光通信阵列',
            desc: '对地数据速率 10 Gbps，可传输高清视频。',
          },
          {
            name: '脉冲星导航',
            desc: '星敏感器＋脉冲星导航系统，1 光年尺度下定位精度 10 公里。',
          },
          {
            name: '舰载强人工智能',
            desc: '负责航线规划、故障诊断与紧急决策，是深空自主航行的中枢。',
          },
        ],
      },
      {
        name: '生命方舟',
        role: '深空医疗网',
        icon: 'data',
        color: '#4fd6c9',
        progress: 0.9,
        image: CORE_IMG,
        desc: '舰体中部 0.8G 环形重力区五百平方米常驻医疗舱，重症监护对标地表三甲医院。全舰医疗依距离分三层：舰载医疗中心坐镇于后、飞廉外骨骼随身急救于前、青鸟无人机往来后送，连成一张深空生命之网。',
        children: [
          {
            name: '司命',
            alias: '预警诊断中枢',
            desc: '全身无创分子扫描舱（太赫兹断层＋飞秒拉曼）三秒生成细胞级数据，纳米探针昼夜监测，可在成瘤前/病毒潜伏期便发预警。',
          },
          {
            name: '女娲',
            alias: '再生外科中心',
            desc: '六根微米级磁悬浮机械臂＋飞秒冷激光刀，「造化液」诱导干细胞定向再生，生物打印急救站就地打印骨/皮植片直接移植。',
          },
          {
            name: '镇渊',
            alias: '高压氧舱',
            desc: '可模拟三个大气压、供氦氧混合气，舱体独立旋转辅助血液再分布，专治深空减压病。',
          },
          {
            name: '濯尘',
            alias: '辐射净化舱',
            desc: '铅＋含硼聚乙烯屏蔽，喷淋 SOD 与褪黑素雾化脂质体，将急性辐射病致死率自九成压到一成二。',
          },
          {
            name: '黄粱',
            alias: '冬眠维护模块',
            desc: '氟碳人工血液微循环将体温降至 18℃、代谢压到常态 5%；「桃源」神经调节室释放 θ/α 波疗愈深空抑郁。',
          },
          {
            name: '青鸟',
            alias: '医疗后送无人机',
            desc: '直径 1.2 米八轴涵道飞行器，真空大气皆可飞，机械臂＋急救模块自主入战区止血封创，如空中担架牵引昏迷伤员返舰。',
          },
        ],
      },
      {
        name: '主动打击',
        role: '进攻武器组',
        icon: 'energy',
        color: '#ff7a92',
        progress: 0.85,
        image: CORE_IMG,
        desc: '远以光束狙杀、近以导弹与轨道炮饱和倾泻，极致处自轨道向星表投下动能天罚。全系由舰载强人工智能统一协调，命名取华夏古意。',
        children: [
          {
            name: '羿矢',
            alias: '激光主炮',
            desc: '核聚变反应堆直接供能的高能激光，沿舰体中轴布置、光束可贯穿首尾，专司主力舰对决与远距精确狙杀。',
          },
          {
            name: '天罡',
            alias: '智能导弹群',
            desc: '每弹搭载小型 AI 与可调当量聚变战斗部，飞行中自主编队、聚散如天罡星阵，用于反舰与区域封锁。',
          },
          {
            name: '雷公锤',
            alias: '电磁轨道炮',
            desc: '超导电磁轨道将钨合金弹丸加速至数万公里每秒，动能巨大极难拦截，专攻动能穿透与反装甲目标。',
          },
          {
            name: '天柱',
            alias: '天基动能武器',
            desc: '舰腹挂载数吨重钨/钛/铀合金长棒，自轨道倾泻而下施以精确动能打击，用于行星轰炸与战略威慑。',
          },
        ],
      },
      {
        name: '被动防御',
        role: '防护武器组',
        icon: 'shield',
        color: '#b5c4ff',
        progress: 0.85,
        image: CORE_IMG,
        desc: '由内而外层层设防：罡盾偏导能束、金钟散雾御弹、蒺藜近防补漏，天罗与参宿前出远拦、清扫航路。',
        children: [
          {
            name: '蒺藜',
            alias: '近防激光阵列',
            desc: '遍布舰体的小型高能激光炮塔，拦截来袭导弹、小型飞行器及陨石碎片。',
          },
          {
            name: '金钟罩',
            alias: '破片金属雾',
            desc: '于飞船周围散布预制破片与金属微粒云，结成无形罩护，摧毁或偏转近距来袭的动能弹药。',
          },
          {
            name: '天罗',
            alias: '拦截卫星群',
            desc: '释放微型拦截卫星集群，结成外层防御圈，于远距拦截来袭导弹。',
          },
          {
            name: '玄武罡盾',
            alias: '偏导力场护盾',
            desc: '以强力磁场偏转高能粒子与等离子体，兼防能量武器与太空辐射。',
          },
          {
            name: '参宿',
            alias: '前置无人机群',
            desc: '向航路前方撒布无人机蜂群，提前清除航道上的危险物，为先驱开路。',
          },
        ],
      },
    ],
  },
  {
    id: 'item-gear-feilian',
    category: 'gear',
    name: '飞廉',
    alias: '战术突击外骨骼',
    type: '单兵外骨骼 / 突击',
    rarity: 'active',
    desc: '星槎号舰队列装的单兵作战外骨骼，专为真空与有大气环境下的轨道突击、登舰与近距清剿而生。其名取自华夏风神飞廉，喻其疾如奔雷、纵跃凌空。武器、推进与感官皆与外骨骼的神经接口、火控系统深度绑定，化作一具随身军火库；整备质量 285 公斤，借主动承重系统穿戴者体感仅 15 公斤。',
    image: CORE_IMG,
    derivatives: [
      {
        name: '能源与架构',
        role: '聚变供能',
        icon: 'energy',
        color: '#f5a05a',
        progress: 1,
        image: CORE_IMG,
        desc: '「火种」微型可控聚变电池组供养全身：激光约束氘-氦3 微反应，峰值输出 120 千瓦、持续作战续航 72 小时，是一切高耗能推进与武器的动力源泉；主动承重外骨骼则化重为轻。',
        children: [
          {
            name: '火种',
            alias: '聚变电池组',
            desc: '微型可控聚变电池组，激光约束氘-氦3 微反应，峰值输出 120 千瓦，持续作战续航 72 小时。',
          },
          {
            name: '承重骨架',
            alias: '主动外骨骼',
            desc: '主动承重系统加持，整备质量 285 公斤，穿戴者体感重量仅 15 公斤。',
          },
        ],
      },
      {
        name: '机动系统',
        role: '三模混合动力',
        icon: 'energy',
        color: '#4ea8de',
        progress: 0.95,
        image: CORE_IMG,
        desc: '覆盖真空与大气的「三模混合动力」构架——陆地疾驰、矢量微调、短暂滞空，三者无缝切换。',
        children: [
          {
            name: '陆地提速',
            alias: '人工肌肉束',
            desc: '电活性聚合物人工肌肉束＋磁悬浮无摩擦膝关节，平地 0–60km/h 仅需 1.2 秒、冲刺极限 90km/h，「爆发跳跃」垂直弹跳提升 400%。',
          },
          {
            name: '矢量推进',
            alias: '万向推进器',
            desc: '全身 12 个万向冷气/等离子体混合推进器，以高压氩气为工质、每枚推力 200N、响应 0.02 秒，用于真空姿态微调与零重力精准位移。',
          },
          {
            name: '短暂滞空',
            alias: '推进背包',
            desc: '背部双模式涡扇/离子推进背包，大气模式 600kgf 升力可低速飞行，真空模式离子喷射比冲 8000 秒，火星 0.38G 下可滞空巡航 15–20 分钟。',
          },
          {
            name: '热管理',
            alias: '散热鳍片',
            desc: '背甲内嵌液态金属循环散热管路，将推进器与武器的高温导往全身石墨烯辐射散热鳍片，避免红外信号过强而暴露目标。',
          },
        ],
      },
      {
        name: '防护材质',
        role: '多层装甲',
        icon: 'shield',
        color: '#4fd6c9',
        progress: 1,
        image: CORE_IMG,
        desc: '由外而内三重防护：自感应硬化主装甲、剪切增稠液态内衬、电致变色隐身涂层，兼顾抗弹、卸力与低可探测。',
        children: [
          {
            name: '主装甲',
            alias: '自感应叠层',
            desc: '自感应石墨烯-二硫化钼复合叠层，遭动能弹冲击时局部瞬间硬化并向外炸裂卸力（类反应装甲原理），可抵御 12.7mm 穿甲弹直射。',
          },
          {
            name: '液态内衬',
            alias: '剪切增稠护甲',
            desc: '剪切增稠液态护甲，静止时柔软、受冲击瞬间凝为固态，吸收冲击动能。',
          },
          {
            name: '隐身涂层',
            alias: '电致变色',
            desc: '可变色电致红外涂层，依背景环境主动调节热信号与可见光反射率，实现光学＋红外双重低可探测。',
          },
        ],
      },
      {
        name: '医疗系统·青囊',
        role: '单兵野战层',
        icon: 'data',
        color: '#6ee7b7',
        progress: 0.9,
        image: CORE_IMG,
        desc: '一体化战场维生系统「青囊」，是星槎号「生命方舟」延伸至单兵的最前沿野战层；不外挂额外装置，复用外骨骼既有内衬、人工肌肉、液态金属管路与「火种」供能，由随身智能自动运作，纵使重伤昏迷亦能自救续命，重伤者经「青鸟」无人机后送回舰载医疗中心。',
        children: [
          {
            name: '悬丝',
            alias: '体征监测网',
            desc: '前臂内衬密布柔性传感器，实时监测心率变异性、血氧、皮肤电阻、乳酸与神经状态，可提前约十秒预警晕厥与心搏骤停。',
          },
          {
            name: '金疮',
            alias: '止血密封',
            desc: '探测到躯干或关节被贯穿时 0.1 秒注射壳聚糖-纳米纤维发泡凝胶，遇血膨胀二十倍凝成密封塞，真空环境亦防体液因压差沸腾外泄。',
          },
          {
            name: '百草',
            alias: '战术药剂',
            desc: '脊柱旁微流控芯片读取痛觉与疲劳度，微量释放非成瘾定制肽——「觉醒」消疲、「冰息」阻断痛觉、「静默」缺氧增氧；另备止血、强心、广谱抗生素。',
          },
          {
            name: '洗髓',
            alias: '辐射清除',
            desc: '颈后皮下注射泵内置上万具纳米级清洁机器人，辐射超标即注入血流、携 DNA 修复酶修复被击断的双链，数分钟内涤净体内之伤。',
          },
          {
            name: '银针',
            alias: '生化嗅探',
            desc: '头盔气体采样口实时质谱分析周围空气，遇神经毒气、未知孢子或氧含量骤降即自动封闭面罩、切换循环供氧。',
          },
          {
            name: '续断',
            alias: '刚性固定',
            desc: '检测到肢节骨折或重创时，对应外骨骼节段瞬间锁定刚化，化作随身夹板固定伤处、分担承重，防止二次损伤。',
          },
          {
            name: '续命',
            alias: '应急维生',
            desc: '环境失压时颈环密封供氧，液态金属管路反向循环为躯干保温，与银针、金疮协同维持体内环境，争取黄金救援窗口。',
          },
          {
            name: '岐黄',
            alias: '远程托管',
            desc: '可接入星槎号舰载智能与随舰军医远程诊断；士兵失能昏迷时托管外骨骼人工肌肉，自主操控伤员脱离战场、撤往安全区，等候「青鸟」后送。',
          },
        ],
      },
      {
        name: '随身军火库',
        role: '集成武备',
        icon: 'energy',
        color: '#ff7a92',
        progress: 0.9,
        image: CORE_IMG,
        desc: '武器与神经接口、火控系统深度绑定，分手持的主副武器，以及固定于本体的集成近战与防御武器。',
        children: [
          {
            name: '穿云',
            alias: '电磁突击步枪',
            desc: '6.8mm 高密度钨芯脱壳尾翼稳定弹，初速 4500 m/s，背部弹药箱电磁弹链直供备弹 2000 发，肩关节液压抵消 90% 后坐力，集成激光压制致盲模块。',
          },
          {
            name: '离火',
            alias: '脉冲激光手枪',
            desc: '功率可调，最大单脉冲 5 千焦，用于破开轻型舱门、引爆远处爆炸物，或主武器故障时近战自卫。',
          },
          {
            name: '毒针',
            alias: '前臂激光阵列',
            desc: '双前臂外侧微晶格激光阵列，每臂 30 个发射点瞬间张开高密度激光网，拦截近身碎片、引爆飞来手雷或近距灼伤。',
          },
          {
            name: '蜂刺',
            alias: '微型导弹舱',
            desc: '左肩甲智能微型导弹舱（6 联装），每枚拇指大小、搭载视觉追踪可独立锁定 6 个目标，战斗部为定向能或高爆聚能装药，射程 5 公里。',
          },
          {
            name: '莫邪',
            alias: '等离子震动刀',
            desc: '右腿外侧高频等离子震动刀，折叠收纳，伸出后刀锋包裹 8000℃ 高温等离子体，可瞬间切割舰船复合装甲或敌方机械臂。',
          },
        ],
      },
      {
        name: '感官与火控',
        role: '心到枪到',
        icon: 'data',
        color: '#a29bfe',
        progress: 0.95,
        image: CORE_IMG,
        desc: '全景感知＋脑机辅助瞄准＋战场数据链，将视野、瞄准与战场态势融为一体，做到「心到枪到」。',
        children: [
          {
            name: '感知头盔',
            alias: '全景视野',
            desc: '360° 光学/红外/紫外全景摄像头，图像实时投射于视网膜显示屏，实现无死角视野。',
          },
          {
            name: '辅助瞄准',
            alias: '脑机接口',
            desc: '非侵入式电极读取大脑运动皮层信号，凝视目标时武器电磁悬架自动微调枪口指向凝视点，瞄准时间缩短至 0.1 秒。',
          },
          {
            name: '战场数据链',
            alias: '战术组网',
            desc: '可接入星槎号舰载智能，实时接收敌方位置、掩体结构与最优突击路径。',
          },
        ],
      },
    ],
  },
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
