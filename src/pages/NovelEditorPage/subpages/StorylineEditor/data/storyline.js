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

/**
 * 画布初始节点：空数组 = 打开就是白纸，点「新增节点」开始建。
 * 形状 { id, act, title, desc, tags: string[], x, y }，x/y 指卡片左上角。
 *
 * 存过盘之后这里就不再生效了 —— data/storyline.json 一旦有 nodes 数组，
 * 开局读的是那份（见 ../index.jsx）。
 */
export const storyNodes = []

/**
 * 画布初始连线。形状 { id, from: { nodeId, side }, to: { nodeId, side } }，
 * side 取 ANCHOR_SIDES 之一。连线无方向，from/to 只代表连的时候的先后，
 * 不表示剧情走向。
 */
export const storyEdges = []

export const canvasStatus = {
  ready: true,
  charCount: 0,
  version: 'Editor v2.4',
  syncLabel: '状态: 已同步',
}
