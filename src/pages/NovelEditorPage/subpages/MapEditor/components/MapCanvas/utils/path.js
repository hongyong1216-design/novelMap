// 解析简单的 SVG path 字符串（仅支持 M/L/Q/Z 指令）为点列表
export function parsePath(d) {
  const pts = []
  const tokens = d.replace(/([A-Za-z])/g, ' $1 ').trim().split(/\s+/)
  let x = 0, y = 0
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t === 'M') {
      x = +tokens[++i]; y = +tokens[++i]; pts.push([x, y])
    } else if (t === 'L' || t === 'Q') {
      x = +tokens[++i]; y = +tokens[++i]; pts.push([x, y])
    }
  }
  return pts
}

// 给点列表添加随机偏移，制造"不规则"笔触效果
export function jitterPoints(pts, seed) {
  const result = []
  const jitter = 3
  for (let i = 0; i < pts.length; i += 2) {
    const x = pts[i] + ((Math.sin(seed + i) * 43758.5453) % 1) * jitter * 2 - jitter
    const y = pts[i + 1] + ((Math.sin(seed + i + 1) * 23421.6312) % 1) * jitter * 2 - jitter
    result.push(x, y)
  }
  return result
}
