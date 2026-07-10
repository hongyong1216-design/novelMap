import { Switch, Slider } from 'antd'
import './ClimateBandControl.css'

export default function ClimateBandControl({ visible, opacity, onVisibleChange, onOpacityChange }) {
  return (
    <div className="climate-band-control">
      <div className="climate-band-control__head">
        <span className="climate-band-control__label">气候带参考</span>
        <Switch size="small" checked={visible} onChange={onVisibleChange} />
      </div>
      <div className={`climate-band-control__body${visible ? '' : ' climate-band-control__body--off'}`}>
        <span className="climate-band-control__opacity-label">透明度</span>
        <Slider
          min={0.2}
          max={1}
          step={0.05}
          value={opacity}
          onChange={onOpacityChange}
          disabled={!visible}
          tooltip={{ formatter: (v) => `${Math.round(v * 100)}%` }}
        />
      </div>
    </div>
  )
}
