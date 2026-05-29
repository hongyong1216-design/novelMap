import { MIN_ZOOM, MAX_ZOOM, zoomTierName } from '../../utils/visibilityPresets'
import './ZoomHUD.css'

export default function ZoomHUD({ zoom }) {
  const range = MAX_ZOOM - MIN_ZOOM
  const progress = Math.max(0, Math.min(100, ((zoom - MIN_ZOOM) / range) * 100))
  const remaining = Math.max(0, MAX_ZOOM - zoom)
  const tier = zoomTierName(zoom)

  return (
    <div className="zoom-hud">
      <div className="zoom-hud__row">
        <span className="zoom-hud__zoom">Zoom {zoom.toFixed(2)}</span>
        <span className="zoom-hud__tier">{tier}</span>
      </div>
      <div className="zoom-hud__bar">
        <div
          className="zoom-hud__bar-fill"
          style={{ width: `${progress}%` }}
        />
        <div className="zoom-hud__bar-ticks">
          {[-1, 2, 4].map((z) => {
            const left = ((z - MIN_ZOOM) / range) * 100
            return (
              <span
                key={z}
                className="zoom-hud__tick"
                style={{ left: `${left}%` }}
              />
            )
          })}
        </div>
      </div>
      <div className="zoom-hud__meta">
        {remaining <= 0.01
          ? '已达最大缩放'
          : `还能放大 ${remaining.toFixed(2)} 级`}
      </div>
    </div>
  )
}
