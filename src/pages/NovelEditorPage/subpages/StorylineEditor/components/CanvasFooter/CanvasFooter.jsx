import './CanvasFooter.css'

export default function CanvasFooter({
  zoom = 85,
  ready = true,
  charCount = 0,
}) {
  return (
    <footer className="canvas-footer">
      <div className="canvas-footer__group">
        <span className="canvas-footer__label">缩放: {zoom}%</span>
        <div className="canvas-footer__progress">
          <div
            className="canvas-footer__progress-bar"
            style={{ width: `${zoom}%` }}
          />
        </div>
      </div>

      <div className="canvas-footer__group canvas-footer__group--right">
        <div className="canvas-footer__status">
          <span
            className={
              ready
                ? 'canvas-footer__status-dot canvas-footer__status-dot--ready'
                : 'canvas-footer__status-dot'
            }
          />
          <span className="canvas-footer__label canvas-footer__label--strong">
            {ready ? '系统就绪' : '同步中'}
          </span>
        </div>
        <span className="canvas-footer__divider" />
        <span className="canvas-footer__label">
          字符统计: {charCount.toLocaleString()}
        </span>
      </div>
    </footer>
  )
}
