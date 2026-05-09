export const terrainBrushes = [
  { id: 'rocky', label: '岩石', emoji: '⛰️', image: '/src/assets/area/rocky_terrain.png' },
  { id: 'sea', label: '海水', emoji: '🌊', image: '/src/assets/area/sea_water.png' },
]

// 没有图片的地形使用纯色填充
export const colorBrushes = [
  { id: 'forest', label: '森林', emoji: '🌲', color: '#2d7a3a' },
  { id: 'swamp', label: '沼泽', emoji: '🌿', color: '#5a7a3a' },
  { id: 'desert', label: '沙漠', emoji: '🏜️', color: '#c4a44a' },
  { id: 'snow', label: '雪地', emoji: '🏔️', color: '#e8e8f0' },
  { id: 'lava', label: '岩浆', emoji: '🌋', color: '#c0392b' },
]

export const waterBodies = [
  { id: 'river', label: '河流', emoji: '🌊' },
  { id: 'lake', label: '湖泊', emoji: '💧' },
  { id: 'ocean', label: '海洋', emoji: '🌊' },
  { id: 'current', label: '洋流', emoji: '〰️' },
]

export const roadsPaths = [
  { id: 'highway', label: '官道', emoji: '🛤️' },
  { id: 'trail', label: '小径', emoji: '🥾' },
  { id: 'trade', label: '商路', emoji: '🐪' },
  { id: 'sealane', label: '航线', emoji: '⛵' },
]

export const iconLibrary = [
  { id: 'city', label: '城市', emoji: '🏙️' },
  { id: 'village', label: '村庄', emoji: '🏘️' },
  { id: 'capital', label: '都城', emoji: '👑' },
  { id: 'tower', label: '塔楼', emoji: '🗼' },
  { id: 'ruins', label: '遗迹', emoji: '🏛️' },
  { id: 'dungeon', label: '地牢', emoji: '⚔️' },
  { id: 'port', label: '港口', emoji: '⚓' },
  { id: 'keep', label: '要塞', emoji: '🏰' },
  { id: 'shrine', label: '神殿', emoji: '⛩️' },
]

export const defaultRegions = [
  {
    id: 'veridian',
    name: '翡翠帝国',
    expanded: true,
    visible: true,
    children: [
      { id: 'sunwood', name: '阳木森林', visible: true },
      { id: 'capitalcity', name: '帝都', visible: true },
    ]
  },
  {
    id: 'aurora',
    name: '极光之境',
    expanded: true,
    visible: true,
    children: [
      { id: 'glacial', name: '冰川平原', visible: true },
      { id: 'frostbite', name: '霜蚀峰', visible: true },
    ]
  },
  { id: 'ironcrags', name: '铁岩山脉', expanded: false, visible: true, children: [] },
  { id: 'whisperingsea', name: '低语之海', expanded: false, visible: true, children: [] },
  { id: 'notes', name: '笔记', expanded: false, visible: true, children: [] },
]
