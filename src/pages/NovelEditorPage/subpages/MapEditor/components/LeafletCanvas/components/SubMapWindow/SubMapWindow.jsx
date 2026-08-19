import { Modal } from 'antd'
import { CompassOutlined } from '@ant-design/icons'
import FloatingModal from '../../../../../../../../components/FloatingModal/FloatingModal'
import SubMapCanvas from './SubMapCanvas'
import { normalizeSubMap } from '../../utils/subMap'
import './SubMapWindow.css'

// 窗口小于这个尺寸就不值得按 anchorRect 开了 (画布被挤得太窄时), 退回按视口铺
const MIN_ANCHOR_WIDTH = 560
const MIN_ANCHOR_HEIGHT = 380
// 四周留一圈边: 既看得出这是个可拖动的窗口, 也能瞄到底下的世界地图
const INSET = 20

// 默认开窗几何: 优先盖住地图画布 (四周留 INSET, 左侧菜单仍露在外面可点),
// 量不到画布才退回按视口开
const openGeometry = (rect) => {
  if (rect && rect.w >= MIN_ANCHOR_WIDTH && rect.h >= MIN_ANCHOR_HEIGHT) {
    return {
      width: Math.round(rect.w - INSET * 2),
      height: Math.round(rect.h - INSET * 2),
      x: Math.round(rect.x + INSET),
      y: Math.round(rect.y + INSET),
    }
  }
  const vw = typeof window === 'undefined' ? 1280 : window.innerWidth
  const vh = typeof window === 'undefined' ? 800 : window.innerHeight
  return {
    width: Math.round(vw - INSET * 2),
    height: Math.round(vh - INSET * 2),
    x: undefined, // 交给 FloatingModal 居中
    y: undefined,
  }
}

// 世界地图上点图标 →「展开地图」打开的浮窗: 里面是这个地点自己的一张地图。
// 数据存在 world.subMaps[marker.id] 下, 改动即时生效 (随主地图一起进 localStorage 和导出 JSON),
// 所以窗口不设"保存 / 取消", 关掉就是关掉。
export default function SubMapWindow({
  open,
  marker,
  subMap,
  anchorRect,
  onUpdate,
  onReset,
  onClose,
}) {
  if (!open || !marker) return null

  const data = normalizeSubMap(subMap)
  const geometry = openGeometry(anchorRect)

  const handleReset = () => {
    Modal.confirm({
      title: `清空「${marker.name}」的子地图?`,
      content: '这张图上的格子、标记、标签会全部删除, 不可撤销。',
      okText: '清空',
      okButtonProps: { danger: true },
      cancelText: '取消',
      zIndex: 1100,
      onOk: onReset,
    })
  }

  return (
    <FloatingModal
      open={open}
      onClose={onClose}
      title={`${marker.name} · 子地图`}
      className="sub-map-window"
      defaultWidth={geometry.width}
      defaultHeight={geometry.height}
      defaultX={geometry.x}
      defaultY={geometry.y}
      showFooter={false}
      minimizedIcon={<CompassOutlined />}
    >
      <SubMapCanvas
        marker={marker}
        subMap={data}
        onUpdate={onUpdate}
        onReset={handleReset}
      />
    </FloatingModal>
  )
}
