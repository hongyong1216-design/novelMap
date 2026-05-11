import rockyImg from '../../../../../../../assets/area/rocky_terrain.png'
import seaImg   from '../../../../../../../assets/area/sea_water.png'

export const terrainBrushes = [
  { id: 'rocky', label: '岩石', emoji: '⛰️', image: rockyImg },
  { id: 'sea',   label: '海水', emoji: '🌊', image: seaImg },
]

export const colorBrushes = [
  { id: 'forest', label: '森林', emoji: '🌲', color: '#2d7a3a' },
  { id: 'swamp',  label: '沼泽', emoji: '🌿', color: '#5a7a3a' },
  { id: 'desert', label: '沙漠', emoji: '🏜️', color: '#c4a44a' },
  { id: 'snow',   label: '雪地', emoji: '🏔️', color: '#e8e8f0' },
  { id: 'lava',   label: '岩浆', emoji: '🌋', color: '#c0392b' },
]

export const brushImages = {
  rocky: rockyImg,
  sea: seaImg,
}
