export const STAGE_WIDTH = 2000
export const STAGE_HEIGHT = 1200

export const mapRegions = [
  {
    id: 'veridian',
    name: '翡翠帝国',
    path: 'M300 100 Q400 80 550 90 Q700 70 800 100 Q850 120 900 110 Q950 130 1000 120 L1050 150 Q1000 200 950 250 Q900 300 850 280 Q750 320 650 300 Q550 330 450 280 Q350 250 300 200 Z',
    fillType: 'grad1',
    center: [650, 200],
  },
  {
    id: 'aurora',
    name: '极光之境',
    path: 'M1100 80 Q1200 60 1350 80 Q1500 70 1600 100 Q1650 150 1700 200 Q1680 300 1620 350 Q1500 400 1400 380 Q1300 350 1200 300 Q1150 250 1100 180 Z',
    fillType: 'grad2',
    center: [1380, 220],
  },
  {
    id: 'ironcrags',
    name: '铁岩山脉',
    path: 'M400 500 Q500 470 650 480 Q800 470 900 500 Q950 550 980 620 Q950 700 880 730 Q750 760 600 740 Q450 720 380 660 Q350 600 380 540 Z',
    fillType: 'grad1',
    center: [680, 600],
  },
  { id: 'whisperingsea', name: '低语之海', path: '', center: [400, 420] },
  { id: 'sunwood',       name: '阳木森林', path: '', center: [550, 150] },
  { id: 'capitalcity',   name: '帝都',     path: '', center: [700, 200] },
  { id: 'glacial',       name: '冰川平原', path: '', center: [1300, 100] },
  { id: 'frostbite',     name: '霜蚀峰',   path: '', center: [1350, 300] },
]

export const mapDesert     = 'M550 520 Q650 500 750 520 Q720 580 650 590 Q580 580 550 520 Z'
export const mapGlacier    = 'M1200 100 Q1300 80 1400 90 Q1350 130 1250 120 Z'
export const mapNorthIce1  = 'M100 30 Q400 0 700 20 Q600 60 400 50 Q200 55 100 30 Z'
export const mapNorthIce2  = 'M1500 15 Q1700 0 1900 25 Q1800 55 1650 50 Q1520 40 1500 15 Z'
export const mapSouthIce   = 'M200 1100 Q500 1070 900 1080 Q1200 1070 1600 1090 Q1700 1120 1800 1200 L0 1200 Q100 1150 200 1100 Z'

export const mapMountains = [
  'M500 130 L520 100 L540 130 M550 125 L575 90 L600 125 M610 120 L635 85 L660 120',
  'M700 680 L720 650 L740 680 M750 675 L775 640 L800 675',
]

export const mapCities = [
  { id: 'capital',   name: '帝都',     x: 700,  y: 200, size: 6, color: '#ffd700' },
  { id: 'frostpeak', name: '霜蚀峰',   x: 1350, y: 300, size: 5, color: '#fff' },
  { id: 'island',    name: '翠风岛',   x: 220,  y: 640, size: 4, color: '#ddd' },
  { id: 'dragon',    name: '龙骨',     x: 1280, y: 600, size: 4, color: '#ddd' },
]

export const mapRoutes = [
  { id: 'route1', points: [[300, 300], [500, 400], [700, 380], [900, 360], [1100, 300]], color: '#5a9aaa', opacity: 0.4 },
  { id: 'route2', points: [[900, 500], [1050, 520], [1200, 560]], color: '#5a9aaa', opacity: 0.4 },
]

export const oceanLabels = [
  { x: 320,  y: 405,  text: '低语之海', fontSize: 20, color: '#3a7aaa', opacity: 0.7 },
  { x: 120,  y: 335,  text: '西方洋',   fontSize: 16, color: '#2a5a8a', opacity: 0.5 },
  { x: 1640, y: 435,  text: '东方洋',   fontSize: 16, color: '#2a5a8a', opacity: 0.5 },
  { x: 920,  y: 885,  text: '南方深海', fontSize: 18, color: '#2a5a8a', opacity: 0.5 },
]
