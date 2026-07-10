import { useEffect, useReducer } from 'react'
import { CLIMATE_BANDS } from '../../data/climateBands'
import './ClimateRuler.css'

// 带在屏幕上的像素高度小于此值时, 竖排带名换用小字号
const THIN_PX = 34

// 左缘纬度标尺: 水平方向固定贴在地图左缘 (始终可见), 垂直方向随地图平移/缩放,
// 每条带的 top/height 由地图投影实时算出 → 与网格行严丝合缝、按格子一致地放大缩小。
// 纯 DOM 覆盖层, pointer-events:none, 不接管鼠标, 编辑手感零影响。
export default function ClimateRuler({ map, worldSize, visible = true, opacity = 0.85 }) {
  const [, force] = useReducer((c) => c + 1, 0)

  useEffect(() => {
    if (!map) return undefined
    const onChange = () => force()
    const events = 'move zoom zoomend moveend viewreset resize'
    map.on(events, onChange)
    return () => map.off(events, onChange)
  }, [map])

  if (!visible || !map) return null

  // 世界高度比例 → 当前视口的容器像素 Y (lng 取 0, 只用 y 分量)
  const yOf = (frac) => map.latLngToContainerPoint([frac * worldSize, 0]).y

  return (
    <div className="climate-ruler" style={{ opacity }}>
      {CLIMATE_BANDS.map((band) => {
        const top = yOf(band.from)
        const height = yOf(band.to) - top
        const thin = height < THIN_PX
        return (
          <div
            key={band.id}
            className="climate-ruler__band"
            style={{ top, height, background: band.color }}
            title={band.name}
          >
            <span className={`climate-ruler__name${thin ? ' climate-ruler__name--thin' : ''}`}>
              {band.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
