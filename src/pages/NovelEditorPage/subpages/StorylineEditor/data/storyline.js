/** 节点标签预设，弹窗里可直接选，也允许手输新标签 */
export const NODE_TAG_OPTIONS = [
  '主线',
  '支线',
  '关键',
  '悬疑',
  '抉择',
  '觉醒',
  '战斗',
  '伏笔',
  '回忆',
  '结局',
]

/** 画布逻辑尺寸，节点坐标即以此为参照 */
export const STAGE_W = 6000
export const STAGE_H = 4000

/** 连接点位置 */
export const ANCHOR_SIDES = ['top', 'right', 'bottom', 'left']

/** 节点坐标 x/y 指卡片左上角；连线记录两端各自挂在哪个连接点上 */
export const storyNodes = [
  {
    id: 'n1',
    act: '序章',
    title: '深海档案：觉醒',
    desc: '主角在废弃的钴蓝核心站醒来，发现所有的系统日志都被人为抹除，唯一留下的只有这个终端。',
    tags: ['主线', '觉醒'],
    x: 200,
    y: 300,
  },
  {
    id: 'n2',
    act: '第一章',
    title: '钢铁与铁锈',
    desc: '穿越工业废墟区，遭遇了旧时代的维护机器人。在此处必须决定是修复它还是拆解获取零件。',
    tags: ['主线', '抉择'],
    x: 620,
    y: 300,
  },
  {
    id: 'n3',
    act: '第二章',
    title: '回声回廊',
    desc: '进入档案库中心，每一个声音都会被无限放大。在这里，主角听到了来自过去的求救信号。',
    tags: ['主线', '悬疑'],
    x: 1040,
    y: 300,
  },
]

/** 连线无方向，from/to 只代表连的时候的先后，不表示剧情走向 */
export const storyEdges = [
  { id: 'e1', from: { nodeId: 'n1', side: 'right' }, to: { nodeId: 'n2', side: 'left' } },
  { id: 'e2', from: { nodeId: 'n2', side: 'right' }, to: { nodeId: 'n3', side: 'left' } },
]

export const canvasStatus = {
  zoom: 85,
  ready: true,
  charCount: 45201,
  version: 'Editor v2.4',
  syncLabel: '状态: 已同步',
}
