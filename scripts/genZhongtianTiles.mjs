// ============================================================
// 中天温稳带 · 元祇大陆 —— SVG 瓦片生成器 v2 (手绘密度版)
//
// 用法:  node scripts/genZhongtianTiles.mjs
// 输出:  public/maps/L0-{x}-{y}.svg  (x 12-19, y 13-18, 共 48 格)
//
// v2 要点 (对标手绘奇幻地图的精细度):
//   · 笔刷素材库: 树/松/山/丘/岩/屋 等手绘感 glyph 置于 <defs>,
//     以 <use> 实例化成千上万次, 按 y 排序互相遮挡, 形成密林与山脉
//   · 描线: 所有地块与素材带墨线轮廓 (ink outline), 手绘地图观感
//   · 地表肌理: userSpaceOnUse 的 <pattern> (草茎/苔原/灰烬/沙点/纸纹),
//     按母图坐标平铺 → 跨瓦片天然无缝
//   · 河流强蜿蜒 (双程噪声位移), 墨线河岸 + 高光水芯 + 支流 + 牛轭湖
//   · 母图统一作画 → 按格 viewBox 切片, 邻格无缝
// ============================================================
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/maps')
mkdirSync(OUT, { recursive: true })

// ---------- 常量 ----------
const M = 1024
const CX0 = 12, CY0 = 13
const NX = 8, NY = 6
const W = NX * M, H = NY * M
const PAD = 72

// ---------- 随机 & 噪声 ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const R = mulberry32(20260715)
const rr = (a, b) => a + (b - a) * R()
const ri = (a, b) => Math.floor(rr(a, b + 1))
const pick = (arr) => arr[Math.floor(R() * arr.length)]

function hash2(ix, iy) {
  let h = (ix * 374761393 + iy * 668265263) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}
function vnoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const s = (t) => t * t * (3 - 2 * t)
  const a = hash2(ix, iy), b = hash2(ix + 1, iy)
  const c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1)
  const u = s(fx), v = s(fy)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
const fbm = (x, y) =>
  vnoise(x, y) * 0.55 + vnoise(x * 2.13 + 7.7, y * 2.13 + 3.1) * 0.28 + vnoise(x * 4.7 + 13, y * 4.7 + 29) * 0.17

// ---------- 折线工具 ----------
const n1 = (v) => Math.round(v * 10) / 10
function subdivide(pts, times, closed) {
  let p = pts
  for (let t = 0; t < times; t++) {
    const q = []
    const n = p.length
    const last = closed ? n : n - 1
    for (let i = 0; i < last; i++) {
      const a = p[i], b = p[(i + 1) % n]
      q.push(a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2])
    }
    if (!closed) q.push(p[n - 1])
    p = q
  }
  return p
}
function displace(pts, amp, freq, closed, seed = 0) {
  const n = pts.length
  return pts.map((p, i) => {
    if (!closed && (i === 0 || i === n - 1)) return p
    const prev = pts[(i - 1 + n) % n], next = pts[(i + 1) % n]
    let dx = next[0] - prev[0], dy = next[1] - prev[1]
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len, ny = dx / len
    const d = (fbm(p[0] * freq + seed * 17.3, p[1] * freq + seed * 9.1) - 0.5) * 2 * amp
    return [p[0] + nx * d, p[1] + ny * d]
  })
}
function chaikin(pts, iter, closed) {
  let p = pts
  for (let t = 0; t < iter; t++) {
    const q = []
    const n = p.length
    const last = closed ? n : n - 1
    if (!closed) q.push(p[0])
    for (let i = 0; i < last; i++) {
      const a = p[i], b = p[(i + 1) % n]
      q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25])
      q.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75])
    }
    if (!closed) q.push(p[p.length - 1])
    p = q
  }
  return p
}
const pathOf = (pts, closed) =>
  'M' + pts.map((p) => `${n1(p[0])},${n1(p[1])}`).join('L') + (closed ? 'Z' : '')
function inPoly(x, y, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
function bboxOf(pts, pad = 0) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const [x, y] of pts) {
    if (x < x0) x0 = x
    if (y < y0) y0 = y
    if (x > x1) x1 = x
    if (y > y1) y1 = y
  }
  return [x0 - pad, y0 - pad, x1 + pad, y1 + pad]
}
const shrink = (pts, f) => {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
  return pts.map(([x, y]) => [cx + (x - cx) * f, cy + (y - cy) * f])
}
const cells = (arr) => arr.map(([x, y]) => [x * M, y * M])
const organic = (ctrl, sub, amp, freq, smooth, closed = true, seed = 0) =>
  chaikin(displace(subdivide(ctrl, sub, closed), amp, freq, closed, seed), smooth, closed)

// ---------- 元素收集 ----------
const els = []
const el = (layer, bbox, str) => els.push({ layer, bbox, str })

// ---------- 调色板 (自然而鲜明, 带墨线) ----------
const C = {
  seaDeep: '#26689e', seaMid: '#3f8ec4', seaShallow: '#7cc7dd', lagoon: '#b3e6e9',
  foam: '#f2fcff', wave: '#d9f1fa', coastInk: '#1e4a66',
  land: '#9cc470', meadow: '#aed184', grassDark: '#7fae5a', landInk: '#5d7a42',
  beach: '#eeddad', dune: '#d3ba84', sandInk: '#a08a58',
  forestFloor: '#3f7042', forestInk: '#274a28',
  crown: '#4e9a4b', crownDark: '#37733a', crownLit: '#6fbb5e', crownHi: '#93d379',
  pineFill: '#2e6b45', pineDark: '#235238', pineInk: '#1c3d28',
  scrub: '#8ab663',
  rock: '#b0aec4', rockLit: '#cfcdde', rockShade: '#77748f', rockInk: '#4e4c64', snow: '#f7fbff',
  crystal: '#6fdcd8', crystalHi: '#cdf9f5',
  lake: '#2f7fc2', lakeDeep: '#22619c', abyss: '#143059', waterHi: '#a8dcef',
  moor: '#8cab90', moorDark: '#6d907a', moorInk: '#4c6a55',
  ash: '#57505a', char: '#39323c', ruinWall: '#8d8290', ruinFloor: '#544b57', ruinInk: '#2e2731',
  ember: '#ff7a3d', emberHi: '#ffc46b', dying: '#a3a366',
  field1: '#dfc57a', field2: '#c3d97f', field3: '#a3cc74', field4: '#d8b072', fieldInk: '#8a7a4a',
  path: '#c8a877', pathInk: '#96784e',
  wood: '#a5743f', woodDark: '#6e4a26',
  wall: '#ecdcb8', roofA: '#c05744', roofB: '#a34a3c', houseInk: '#5f3c2c',
  worldTree: '#3f9f5c', worldTreeLit: '#67c47f', worldTreeHi: '#b4ecc0', worldTreeInk: '#1e4a2c',
  glow: '#c9ffdd', cloud: '#ffffff', cloudShade: '#c4d5e6',
}

// ============================================================
// 0. 笔刷素材库 <defs>
// ============================================================
function wobbleCircle(r, jitter, n = 9, seed = 0) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const rad = r * (1 + (hash2(seed * 91 + i, seed * 57 - i) - 0.5) * jitter)
    pts.push([Math.cos(a) * rad, Math.sin(a) * rad])
  }
  return chaikin(pts, 2, true)
}
let DEFS = ''
// —— 阔叶树 d0..d4
for (let v = 0; v < 5; v++) {
  const crown = wobbleCircle(10.5, 0.34, 9, v + 1).map(([x, y]) => [x, y - 10])
  DEFS +=
    `<g id="d${v}">` +
    `<ellipse cx="1" cy="1.2" rx="8" ry="2.6" fill="#2c4a2c" opacity="0.28"/>` +
    `<path d="M-0.6,0.5L-0.2,-4" stroke="#5a4030" stroke-width="1.8"/>` +
    `<path d="${pathOf(crown, true)}" fill="${C.crown}" stroke="${C.forestInk}" stroke-width="1.7"/>` +
    `<circle cx="2.6" cy="-7.2" r="5.6" fill="${C.crownDark}" opacity="0.6"/>` +
    `<circle cx="-3.2" cy="-12.6" r="4.4" fill="${C.crownLit}"/>` +
    `<circle cx="-4.6" cy="-13.8" r="2" fill="${C.crownHi}"/>` +
    `</g>`
}
// —— 松树 p0..p3 (p3 雪顶)
for (let v = 0; v < 4; v++) {
  const j = (k) => n1((hash2(v * 33 + k, v * 71 - k) - 0.5) * 2.4)
  const snow = v === 3
  DEFS +=
    `<g id="p${v}">` +
    `<ellipse cx="0.8" cy="6.6" rx="7" ry="2.2" fill="#20402a" opacity="0.3"/>` +
    `<path d="M0,6.5L0,8.4" stroke="#4c3624" stroke-width="1.8"/>` +
    `<path d="M0,${-24 + j(1)}L${6.5 + j(2)},-12.5L${3.2 + j(3)},-12.5L${9.5 + j(4)},-3L${4.8 + j(5)},-3L${11.5 + j(6)},6.5L${-11.5 + j(7)},6.5L${-4.8 + j(8)},-3L${-9.5 + j(9)},-3L${-3.2 + j(10)},-12.5Z"` +
    ` fill="${C.pineFill}" stroke="${C.pineInk}" stroke-width="1.5"/>` +
    `<path d="M0,${-24 + j(1)}L${6.5 + j(2)},-12.5L${3.2 + j(3)},-12.5L${9.5 + j(4)},-3L${4.8 + j(5)},-3L${11.5 + j(6)},6.5L0,6.5Z" fill="${C.pineDark}" opacity="0.55"/>` +
    (snow ? `<path d="M0,-24L4,-16L0,-13.5L-4,-16Z" fill="${C.snow}"/>` : '') +
    `</g>`
}
// —— 山峰 m0..m5 (m3..m5 雪顶大峰)
for (let v = 0; v < 6; v++) {
  const big = v >= 3
  const s = big ? 1.35 : 1
  const j = (k) => n1((hash2(v * 53 + k, v * 29 - k) - 0.5) * 7)
  const px = j(1) * 0.6
  const sil = `M${n1(-34 * s)},${n1(20 * s)}L${n1(-18 * s + j(2))},${n1(-2 * s + j(3))}L${n1(-10 * s + j(4))},${n1(4 * s)}L${n1(px)},${n1(-30 * s)}L${n1(9 * s + j(5))},${n1(-8 * s)}L${n1(16 * s + j(6))},${n1(-14 * s + j(7))}L${n1(34 * s)},${n1(20 * s)}Z`
  DEFS +=
    `<g id="m${v}">` +
    `<path d="${sil}" fill="${C.rockLit}" stroke="${C.rockInk}" stroke-width="2"/>` +
    `<path d="M${n1(px)},${n1(-30 * s)}L${n1(9 * s + j(5))},${n1(-8 * s)}L${n1(16 * s + j(6))},${n1(-14 * s + j(7))}L${n1(34 * s)},${n1(20 * s)}L${n1(2 * s)},${n1(20 * s)}Z" fill="${C.rockShade}"/>` +
    `<path d="M${n1(px)},${n1(-30 * s)}L${n1(2 * s)},${n1(20 * s)}" stroke="${C.rockInk}" stroke-width="1.1" opacity="0.55"/>` +
    (big
      ? `<path d="M${n1(-9 * s)},${n1(-11 * s)}L${n1(px)},${n1(-30 * s)}L${n1(8 * s)},${n1(-10 * s)}L${n1(3 * s)},${n1(-6 * s)}L${n1(-2 * s)},${n1(-9 * s)}Z" fill="${C.snow}"/>`
      : '') +
    `<path d="M${n1(-24 * s)},${n1(16 * s)}l6,2M${n1(14 * s)},${n1(15 * s)}l7,2" stroke="${C.rockInk}" stroke-width="1" opacity="0.45"/>` +
    `</g>`
}
// —— 草丘 h0,h1
for (let v = 0; v < 2; v++) {
  DEFS +=
    `<g id="h${v}">` +
    `<path d="M-22,10Q-13,${-12 - v * 3} 0,${-12 - v * 3}Q14,${-12 - v * 3} 22,10Z" fill="#93bd6b" stroke="#5f8544" stroke-width="1.6"/>` +
    `<path d="M0,${-12 - v * 3}Q14,${-12 - v * 3} 22,10L4,10Z" fill="#7aa758" opacity="0.7"/>` +
    `<path d="M-8,-2l2,-5M0,0l2,-5M8,-1l2,-5" stroke="#557a3c" stroke-width="1.3" fill="none"/>` +
    `</g>`
}
// —— 岩石 r0,r1
for (let v = 0; v < 2; v++) {
  DEFS +=
    `<g id="r${v}">` +
    `<ellipse cx="0" cy="4" rx="9" ry="2.4" fill="#3c3a4c" opacity="0.3"/>` +
    `<path d="M-8,3L-6,-4L-1,-6L5,-4L8,3Z" fill="${C.rock}" stroke="${C.rockInk}" stroke-width="1.4"/>` +
    `<path d="M-1,-6L5,-4L8,3L1,3Z" fill="${C.rockShade}" opacity="0.8"/>` +
    (v ? `<path d="M4,4L6,-1L10,-2L12,3Z" fill="${C.rockLit}" stroke="${C.rockInk}" stroke-width="1.2"/>` : '') +
    `</g>`
}
// —— 房屋 a0,a1
for (let v = 0; v < 2; v++) {
  const roof = v ? C.roofB : C.roofA
  DEFS +=
    `<g id="a${v}">` +
    `<ellipse cx="1" cy="6" rx="9" ry="2.4" fill="#4a3a2a" opacity="0.3"/>` +
    `<rect x="-7" y="-1" width="14" height="7" fill="${C.wall}" stroke="${C.houseInk}" stroke-width="1.4"/>` +
    `<path d="M-9,-1L0,-8L9,-1Z" fill="${roof}" stroke="${C.houseInk}" stroke-width="1.4"/>` +
    `<path d="M0,-8L9,-1L4,-1Z" fill="#8a3a2e" opacity="0.65"/>` +
    `<rect x="-1.6" y="2" width="3.2" height="4" fill="${C.houseInk}"/>` +
    `</g>`
}
// —— 枯树 k0,k1
for (let v = 0; v < 2; v++) {
  DEFS +=
    `<g id="k${v}">` +
    `<path d="M0,6L0,-6M0,-6L${v ? -5 : 5},-12M0,-2L${v ? 5 : -5},-8M0,-6L${v ? 3 : -3},-13" ` +
    `stroke="#241e26" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    `</g>`
}
// —— 浪痕 w0
DEFS +=
  `<g id="w0"><path d="M-13,0q6.5,-7 13,0q6.5,7 13,0" fill="none" stroke="${C.wave}" stroke-width="2.6" stroke-linecap="round"/></g>`
// —— 草簇 g0 / 花 f0
DEFS +=
  `<g id="g0"><path d="M-4,3l2,-7M0,4l0,-8M4,3l-2,-7" stroke="#679a4b" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>` +
  `<g id="f0"><circle r="1.8" fill="#ffe9f2"/><circle r="0.8" fill="#f7c948"/></g>`

// —— 地表肌理 pattern (userSpaceOnUse → 跨瓦片无缝)
function scatterPattern(id, size, marks) {
  let s = `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">`
  s += marks
  s += `</pattern>`
  DEFS += s
}
{
  let m = ''
  for (let i = 0; i < 15; i++) {
    const x = n1(rr(4, 92)), y = n1(rr(4, 92))
    m += `<path d="M${x - 3},${y}l1.5,-5M${x},${y + 1}l0,-6M${x + 3},${y}l-1.5,-5" stroke="#6e9e50" stroke-width="1.2" fill="none" opacity="0.5"/>`
  }
  for (let i = 0; i < 22; i++) m += `<circle cx="${n1(rr(2, 94))}" cy="${n1(rr(2, 94))}" r="${n1(rr(0.7, 1.3))}" fill="#5d8f44" opacity="0.35"/>`
  scatterPattern('pg', 96, m)
}
{
  let m = ''
  for (let i = 0; i < 12; i++) {
    const x = n1(rr(4, 92)), y = n1(rr(4, 92))
    m += `<path d="M${x - 3},${y}l1.5,-4.5M${x},${y + 1}l0,-5.5M${x + 3},${y}l-1.5,-4.5" stroke="#5e8a70" stroke-width="1.2" fill="none" opacity="0.5"/>`
  }
  for (let i = 0; i < 18; i++) m += `<circle cx="${n1(rr(2, 94))}" cy="${n1(rr(2, 94))}" r="${n1(rr(0.7, 1.4))}" fill="#54806a" opacity="0.4"/>`
  scatterPattern('pm', 96, m)
}
{
  let m = ''
  for (let i = 0; i < 26; i++) m += `<circle cx="${n1(rr(2, 94))}" cy="${n1(rr(2, 94))}" r="${n1(rr(0.7, 1.6))}" fill="#241f28" opacity="0.4"/>`
  for (let i = 0; i < 7; i++) {
    const x = n1(rr(6, 90)), y = n1(rr(6, 90))
    m += `<path d="M${x},${y}l${n1(rr(-7, 7))},${n1(rr(3, 8))}l${n1(rr(-6, 6))},${n1(rr(2, 7))}" stroke="#221c26" stroke-width="1" fill="none" opacity="0.45"/>`
  }
  scatterPattern('pa', 96, m)
}
{
  let m = ''
  for (let i = 0; i < 24; i++) m += `<circle cx="${n1(rr(2, 94))}" cy="${n1(rr(2, 94))}" r="${n1(rr(0.6, 1.2))}" fill="#b09a68" opacity="0.5"/>`
  for (let i = 0; i < 5; i++) {
    const x = n1(rr(8, 88)), y = n1(rr(8, 88))
    m += `<path d="M${x},${y}q6,-3 12,0" stroke="#c3ab74" stroke-width="1.2" fill="none" opacity="0.6"/>`
  }
  scatterPattern('ps', 96, m)
}
{
  let m = ''
  for (let i = 0; i < 20; i++) m += `<circle cx="${n1(rr(2, 94))}" cy="${n1(rr(2, 94))}" r="${n1(rr(0.8, 1.8))}" fill="#77748f" opacity="0.35"/>`
  for (let i = 0; i < 8; i++) {
    const x = n1(rr(6, 90)), y = n1(rr(6, 90))
    m += `<path d="M${x},${y}l${n1(rr(3, 8))},${n1(rr(1, 4))}" stroke="#6d6a86" stroke-width="1.2" opacity="0.4"/>`
  }
  scatterPattern('pr', 96, m)
}
{
  let m = ''
  for (let i = 0; i < 30; i++) {
    m += `<circle cx="${n1(rr(2, 158))}" cy="${n1(rr(2, 158))}" r="${n1(rr(0.7, 1.5))}" fill="${R() < 0.5 ? '#000000' : '#ffffff'}" opacity="0.045"/>`
  }
  scatterPattern('pp', 160, m)
}

// ============================================================
// 1. 地理骨架 (与 v1 相同的大陆布局)
// ============================================================
const coastCtrl = cells([
  [2.05, 0.28], [2.5, 0.12], [3.15, 0.08], [3.9, 0.16], [4.55, 0.34],
  [4.95, 0.72], [5.5, 1.02], [5.95, 1.35], [6.5, 1.75], [6.88, 2.25],
  [6.92, 2.8], [6.6, 3.3], [6.15, 3.7], [5.75, 4.15], [5.3, 4.55],
  [4.85, 4.95], [4.5, 5.4], [4.15, 5.72], [3.6, 5.78], [3.15, 5.5],
  [2.9, 5.05], [2.45, 4.7], [2.1, 4.3], [1.55, 3.85], [1.18, 3.4],
  [1.05, 2.9], [1.02, 2.3], [1.15, 1.7], [1.4, 1.25], [1.75, 0.8],
])
const coast = organic(coastCtrl, 3, 46, 0.0035, 2, true, 1)
const coastBB = bboxOf(coast)
const coastPath = pathOf(coast, true)

const lakeCtrl = []
for (let i = 0; i < 18; i++) {
  const a = (i / 18) * Math.PI * 2
  const rx = 0.60 * M * (1 + 0.16 * (fbm(Math.cos(a) * 3 + 50, Math.sin(a) * 3 + 50) - 0.5) * 2)
  const ry = 0.70 * M * (1 + 0.16 * (fbm(Math.cos(a) * 3 + 90, Math.sin(a) * 3 + 90) - 0.5) * 2)
  lakeCtrl.push([3.62 * M + Math.cos(a) * rx, 2.85 * M + Math.sin(a) * ry])
}
const lake = organic(lakeCtrl, 1, 24, 0.005, 2, true, 2)
const lakePath = pathOf(lake, true)

const mountains = organic(cells([
  [1.7, 0.95], [2.1, 0.5], [2.6, 0.34], [3.2, 0.28], [3.9, 0.34], [4.6, 0.52],
  [5.05, 0.9], [5.35, 1.35], [5.3, 1.75], [4.9, 1.85], [4.35, 1.7], [3.7, 1.62],
  [3.0, 1.6], [2.4, 1.62], [1.95, 1.4],
]), 2, 26, 0.005, 2, true, 3)
const scrubBand = organic(cells([
  [1.9, 1.5], [2.6, 1.65], [3.4, 1.7], [4.3, 1.8], [5.0, 2.0], [5.15, 2.3],
  [4.6, 2.35], [3.8, 2.2], [2.9, 2.15], [2.2, 2.05], [1.85, 1.8],
]), 2, 20, 0.006, 1, true, 4)
const forest = organic(cells([
  [1.12, 1.45], [1.7, 1.5], [2.3, 1.7], [2.62, 2.1], [2.72, 2.6], [2.6, 3.15],
  [2.35, 3.6], [1.95, 3.85], [1.5, 3.72], [1.18, 3.3], [1.06, 2.7], [1.05, 2.1], [1.05, 1.75],
]), 2, 28, 0.005, 2, true, 5)
const moor = organic(cells([
  [5.42, 1.4], [5.9, 1.6], [6.4, 1.95], [6.75, 2.35], [6.85, 2.8], [6.55, 3.2],
  [6.1, 3.5], [5.7, 3.45], [5.45, 3.05], [5.3, 2.5], [5.28, 1.9],
]), 2, 24, 0.005, 2, true, 6)
const scorch = organic(cells([
  [4.1, 2.95], [4.6, 2.8], [5.1, 2.85], [5.5, 3.1], [5.55, 3.6], [5.3, 4.1],
  [4.85, 4.5], [4.35, 4.55], [4.0, 4.25], [3.92, 3.7], [3.95, 3.25],
]), 2, 22, 0.005, 2, true, 7)
const cityZone = organic(cells([
  [4.35, 3.15], [4.95, 3.05], [5.35, 3.3], [5.3, 3.75], [5.0, 4.15],
  [4.55, 4.25], [4.25, 3.95], [4.2, 3.5],
]), 1, 14, 0.006, 1, true, 8)

// 河流: 双程位移 → 强蜿蜒
function meander(ctrl, seed) {
  let p = subdivide(ctrl, 4, false)
  p = displace(p, 40, 0.008, false, seed)
  p = displace(p, 14, 0.026, false, seed + 5)
  return chaikin(p, 2, false)
}
const riverMain = meander(cells([
  [3.62, 3.42], [3.55, 3.9], [3.62, 4.35], [3.5, 4.8], [3.55, 5.2], [3.5, 5.56],
]), 9)
const deltaA = meander(cells([[3.5, 5.5], [3.36, 5.68], [3.28, 5.82]]), 10)
const deltaB = meander(cells([[3.5, 5.5], [3.68, 5.66], [3.8, 5.8]]), 11)
const streams = [
  cells([[3.05, 0.95], [3.15, 1.5], [3.3, 2.05], [3.35, 2.35]]),
  cells([[4.5, 1.05], [4.3, 1.6], [4.05, 2.1], [3.95, 2.42]]),
  cells([[2.2, 2.2], [1.8, 2.45], [1.4, 2.6], [1.08, 2.62]]),
  cells([[5.85, 2.15], [6.3, 2.5], [6.68, 2.62], [6.95, 2.72]]),
].map((c, i) => meander(c, 12 + i))
const tribA = meander(cells([[4.72, 2.52], [4.4, 3.1], [3.98, 3.6], [3.66, 3.92]]), 17)
const tribB = meander(cells([[2.52, 3.55], [2.9, 3.95], [3.28, 4.3], [3.5, 4.56]]), 18)

const roads = [
  cells([[2.5, 4.8], [2.78, 4.6], [3.1, 4.46], [3.44, 4.7]]),
  cells([[3.62, 4.66], [3.95, 4.4], [4.16, 4.14]]),
  cells([[3.5, 4.6], [3.3, 4.2], [3.14, 3.7], [3.0, 3.2], [3.02, 2.7], [3.1, 2.2], [3.0, 1.82]]),
  cells([[1.8, 3.4], [2.2, 3.7], [2.6, 4.1], [2.86, 4.34], [3.1, 4.46]]),
].map((c, i) => organic(c, 1, 9, 0.01, 1, false, 20 + i))

// 聚落坐标 (供农田聚簇与建筑摆放共用)
const hamlets = cells([
  [2.92, 1.78], [3.06, 2.5], [2.62, 4.28], [1.78, 3.32], [2.2, 2.12],
  [3.32, 4.42], [3.9, 1.4], [2.47, 4.79],
])

const isletDefs = [
  [0.55, 1.25, 62], [0.42, 3.6, 76], [0.5, 4.9, 48], [1.6, 5.35, 56],
  [2.2, 5.74, 40], [5.9, 5.3, 70], [6.7, 4.6, 52], [6.55, 0.95, 64],
  [5.6, 0.45, 44], [7.45, 2.0, 58], [7.5, 3.7, 46], [0.6, 0.5, 40], [7.4, 5.5, 50],
]
const islets = isletDefs.map(([gx, gy, r], k) => {
  const ctrl = []
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    const rad = r * (1 + 0.35 * (fbm(Math.cos(a) * 2 + k * 31, Math.sin(a) * 2 + k * 17) - 0.5) * 2)
    ctrl.push([gx * M + Math.cos(a) * rad, gy * M + Math.sin(a) * rad])
  }
  return organic(ctrl, 1, r * 0.14, 0.02, 2, true, 40 + k)
})

const onLand = (x, y) => inPoly(x, y, coast)
const onWater = (x, y) => !onLand(x, y) && !islets.some((p) => inPoly(x, y, p))
const blockers = [mountains, forest, moor, scorch, lake]

// 裁剪路径进 defs
DEFS += `<clipPath id="cl"><path d="${coastPath}"/></clipPath>`
DEFS += `<clipPath id="cm"><path d="${pathOf(moor, true)}"/></clipPath>`
DEFS += `<clipPath id="cmt"><path d="${pathOf(mountains, true)}"/></clipPath>`
DEFS += `<clipPath id="cs"><path d="${pathOf(scorch, true)}"/></clipPath>`
DEFS += `<clipPath id="zc"><path d="${pathOf(cityZone, true)}"/></clipPath>`

// <use> 实例
function useAt(layer, id, x, y, s = 1, ext = 16, rot = 0) {
  const t = rot
    ? `translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${n1(s)})`
    : `translate(${n1(x)} ${n1(y)}) scale(${n1(s)})`
  el(layer, [x - ext * s, y - ext * s, x + ext * s, y + ext * s], `<use href="#${id}" transform="${t}"/>`)
}

// ============================================================
// 2. 海洋
// ============================================================
el(0, [0, 0, W, H], `<rect x="0" y="0" width="${W}" height="${H}" fill="${C.seaMid}"/>`)
for (let i = 0; i < 16; i++) {
  const gx = rr(0, W), gy = rr(0, H)
  if (onLand(gx, gy)) continue
  const ctrl = []
  const r0 = rr(220, 540)
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2
    ctrl.push([gx + Math.cos(a) * r0 * rr(0.6, 1.3), gy + Math.sin(a) * r0 * rr(0.6, 1.3)])
  }
  const p = chaikin(ctrl, 3, true)
  el(1, bboxOf(p), `<path d="${pathOf(p, true)}" fill="${C.seaDeep}" opacity="0.45"/>`)
}
for (let i = 0; i < 6; i++) {
  const x0 = rr(-200, W), y0 = rr(0, H)
  const pts = [[x0, y0]]
  let ang = rr(0, Math.PI * 2)
  for (let s = 0; s < 7; s++) {
    ang += rr(-0.5, 0.5)
    const last = pts[pts.length - 1]
    pts.push([last[0] + Math.cos(ang) * rr(180, 320), last[1] + Math.sin(ang) * rr(60, 200) * (R() < 0.5 ? -1 : 1)])
  }
  const p = chaikin(pts, 2, false)
  el(1, bboxOf(p, 40), `<path d="${pathOf(p, false)}" fill="none" stroke="#9fd4e8" stroke-width="${n1(rr(36, 70))}" stroke-linecap="round" opacity="0.09"/>`)
}
// 海岸渐层 + 墨线
for (const [w, col, op] of [[200, '#57a3cf', 0.5], [120, C.seaShallow, 0.8], [66, C.lagoon, 0.9], [28, C.foam, 0.6]])
  el(2, bboxOf(coast, w), `<path d="${coastPath}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round" opacity="${op}"/>`)
el(2, bboxOf(coast, 8), `<path d="${coastPath}" fill="none" stroke="${C.coastInk}" stroke-width="5" stroke-linejoin="round" opacity="0.9"/>`)

// 岛屿
islets.forEach((p, k) => {
  const path = pathOf(p, true)
  el(3, bboxOf(p, 44), `<path d="${path}" fill="none" stroke="${C.lagoon}" stroke-width="36" stroke-linejoin="round" opacity="0.9"/><path d="${path}" fill="none" stroke="${C.foam}" stroke-width="9" opacity="0.7"/>`)
  const rocky = k % 3 === 2
  el(3, bboxOf(p), `<path d="${path}" fill="${rocky ? C.rock : C.land}" stroke="${rocky ? C.rockInk : C.coastInk}" stroke-width="3.5"/>`)
  const [x0, y0, x1, y1] = bboxOf(p)
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
  if (!rocky) {
    for (let t = 0; t < 3; t++) useAt(15, `d${ri(0, 4)}`, cx + rr(-16, 16), cy + rr(-12, 12), rr(0.5, 0.75), 24)
  } else {
    useAt(13, `r${ri(0, 1)}`, cx, cy, rr(0.9, 1.3), 14)
  }
})

// ============================================================
// 3. 大陆基底
// ============================================================
el(4, coastBB, `<path d="${coastPath}" fill="${C.land}"/>`)
// 地表色斑
for (let i = 0; i < 40; i++) {
  const gx = rr(coastBB[0], coastBB[2]), gy = rr(coastBB[1], coastBB[3])
  if (!onLand(gx, gy)) continue
  const ctrl = []
  const r0 = rr(110, 330)
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2
    ctrl.push([gx + Math.cos(a) * r0 * rr(0.6, 1.3), gy + Math.sin(a) * r0 * rr(0.6, 1.3)])
  }
  const p = chaikin(ctrl, 2, true)
  el(4, bboxOf(p), `<path d="${pathOf(p, true)}" fill="${R() < 0.5 ? C.meadow : C.grassDark}" opacity="0.3"/>`)
}
// 草地肌理 (裁剪到大陆)
el(4, coastBB, `<g clip-path="url(#cl)"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#pg)"/></g>`)

// 南岸沙滩
const beachOuter = coast.filter(([x, y]) => y > 4.62 * M && x > 2.2 * M && x < 4.62 * M)
if (beachOuter.length > 6) {
  const inner = beachOuter.map(([x, y]) => [x + (3.4 * M - x) * 0.04, y - rr(74, 120)]).reverse()
  const strip = beachOuter.concat(inner)
  const sp = pathOf(strip, true)
  el(5, bboxOf(strip), `<path d="${sp}" fill="${C.beach}" stroke="${C.sandInk}" stroke-width="2" opacity="0.98"/>`)
  el(5, bboxOf(strip), `<g clip-path="url(#cl)"><path d="${sp}" fill="url(#ps)"/></g>`)
  for (let i = 0; i < 9; i++) {
    const t0 = ri(2, beachOuter.length - 8)
    const seg = beachOuter.slice(t0, t0 + 6).map(([x, y]) => [x + rr(-10, 10), y - rr(30, 80)])
    el(11, bboxOf(seg, 6), `<path d="${pathOf(chaikin(seg, 1, false), false)}" fill="none" stroke="${C.dune}" stroke-width="3.4" stroke-linecap="round" opacity="0.9"/>`)
  }
}

// ============================================================
// 4. 分区地块 (带墨线)
// ============================================================
el(6, bboxOf(scrubBand), `<path d="${pathOf(scrubBand, true)}" fill="${C.scrub}" opacity="0.9"/>`)
el(6, bboxOf(forest), `<path d="${pathOf(forest, true)}" fill="${C.forestFloor}" stroke="${C.forestInk}" stroke-width="4"/>`)
el(6, bboxOf(moor), `<path d="${pathOf(moor, true)}" fill="${C.moor}" stroke="${C.moorInk}" stroke-width="3.5"/>`)
el(6, bboxOf(moor), `<g clip-path="url(#cm)"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#pm)"/></g>`)
// 焦土: 枯草过渡 + 灰烬 + 龟裂肌理
el(6, bboxOf(scorch, 44), `<path d="${pathOf(scorch, true)}" fill="none" stroke="${C.dying}" stroke-width="58" stroke-linejoin="round" opacity="0.85"/>`)
el(6, bboxOf(scorch), `<path d="${pathOf(scorch, true)}" fill="${C.ash}" stroke="${C.ruinInk}" stroke-width="3.5"/>`)
const scorchCore = shrink(scorch, 0.7)
el(6, bboxOf(scorchCore), `<path d="${pathOf(scorchCore, true)}" fill="${C.char}" opacity="0.8"/>`)
el(6, bboxOf(scorch), `<g clip-path="url(#cs)"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#pa)"/></g>`)
// 山地岩原 + 等高线
el(6, bboxOf(mountains), `<path d="${pathOf(mountains, true)}" fill="#a8a6bf" stroke="${C.rockInk}" stroke-width="3.5" opacity="0.97"/>`)
el(6, bboxOf(mountains), `<g clip-path="url(#cmt)"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#pr)"/></g>`)
for (const f of [0.82, 0.62, 0.42])
  el(6, bboxOf(mountains), `<path d="${pathOf(shrink(mountains, f), true)}" fill="none" stroke="#8a88a5" stroke-width="1.6" opacity="0.5"/>`)

// 苔原色斑
for (let i = 0; i < 12; i++) {
  const gx = rr(5.2 * M, 7 * M), gy = rr(1.3 * M, 3.6 * M)
  if (!inPoly(gx, gy, moor)) continue
  const r0 = rr(60, 150)
  const ctrl = []
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2
    ctrl.push([gx + Math.cos(a) * r0 * rr(0.7, 1.3), gy + Math.sin(a) * r0 * rr(0.7, 1.3)])
  }
  const p = chaikin(ctrl, 2, true)
  el(7, bboxOf(p), `<path d="${pathOf(p, true)}" fill="${C.moorDark}" opacity="0.45"/>`)
}

// ============================================================
// 5. 农田 / 草甸 / 孤丘
// ============================================================
const fieldCols = [C.field1, C.field2, C.field3, C.field4]
for (let gy = coastBB[1]; gy < coastBB[3]; gy += 62) {
  for (let gx = coastBB[0]; gx < coastBB[2]; gx += 62) {
    const x = gx + rr(-20, 20), y = gy + rr(-20, 20)
    if (!onLand(x, y) || blockers.some((b) => inPoly(x, y, b))) continue
    if (y > 4.6 * M && x > 2.3 * M && x < 4.6 * M && !onLand(x, y + 130)) continue
    const nearHamlet = hamlets.some(([hx, hy]) => (x - hx) ** 2 + (y - hy) ** 2 < 340 * 340)
    const farm = nearHamlet || fbm(x * 0.0016 + 3, y * 0.0016 + 8) > 0.6
    if (farm) {
      const w = rr(42, 84), h = rr(30, 58), a = rr(-0.22, 0.22)
      const ca = Math.cos(a), sa = Math.sin(a)
      const cs = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]
        .map(([px, py]) => [x + px * ca - py * sa, y + px * sa + py * ca])
      let plot = `<path d="${pathOf(cs, true)}" fill="${pick(fieldCols)}" stroke="${C.fieldInk}" stroke-width="1.6" opacity="0.96"/>`
      const rows = Math.floor(h / 9)
      for (let r2 = 1; r2 < rows; r2++) {
        const t = r2 / rows
        const p1 = [cs[0][0] + (cs[3][0] - cs[0][0]) * t, cs[0][1] + (cs[3][1] - cs[0][1]) * t]
        const p2 = [cs[1][0] + (cs[2][0] - cs[1][0]) * t, cs[1][1] + (cs[2][1] - cs[1][1]) * t]
        plot += `<line x1="${n1(p1[0])}" y1="${n1(p1[1])}" x2="${n1(p2[0])}" y2="${n1(p2[1])}" stroke="${C.fieldInk}" stroke-width="0.8" opacity="0.4"/>`
      }
      el(7, bboxOf(cs, 4), plot)
    } else {
      const t = R()
      if (t < 0.3) useAt(7, 'g0', x, y, rr(0.8, 1.3), 6)
      else if (t < 0.36) useAt(7, 'f0', x, y, rr(0.8, 1.2), 3)
      else if (t < 0.39) useAt(7, `h${ri(0, 1)}`, x, y, rr(0.5, 0.9), 26)
      else if (t < 0.41) useAt(7, `r${ri(0, 1)}`, x, y, rr(0.6, 1), 14)
    }
  }
}

// ============================================================
// 6. 元渊 与 河流
// ============================================================
el(8, bboxOf(lake, 52), `<path d="${lakePath}" fill="none" stroke="${C.lagoon}" stroke-width="46" stroke-linejoin="round" opacity="0.85"/><path d="${lakePath}" fill="none" stroke="${C.foam}" stroke-width="10" opacity="0.6"/>`)
el(8, bboxOf(lake, 6), `<path d="${lakePath}" fill="${C.lake}" stroke="${C.coastInk}" stroke-width="4.5"/>`)
const lakeDeep = shrink(lake, 0.58)
el(8, bboxOf(lakeDeep), `<path d="${pathOf(lakeDeep, true)}" fill="${C.lakeDeep}" opacity="0.85"/>`)
{
  const ex = 3.62 * M, ey = 2.85 * M
  el(8, [ex - 200, ey - 200, ex + 200, ey + 200],
    `<circle cx="${ex}" cy="${ey}" r="88" fill="${C.abyss}"/>` +
    `<circle cx="${ex}" cy="${ey}" r="88" fill="none" stroke="${C.waterHi}" stroke-width="2" opacity="0.4"/>` +
    `<circle cx="${ex}" cy="${ey}" r="150" fill="none" stroke="${C.lakeDeep}" stroke-width="52" opacity="0.35"/>`)
  for (let i = 0; i < 20; i++) {
    const a = rr(0, Math.PI * 2), rad = rr(210, 560)
    const wx = ex + Math.cos(a) * rad, wy = ey + Math.sin(a) * rad * 1.1
    if (!inPoly(wx, wy, lake)) continue
    useAt(8, 'w0', wx, wy, rr(0.5, 0.8), 15)
  }
}
function drawRiver(pts, wOut, wIn, layer = 9) {
  const p = pathOf(pts, false)
  el(layer, bboxOf(pts, wOut + 4), `<path d="${p}" fill="none" stroke="${C.coastInk}" stroke-width="${wOut + 5}" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`)
  el(layer, bboxOf(pts, wOut), `<path d="${p}" fill="none" stroke="${C.lake}" stroke-width="${wOut}" stroke-linecap="round" stroke-linejoin="round"/>`)
  el(layer, bboxOf(pts, wIn), `<path d="${p}" fill="none" stroke="${C.waterHi}" stroke-width="${wIn}" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>`)
}
drawRiver(riverMain, 26, 8)
drawRiver(deltaA, 16, 5)
drawRiver(deltaB, 16, 5)
streams.forEach((s) => drawRiver(s, 13, 4))
drawRiver(tribA, 14, 4)
drawRiver(tribB, 14, 4)
// 牛轭湖
{
  const ox = 3.32 * M, oy = 4.06 * M
  el(9, [ox - 60, oy - 50, ox + 60, oy + 50],
    `<path d="M${ox - 40},${oy - 18}q-16,26 8,40q26,14 44,-6" fill="none" stroke="${C.coastInk}" stroke-width="19" stroke-linecap="round" opacity="0.85"/>` +
    `<path d="M${ox - 40},${oy - 18}q-16,26 8,40q26,14 44,-6" fill="none" stroke="${C.lake}" stroke-width="14" stroke-linecap="round"/>`)
}
// 湖畔与河口芦苇
for (let i = 0; i < 34; i++) {
  const t = R()
  let x, y
  if (t < 0.5) {
    const a = rr(0, Math.PI)
    x = 3.62 * M + Math.cos(a) * rr(560, 660)
    y = 2.85 * M + Math.sin(a) * rr(640, 760)
  } else {
    x = rr(3.2 * M, 3.9 * M); y = rr(5.45 * M, 5.75 * M)
  }
  if (!onLand(x, y)) continue
  el(11, [x - 6, y - 10, x + 6, y + 4],
    `<path d="M${n1(x - 3)},${n1(y)}l1,-8M${n1(x)},${n1(y + 1)}l0,-10M${n1(x + 3)},${n1(y)}l-1,-8" stroke="#3f7f5c" stroke-width="1.6" fill="none" stroke-linecap="round"/>`)
}

// ============================================================
// 7. 道路 / 聚落
// ============================================================
roads.forEach((rd) => {
  const p = pathOf(rd, false)
  el(10, bboxOf(rd, 10), `<path d="${p}" fill="none" stroke="${C.path}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>`)
  el(10, bboxOf(rd, 10), `<path d="${p}" fill="none" stroke="${C.pathInk}" stroke-width="1.8" stroke-dasharray="9 7" stroke-linecap="round" opacity="0.8"/>`)
})
{
  const bx = 3.53 * M, by = 4.7 * M
  el(17, [bx - 32, by - 18, bx + 32, by + 18],
    `<g transform="rotate(12 ${bx} ${by})"><rect x="${bx - 26}" y="${by - 8}" width="52" height="16" rx="3" fill="${C.wood}" stroke="${C.woodDark}" stroke-width="2"/><line x1="${bx - 18}" y1="${by - 8}" x2="${bx - 18}" y2="${by + 8}" stroke="${C.woodDark}" stroke-width="1.4"/><line x1="${bx}" y1="${by - 8}" x2="${bx}" y2="${by + 8}" stroke="${C.woodDark}" stroke-width="1.4"/><line x1="${bx + 18}" y1="${by - 8}" x2="${bx + 18}" y2="${by + 8}" stroke="${C.woodDark}" stroke-width="1.4"/></g>`)
}
const hamletBuild = hamlets
hamletBuild.forEach(([hx, hy], hi) => {
  const n = hi === 7 ? 9 : ri(4, 8)
  for (let i = 0; i < n; i++) {
    const x = hx + rr(-72, 72), y = hy + rr(-56, 56)
    if (!onLand(x, y)) continue
    useAt(17, `a${ri(0, 1)}`, x, y, rr(0.85, 1.2), 12, rr(-14, 14))
  }
  // 村旁栅栏
  if (R() < 0.6) {
    const fx = hx + rr(-60, 60), fy = hy + rr(40, 70)
    let f = ''
    for (let k = 0; k < 5; k++) f += `<line x1="${n1(fx + k * 7)}" y1="${n1(fy - 4)}" x2="${n1(fx + k * 7)}" y2="${n1(fy + 3)}" stroke="${C.woodDark}" stroke-width="1.6"/>`
    f += `<line x1="${n1(fx - 2)}" y1="${n1(fy - 1)}" x2="${n1(fx + 30)}" y2="${n1(fy - 1)}" stroke="${C.woodDark}" stroke-width="1.4"/>`
    el(17, [fx - 4, fy - 8, fx + 34, fy + 6], f)
  }
})
{
  const px = 2.44 * M, py = 4.84 * M
  el(17, [px - 84, py - 12, px + 12, py + 96],
    `<line x1="${px}" y1="${py}" x2="${px - 64}" y2="${py + 44}" stroke="${C.woodDark}" stroke-width="7" stroke-linecap="round"/>` +
    `<line x1="${px - 30}" y1="${py + 6}" x2="${px - 60}" y2="${py + 74}" stroke="${C.woodDark}" stroke-width="6" stroke-linecap="round"/>`)
  for (const [bx, by] of [[px - 96, py + 62], [px - 42, py + 98], [3.6 * M, 5.9 * M]]) {
    if (onLand(bx, by)) continue
    el(18, [bx - 17, by - 9, bx + 17, by + 9],
      `<ellipse cx="${n1(bx)}" cy="${n1(by)}" rx="13" ry="5" fill="${C.wood}" stroke="${C.woodDark}" stroke-width="1.6"/><line x1="${n1(bx)}" y1="${n1(by - 3)}" x2="${n1(bx)}" y2="${n1(by - 12)}" stroke="${C.woodDark}" stroke-width="1.8"/>`)
  }
}
for (const [gx, gy] of cells([[3.0, 1.78], [1.86, 2.76]])) {
  el(17, [gx - 17, gy - 24, gx + 17, gy + 6],
    `<line x1="${n1(gx - 10)}" y1="${n1(gy)}" x2="${n1(gx - 10)}" y2="${n1(gy - 18)}" stroke="#c23a2e" stroke-width="4"/>` +
    `<line x1="${n1(gx + 10)}" y1="${n1(gy)}" x2="${n1(gx + 10)}" y2="${n1(gy - 18)}" stroke="#c23a2e" stroke-width="4"/>` +
    `<line x1="${n1(gx - 15)}" y1="${n1(gy - 18)}" x2="${n1(gx + 15)}" y2="${n1(gy - 18)}" stroke="#c23a2e" stroke-width="5"/>` +
    `<line x1="${n1(gx - 12)}" y1="${n1(gy - 13)}" x2="${n1(gx + 12)}" y2="${n1(gy - 13)}" stroke="#c23a2e" stroke-width="3"/>`)
}

// ============================================================
// 8. 焚京 · 劫墟
// ============================================================
{
  const bb = bboxOf(cityZone)
  const ccx = (bb[0] + bb[2]) / 2, ccy = (bb[1] + bb[3]) / 2
  let grid = ''
  for (let k = -8; k <= 8; k++) {
    grid += `<line x1="-620" y1="${k * 62}" x2="620" y2="${k * 62}" stroke="${C.char}" stroke-width="7" opacity="0.85"/>`
    grid += `<line x1="${k * 62}" y1="-620" x2="${k * 62}" y2="620" stroke="${C.char}" stroke-width="7" opacity="0.85"/>`
  }
  el(12, bb, `<g clip-path="url(#zc)"><g transform="translate(${n1(ccx)} ${n1(ccy)}) rotate(20)">${grid}</g></g>`)
  for (let i = 0; i < 130; i++) {
    const x = rr(bb[0], bb[2]), y = rr(bb[1], bb[3])
    if (!inPoly(x, y, cityZone)) continue
    const w = rr(16, 44), h = rr(12, 34)
    if (R() < 0.55) {
      el(12, [x - 2, y - 2, x + w + 2, y + h + 2],
        `<path d="M${n1(x)},${n1(y + h)}L${n1(x)},${n1(y)}L${n1(x + w)},${n1(y)}${R() < 0.5 ? `L${n1(x + w)},${n1(y + h * 0.5)}` : ''}" fill="none" stroke="${C.ruinWall}" stroke-width="4.5"/>` +
        `<path d="M${n1(x)},${n1(y + h)}L${n1(x)},${n1(y)}L${n1(x + w)},${n1(y)}" fill="none" stroke="${C.ruinInk}" stroke-width="1.4" opacity="0.7"/>`)
    } else {
      el(12, [x, y, x + w, y + h], `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" fill="${C.ruinFloor}" opacity="0.6" stroke="${C.ruinInk}" stroke-width="1" />`)
    }
  }
  {
    const zx = 4.62 * M, zy = 3.38 * M
    let sq = ''
    for (const s of [220, 150, 88])
      sq += `<rect x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" fill="none" stroke="${C.ruinWall}" stroke-width="8" stroke-dasharray="${n1(s * 0.22)} ${n1(s * 0.09)}"/><rect x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" fill="none" stroke="${C.ruinInk}" stroke-width="2" stroke-dasharray="${n1(s * 0.22)} ${n1(s * 0.09)}" opacity="0.6"/>`
    sq += `<rect x="-26" y="-26" width="52" height="52" fill="${C.ruinFloor}" stroke="${C.ruinInk}" stroke-width="2"/>`
    el(12, [zx - 135, zy - 135, zx + 135, zy + 135], `<g transform="translate(${zx} ${zy}) rotate(20)">${sq}</g>`)
  }
  {
    const kx = 4.95 * M, ky = 3.74 * M
    let cr = `<circle cx="${kx}" cy="${ky}" r="150" fill="${C.char}" stroke="#6f6274" stroke-width="12"/>` +
      `<circle cx="${kx}" cy="${ky}" r="150" fill="none" stroke="${C.ruinInk}" stroke-width="3"/>` +
      `<circle cx="${kx}" cy="${ky}" r="62" fill="${C.ember}" opacity="0.25"/>` +
      `<circle cx="${kx}" cy="${ky}" r="26" fill="${C.emberHi}" opacity="0.3"/>`
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + rr(-0.2, 0.2)
      let px = kx + Math.cos(a) * 150, py = ky + Math.sin(a) * 150
      let d = `M${n1(px)},${n1(py)}`
      for (let s = 0; s < 3; s++) {
        px += Math.cos(a + rr(-0.5, 0.5)) * rr(40, 95)
        py += Math.sin(a + rr(-0.5, 0.5)) * rr(40, 95)
        d += `L${n1(px)},${n1(py)}`
      }
      cr += `<path d="${d}" fill="none" stroke="${C.ember}" stroke-width="4" opacity="0.85"/>` +
        `<path d="${d}" fill="none" stroke="${C.emberHi}" stroke-width="1.6" opacity="0.95"/>`
    }
    el(12, [kx - 430, ky - 430, kx + 430, ky + 430], cr)
  }
  for (const [gx, gy, r] of [[4.4 * M, 3.02 * M, 52], [5.24 * M, 3.96 * M, 62], [4.5 * M, 4.34 * M, 46]]) {
    el(12, [gx - r - 14, gy - r - 14, gx + r + 14, gy + r + 14],
      `<circle cx="${n1(gx)}" cy="${n1(gy)}" r="${r}" fill="${C.char}" stroke="#6f6274" stroke-width="8"/><circle cx="${n1(gx)}" cy="${n1(gy)}" r="${r}" fill="none" stroke="${C.ruinInk}" stroke-width="2.4"/>`)
  }
  const sb = bboxOf(scorch)
  for (let i = 0; i < 90; i++) {
    const x = rr(sb[0], sb[2]), y = rr(sb[1], sb[3])
    if (!inPoly(x, y, scorch)) continue
    const t = R()
    if (t < 0.34) el(12, [x - 3, y - 3, x + 3, y + 3], `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(rr(1.6, 3))}" fill="${C.emberHi}" opacity="0.9"/>`)
    else if (t < 0.55) el(12, [x - 32, y - 16, x + 32, y + 16], `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(rr(16, 32))}" ry="${n1(rr(7, 13))}" fill="#c3b8c6" opacity="0.14"/>`)
    else useAt(12, `k${ri(0, 1)}`, x, y, rr(0.8, 1.4), 15)
  }
}

// ============================================================
// 9. 晶簇 / 立石
// ============================================================
for (let i = 0; i < 24; i++) {
  const x = rr(4.25 * M, 5.15 * M), y = rr(1.15 * M, 1.8 * M)
  if (!onLand(x, y)) continue
  const h = rr(10, 26), w = h * 0.42
  el(13, [x - w - 10, y - h - 10, x + w + 10, y + 10],
    `<circle cx="${n1(x)}" cy="${n1(y - h / 2)}" r="${n1(h * 0.8)}" fill="${C.crystal}" opacity="0.15"/>` +
    `<path d="M${n1(x - w)},${n1(y)}L${n1(x - w * 0.3)},${n1(y - h * 0.85)}L${n1(x)},${n1(y - h)}L${n1(x + w * 0.5)},${n1(y - h * 0.5)}L${n1(x + w)},${n1(y)}Z" fill="${C.crystal}" stroke="#3aa8a4" stroke-width="1.6"/>` +
    `<path d="M${n1(x)},${n1(y - h)}L${n1(x + w * 0.5)},${n1(y - h * 0.5)}L${n1(x + w)},${n1(y)}L${n1(x)},${n1(y)}Z" fill="#4cc4bf" opacity="0.8"/>` +
    `<path d="M${n1(x - w * 0.4)},${n1(y - h * 0.3)}L${n1(x - w * 0.15)},${n1(y - h * 0.75)}" stroke="${C.crystalHi}" stroke-width="1.6"/>`)
}
{
  const sx = 6.02 * M, sy = 2.6 * M
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    const x = sx + Math.cos(a) * 88, y = sy + Math.sin(a) * 66
    el(13, [x - 9, y - 24, x + 9, y + 7],
      `<ellipse cx="${n1(x)}" cy="${n1(y + 2)}" rx="9" ry="3.6" fill="#44604f" opacity="0.5"/>` +
      `<rect x="${n1(x - 5)}" y="${n1(y - 20)}" width="10" height="22" rx="3" fill="#a2aab8" stroke="#5b6472" stroke-width="1.6"/>` +
      `<rect x="${n1(x - 5)}" y="${n1(y - 20)}" width="4" height="22" rx="2" fill="#c3cbd8"/>`)
  }
  for (let i = 0; i < 18; i++) {
    const x = rr(5.3 * M, 6.9 * M), y = rr(1.5 * M, 3.5 * M)
    if (!inPoly(x, y, moor)) continue
    useAt(13, `r${ri(0, 1)}`, x, y, rr(0.6, 1.1), 14)
  }
}

// ============================================================
// 10. 山脉 (整片填充 + 岭脊强调, y 排序北后南前)
// ============================================================
const peakInst = []
// (a) 整片山地按网格铺峰: 越靠北越高/雪, 越靠南渐成丘陵
{
  const mb = bboxOf(mountains)
  const yTop = mb[1], yBot = mb[3]
  for (let gy = mb[1]; gy < mb[3]; gy += 34) {
    for (let gx = mb[0]; gx < mb[2]; gx += 38) {
      const x = gx + rr(-16, 16), y = gy + rr(-14, 14)
      if (!inPoly(x, y, mountains)) continue
      const ny = (y - yTop) / (yBot - yTop) // 0 北 → 1 南
      // 密度: 北密南疏留出缓坡; 用噪声打散避免网格感
      if (fbm(x * 0.006 + 11, y * 0.006 + 5) < 0.28 + ny * 0.24) continue
      const big = ny < 0.42 && R() < 0.6 - ny * 0.5
      const s = big ? rr(1.0, 1.7) * (1 - ny * 0.3) : rr(0.5, 0.95) * (1 - ny * 0.25)
      const snowy = big || (ny < 0.3 && R() < 0.5)
      peakInst.push([x, y, s, snowy ? ri(3, 5) : ri(0, 2)])
    }
  }
}
// (b) 岭脊线额外压高峰 (强调山势走向)
const ridgeDefs = [
  { pts: cells([[2.15, 0.42], [2.7, 0.5], [3.2, 0.45], [3.95, 0.5], [4.45, 0.62], [4.9, 0.85], [5.25, 1.15]]), s0: 1.6, s1: 1.0 },
  { pts: cells([[2.3, 0.78], [2.7, 0.95], [3.1, 1.05]]), s0: 1.1, s1: 0.75 },
  { pts: cells([[4.2, 0.95], [4.55, 1.25], [4.85, 1.5]]), s0: 1.15, s1: 0.75 },
]
for (const { pts, s0, s1 } of ridgeDefs) {
  const line = chaikin(subdivide(pts, 2, false), 1, false)
  for (let i = 0; i < line.length; i += 2) {
    const [x, y] = line[i]
    const t = i / (line.length - 1)
    const s = (s0 + (s1 - s0) * t) * rr(0.85, 1.15)
    peakInst.push([x + rr(-20, 20), y + rr(-16, 16), s, ri(3, 5)])
  }
}
// 山缘草丘 (山脚过渡到平野)
{
  const mb = bboxOf(mountains)
  for (let i = 0; i < 54; i++) {
    const x = rr(mb[0], mb[2]), y = rr(mb[1], mb[3] + 70)
    const inM = inPoly(x, y, mountains)
    const nearS = inPoly(x, y, scrubBand)
    if (!inM && !nearS) continue
    if (inM && fbm(x * 0.006, y * 0.006) < 0.5) continue
    peakInst.push([x, y, rr(0.32, 0.52), 6])
  }
}
peakInst.sort((a, b) => a[1] - b[1])
for (const [x, y, s, v] of peakInst) {
  if (v === 6) useAt(14, `h${ri(0, 1)}`, x, y, s, 26)
  else useAt(14, `m${v}`, x, y, s, 40)
}
// 岳主 (巨型主峰群: 雪原底座 + 叠嶂山结)
{
  const mx = 3.55 * M, my = 0.52 * M
  const field = wobbleCircle(268, 0.22, 14, 77).map(([x, y]) => [x + mx, y + my])
  el(14, [mx - 320, my - 320, mx + 320, my + 320],
    `<path d="${pathOf(field, true)}" fill="#d7deee" stroke="${C.rockInk}" stroke-width="2.5" opacity="0.92"/>`)
  const cluster = []
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3
    cluster.push([mx + Math.cos(a) * rr(140, 235), my + Math.sin(a) * rr(110, 190), rr(1.15, 1.8), ri(3, 5)])
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.8
    cluster.push([mx + Math.cos(a) * rr(60, 120), my + Math.sin(a) * rr(50, 100), rr(1.8, 2.4), ri(3, 5)])
  }
  cluster.push([mx, my - 20, 3.4, 4])
  cluster.sort((a, b) => a[1] - b[1])
  for (const [x, y, s, v] of cluster) useAt(14, `m${v}`, x, y, s, 42)
  let cg = ''
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2
    const x = mx + Math.cos(a) * 196, y = my + Math.sin(a) * 172
    const h = rr(22, 44), w2 = h * 0.4
    cg += `<path d="M${n1(x - w2)},${n1(y)}L${n1(x)},${n1(y - h)}L${n1(x + w2)},${n1(y)}Z" fill="${C.crystal}" opacity="0.95" stroke="#3aa8a4" stroke-width="1.6"/>`
  }
  cg += `<circle cx="${mx}" cy="${my}" r="205" fill="none" stroke="${C.crystal}" stroke-width="10" opacity="0.22"/>`
  el(14, [mx - 250, my - 230, mx + 250, my + 230], cg)
}

// ============================================================
// 11. 树木 (密林 y 排序 / 平野孤林 / 雾野暗松)
// ============================================================
const clearings = [
  [1.55 * M, 2.5 * M, 300],
  [1.8 * M, 3.35 * M, 120],
  [2.35 * M, 2.0 * M, 90],
]
const treeInst = []
{
  const bb = bboxOf(forest)
  for (let gy = bb[1]; gy < bb[3]; gy += 24) {
    for (let gx = bb[0]; gx < bb[2]; gx += 24) {
      const x = gx + rr(-11, 11), y = gy + rr(-11, 11)
      if (!inPoly(x, y, forest)) continue
      if (clearings.some(([cx2, cy2, cr]) => (x - cx2) ** 2 + (y - cy2) ** 2 < cr * cr)) continue
      if (fbm(x * 0.004 + 40, y * 0.004 + 60) < 0.3) continue
      const pine = fbm(x * 0.003 + 200, y * 0.003) > 0.58
      treeInst.push([x, y, rr(0.75, 1.25), pine ? `p${ri(0, 2)}` : `d${ri(0, 4)}`])
    }
  }
}
for (const [gx, gy] of cells([
  [2.75, 2.3], [3.3, 1.9], [2.5, 3.0], [2.2, 3.9], [3.2, 3.5],
  [2.85, 4.55], [3.75, 4.5], [4.35, 1.35], [1.5, 4.1], [3.85, 1.95],
])) {
  const n = ri(5, 12)
  for (let i = 0; i < n; i++) {
    const x = gx + rr(-60, 60), y = gy + rr(-48, 48)
    if (!onLand(x, y) || blockers.some((b) => inPoly(x, y, b))) continue
    treeInst.push([x, y, rr(0.65, 1), `d${ri(0, 4)}`])
  }
}
{
  const bb = bboxOf(moor)
  for (let gy = bb[1]; gy < bb[3]; gy += 42) {
    for (let gx = bb[0]; gx < bb[2]; gx += 42) {
      const x = gx + rr(-16, 16), y = gy + rr(-16, 16)
      if (!inPoly(x, y, moor)) continue
      if (fbm(x * 0.005 + 80, y * 0.005 + 20) < 0.52) continue
      treeInst.push([x, y, rr(0.7, 1.05), `p${ri(0, 3)}`])
    }
  }
}
// 森林边缘灌木
for (let i = 0; i < forest.length; i += 7) {
  const [x, y] = forest[i]
  const bx = x + rr(-26, 26), by = y + rr(10, 40)
  if (!onLand(bx, by) || inPoly(bx, by, forest)) continue
  treeInst.push([bx, by, rr(0.4, 0.6), `d${ri(0, 4)}`])
}
treeInst.sort((a, b) => a[1] - b[1])
for (const [x, y, s, id] of treeInst) useAt(15, id, x, y, s, 26)

// ============================================================
// 12. 世树 (青荄祖树, 描线巨冠)
// ============================================================
{
  const tx = 1.55 * M, ty = 2.5 * M
  let g = `<circle cx="${tx}" cy="${ty}" r="276" fill="none" stroke="${C.glow}" stroke-width="20" opacity="0.2"/>`
  g += `<circle cx="${tx}" cy="${ty}" r="238" fill="none" stroke="${C.glow}" stroke-width="9" opacity="0.28"/>`
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2
    const x2 = tx + Math.cos(a) * rr(245, 305), y2 = ty + Math.sin(a) * rr(245, 305)
    g += `<path d="M${n1(tx + Math.cos(a) * 150)},${n1(ty + Math.sin(a) * 150)}Q${n1(tx + Math.cos(a + 0.25) * 225)},${n1(ty + Math.sin(a + 0.25) * 225)} ${n1(x2)},${n1(y2)}" fill="none" stroke="#2c5c37" stroke-width="11" stroke-linecap="round" opacity="0.85"/>`
  }
  const mega = wobbleCircle(215, 0.18, 14, 99).map(([x, y]) => [x + tx, y + ty])
  g += `<path d="${pathOf(mega, true)}" fill="#2e7a45" stroke="${C.worldTreeInk}" stroke-width="6"/>`
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2
    const r = rr(62, 108)
    const x = tx + Math.cos(a) * rr(58, 125), y = ty + Math.sin(a) * rr(58, 125)
    const lobe = wobbleCircle(r, 0.22, 10, 300 + i).map(([px, py]) => [px + x, py + y])
    g += `<path d="${pathOf(lobe, true)}" fill="${C.worldTree}" stroke="${C.worldTreeInk}" stroke-width="2.4"/>`
    g += `<circle cx="${n1(x - r * 0.24)}" cy="${n1(y - r * 0.26)}" r="${n1(r * 0.5)}" fill="${C.worldTreeLit}"/>`
  }
  g += `<circle cx="${n1(tx - 34)}" cy="${n1(ty - 40)}" r="54" fill="${C.worldTreeHi}" opacity="0.9"/>`
  for (let i = 0; i < 16; i++) {
    const a = rr(0, Math.PI * 2), rad = rr(180, 300)
    g += `<circle cx="${n1(tx + Math.cos(a) * rad)}" cy="${n1(ty + Math.sin(a) * rad)}" r="${n1(rr(2, 3.6))}" fill="#eaffce" opacity="0.85"/>`
  }
  el(16, [tx - 330, ty - 330, tx + 330, ty + 330], g)
}

// ============================================================
// 13. 海浪 / 云 / 雾
// ============================================================
for (let i = 0; i < 320; i++) {
  const x = rr(20, W - 20), y = rr(20, H - 20)
  if (!onWater(x, y) || inPoly(x, y, lake)) continue
  useAt(18, 'w0', x, y, rr(0.55, 1), 15)
}
for (let i = 0; i < coast.length; i += 12) {
  const [x, y] = coast[i]
  const nb = coast[(i + 4) % coast.length]
  let nx2 = -(nb[1] - y), ny2 = nb[0] - x
  const len = Math.hypot(nx2, ny2) || 1
  nx2 /= len; ny2 /= len
  let wx = x + nx2 * rr(95, 175), wy = y + ny2 * rr(95, 175)
  if (onLand(wx, wy)) { wx = x - nx2 * rr(95, 175); wy = y - ny2 * rr(95, 175) }
  if (onLand(wx, wy)) continue
  useAt(18, 'w0', wx, wy, rr(0.6, 1), 15)
}
// 云团 (海角与山肩)
function cloud(cx, cy, n, s) {
  let g = ''
  const puffs = []
  for (let i = 0; i < n; i++) puffs.push([cx + rr(-1, 1) * 60 * s * (i + 1) * 0.4, cy + rr(-24, 24) * s, rr(26, 52) * s])
  for (const [x, y, r] of puffs) g += `<circle cx="${n1(x)}" cy="${n1(y + r * 0.24)}" r="${n1(r)}" fill="${C.cloudShade}" opacity="0.85"/>`
  for (const [x, y, r] of puffs) g += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r * 0.94)}" fill="${C.cloud}" opacity="0.96"/>`
  const bb = bboxOf(puffs.map(([x, y, r]) => [x, y]), 80 * s)
  el(20, bb, g)
}
cloud(0.5 * M, 0.42 * M, 5, 1.15)
cloud(7.25 * M, 0.75 * M, 6, 1.3)
cloud(0.62 * M, 5.42 * M, 5, 1.1)
cloud(7.3 * M, 5.1 * M, 4, 0.95)
cloud(4.9 * M, 0.35 * M, 4, 0.8)
// 翳霭之雾
{
  const bb = bboxOf(moor, 120)
  for (let i = 0; i < 48; i++) {
    const x = rr(bb[0], Math.min(bb[2] + 260, W - 10))
    const y = rr(bb[1], bb[3])
    const inMoor = inPoly(x, y, moor)
    const offshoreEast = x > 6.4 * M && !onLand(x, y)
    if (!inMoor && !offshoreEast) continue
    const rx = rr(56, 145), ry2 = rr(16, 40), a = rr(-20, 20)
    const op = n1(rr(0.15, 0.32))
    el(19, [x - rx - 12, y - ry2 - 12, x + rx + 12, y + ry2 + 12],
      `<g transform="rotate(${n1(a)} ${n1(x)} ${n1(y)})">` +
      `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(rx)}" ry="${n1(ry2)}" fill="#ffffff" opacity="${op}"/>` +
      `<ellipse cx="${n1(x + rx * 0.5)}" cy="${n1(y + ry2 * 0.3)}" rx="${n1(rx * 0.6)}" ry="${n1(ry2 * 0.7)}" fill="#ffffff" opacity="${op}"/></g>`)
  }
  for (let i = 0; i < 8; i++) {
    const x = rr(5.5 * M, 6.7 * M), y = rr(1.7 * M, 3.3 * M)
    if (!inPoly(x, y, moor)) continue
    el(20, [x - 14, y - 14, x + 14, y + 14],
      `<circle cx="${n1(x)}" cy="${n1(y)}" r="12" fill="#cfffe9" opacity="0.25"/><circle cx="${n1(x)}" cy="${n1(y)}" r="4.5" fill="#cfffe9" opacity="0.85"/>`)
  }
}
// 纸纹 (全幅)
el(21, [0, 0, W, H], `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#pp)"/>`)

// ============================================================
// 14. 切片输出
// ============================================================
els.forEach((e, i) => (e.i = i))
els.sort((a, b) => a.layer - b.layer || a.i - b.i)

let total = 0
const sizes = []
for (let cy = 0; cy < NY; cy++) {
  for (let cx = 0; cx < NX; cx++) {
    const x0 = cx * M - PAD, y0 = cy * M - PAD, x1 = (cx + 1) * M + PAD, y1 = (cy + 1) * M + PAD
    const body = els
      .filter((e) => e.bbox[0] < x1 && e.bbox[2] > x0 && e.bbox[1] < y1 && e.bbox[3] > y0)
      .map((e) => e.str)
      .join('')
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cx * M} ${cy * M} ${M} ${M}" width="2048" height="2048" preserveAspectRatio="xMidYMid slice">` +
      `<defs>${DEFS}</defs>` + body + `</svg>`
    const id = `L0-${CX0 + cx}-${CY0 + cy}`
    writeFileSync(resolve(OUT, `${id}.svg`), svg)
    total += svg.length
    sizes.push([id, Math.round(svg.length / 1024)])
  }
}
console.log(sizes.map(([id, kb]) => `${id}: ${kb}KB`).join('\n'))
console.log(`TOTAL ${(total / 1024 / 1024).toFixed(2)}MB / 48 tiles`)
