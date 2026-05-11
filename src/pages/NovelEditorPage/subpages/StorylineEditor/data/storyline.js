export const CHARACTER_TONES = {
  primary:   { fg: '#b5c4ff', border: 'rgba(0, 90, 255, 0.2)',   bg: 'rgba(0, 90, 255, 0.1)' },
  secondary: { fg: '#5d73c0', border: 'rgba(93, 115, 192, 0.2)', bg: 'rgba(93, 115, 192, 0.1)' },
  tertiary:  { fg: '#ffb59f', border: 'rgba(196, 56, 1, 0.2)',   bg: 'rgba(196, 56, 1, 0.1)' },
}

export const storyNodes = [
  {
    id: 'n1',
    type: 'narrative',
    act: '序章 / ACT 01',
    title: '深海档案：觉醒',
    desc: '主角在废弃的钴蓝核心站醒来，发现所有的系统日志都被人为抹除，唯一留下的只有这个终端。',
    icon: 'description',
    characters: [{ name: 'Kaelen', faction: 'Exiles', tone: 'primary' }],
    bottomBranch: {
      type: 'branch',
      label: '分支剧情：潜流',
      labelTone: 'tertiary',
      title: '隐秘的信号源',
    },
  },
  {
    id: 'n2',
    type: 'narrative',
    act: '第一章 / ACT 02',
    title: '钢铁与铁锈',
    desc: '穿越工业废墟区，遭遇了旧时代的维护机器人。在此处必须决定是修复它还是拆解获取零件。',
    icon: 'hub',
    characters: [{ name: 'Oleg', faction: 'Core', tone: 'secondary' }],
  },
  {
    id: 'n3',
    type: 'critical',
    act: '关键节点 / CRITICAL',
    title: '决策点：钴蓝协议',
    options: [
      { id: 'a', label: '选项 A: 启动自毁程序，抹除一切痕迹。', selected: true },
      { id: 'b', label: '选项 B: 尝试连接全球网络，上传档案。' },
    ],
    topBranch: {
      type: 'concept',
      label: '视觉概念: 核心机房',
      labelTone: 'secondary',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuABgNgNBr7EVjZAI-hr4nXSiVXxEYErYcoNUAOmsZFZlIoL5J0FhC6k73kqaQGXO1DSBxAD2-I0C55NrD-U1ofqsgnD6ZNF5lIR36LavQIFL0pH454MONW7tT4P7JF-_DiSbGAzVnCUVDxy7j46XVj-GqkwCSVwP5DcC2MFhQIzsVaof_oHTb6pTkJHhrESVLtxfE5bg3jhlP3Pp7XJArt3abXxow3wW8llDlEt9JuuV0iN_Ftzi4sYTkTE7N6eBSH6qYsWDYeCCc0',
    },
  },
  {
    id: 'n4',
    type: 'narrative',
    act: '第二章 / ACT 03',
    title: '回声回廊',
    desc: '进入档案库中心，每一个声音都会被无限放大。在这里，主角听到了来自过去的求救信号。',
    icon: 'mic',
    characters: [{ name: 'Ghost', faction: 'Void', tone: 'tertiary' }],
  },
]

export const inspectorRelations = [
  { id: 'r1', kind: 'cause',  tone: 'secondary', label: '导致: [序章/档案B]' },
  { id: 'r2', kind: 'lock',   tone: 'tertiary',  label: '锁定: [支线/旧日残响]' },
  { id: 'r3', kind: 'link',   tone: 'default',   label: '链接至: [第一章/钢铁与铁锈]' },
]

export const canvasStatus = {
  zoom: 85,
  ready: true,
  charCount: 45201,
  version: 'Editor v2.4',
  syncLabel: '状态: 已同步',
  conflicts: 12,
}
