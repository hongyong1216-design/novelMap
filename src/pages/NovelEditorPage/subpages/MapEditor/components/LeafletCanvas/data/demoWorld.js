// ============================================================
// 测试用图片映射: 把图片放到 public/maps/ 后, 在下方写一行映射即可
// key  = cellId (L{level}-{x}-{y})
// val  = 相对项目根的图片 URL (Vite 把 public/* 暴露在根路径)
// 后缀任意 (png / jpg / jpeg / webp / svg / gif), 跟实际文件一致就行
// 修改后 Vite HMR 会自动刷新, 无需重启
// ============================================================
const IMAGES = {
  // L0 层 (整个世界 8x8, 单格 4096px)
  'L0-3-3': '/maps/L0-3-3.png',
  'L0-3-4': '/maps/L0-3-4.jpeg',
  // 'L0-4-3': '/maps/L0-4-3.webp',
  // 'L0-4-4': '/maps/L0-4-4.webp',

  // L1 层 (L0-3-4 内细分 4x4, 单格 1024px)
  // 'L1-12-16': '/maps/L1-12-16.webp',
  'L1-13-16': '/maps/L1-13-16.jpeg',
  // 'L1-14-16': '/maps/L1-14-16.webp',

  // L2 层 (L1-13-16 内细分 4x4, 单格 256px)
  // 'L2-52-64': '/maps/L2-52-64.webp',
  // 'L2-53-64': '/maps/L2-53-64.webp',
}

const cell = (id, props) => ({
  ...props,
  filled: true,
  ...(IMAGES[id] ? { src: IMAGES[id] } : {}),
})

export const demoWorld = {
  cells: {
    'L0-3-3': cell('L0-3-3', { name: '北境联邦' }),
    'L0-3-4': cell('L0-3-4', { name: '艾瑟尔加德' }),
    'L0-4-3': cell('L0-4-3', { name: '中央平原' }),
    'L0-4-4': cell('L0-4-4', { name: '南方公国' }),

    'L1-12-16': cell('L1-12-16', { parent: 'L0-3-4', name: '青翠林地' }),
    'L1-13-16': cell('L1-13-16', { parent: 'L0-3-4', name: '王城周边' }),
    'L1-14-16': cell('L1-14-16', { parent: 'L0-3-4', name: '东部山脉' }),
    'L1-12-17': cell('L1-12-17', { parent: 'L0-3-4' }),
    'L1-13-17': cell('L1-13-17', { parent: 'L0-3-4' }),
    'L1-14-17': cell('L1-14-17', { parent: 'L0-3-4' }),
    'L1-12-18': cell('L1-12-18', { parent: 'L0-3-4' }),
    'L1-13-18': cell('L1-13-18', { parent: 'L0-3-4' }),

    'L2-52-64': cell('L2-52-64', { parent: 'L1-13-16', name: '王城中心' }),
    'L2-53-64': cell('L2-53-64', { parent: 'L1-13-16' }),
    'L2-52-65': cell('L2-52-65', { parent: 'L1-13-16' }),
    'L2-53-65': cell('L2-53-65', { parent: 'L1-13-16' }),
  },

  markers: [
    { id: 'm1', type: 'city',     name: '王城',   coord: [17200, 13500], minZoom: 0 },
    { id: 'm2', type: 'city',     name: '港口城', coord: [19800, 16500], minZoom: 1 },
    { id: 'm3', type: 'building', name: '古塔',   coord: [17500, 13800], minZoom: 3 },
    { id: 'm4', type: 'landmark', name: '神殿',   coord: [17100, 14200], minZoom: 2 },
  ],

  regions: [
    {
      id: 'r1',
      name: '艾瑟尔加德',
      minZoom: -4,
      polygon: [
        [16384, 12288],
        [16384, 16384],
        [20480, 16384],
        [20480, 12288],
      ],
    },
  ],

  routes: [
    {
      id: 't1',
      name: '北南大道',
      minZoom: 1,
      line: [
        [12000, 13000],
        [18000, 14000],
        [24000, 15000],
      ],
      style: 'solid',
    },
    {
      id: 't2',
      name: '海上航线',
      minZoom: 2,
      line: [
        [22000, 16000],
        [21000, 18000],
        [20000, 20000],
      ],
      style: 'dashed',
    },
  ],

  labels: [
    { id: 'l1', text: '艾瑟尔加德', coord: [18432, 14336], minZoom: -4, size: 'lg' },
    { id: 'l2', text: '北境联邦',   coord: [14336, 14336], minZoom: -4, size: 'lg' },
    { id: 'l3', text: '青翠林地',   coord: [17000, 12800], minZoom: 1,  size: 'md' },
    { id: 'l4', text: '王城',       coord: [17200, 13500], minZoom: 3,  size: 'sm' },
  ],
}
