import { useEffect, useMemo } from 'react'
import { Form, Input, Modal, Radio, Select, Slider, Button } from 'antd'
import {
  MIN_ZOOM,
  MAX_ZOOM,
  VISIBILITY_PRESETS,
  detectPreset,
  rangeOfPreset,
  recommendPresetForZoom,
  zoomTierName,
} from '../../utils/visibilityPresets'
import { DEFAULT_ICON_ID, ICON_INDEX, resolveIcon } from '../../utils/iconLibrary'
import IconPicker from '../IconPicker/IconPicker'
import './ObjectEditorModal.css'

const LABEL_SIZES = [
  { value: 'lg', label: '大' },
  { value: 'md', label: '中' },
  { value: 'sm', label: '小' },
]

const PRESET_OPTIONS = [
  ...VISIBILITY_PRESETS.map((p) => ({
    value: p.id,
    label: `${p.name} · ${p.desc}`,
  })),
  { value: 'custom', label: '自定义 (滑块设定区间)' },
]

const MARKER_TITLE = { create: '添加标记', edit: '编辑标记' }
const LABEL_TITLE = { create: '添加标签', edit: '编辑标签' }

// 把对象的 (minZoom, maxZoom) 转为 form 的 preset + customRange
const valuesToForm = (obj, currentZoom) => {
  const hasZoomFields =
    obj && (obj.minZoom !== undefined || obj.maxZoom !== undefined)
  if (hasZoomFields) {
    const preset = detectPreset(obj.minZoom, obj.maxZoom)
    return {
      preset,
      customRange: [
        obj.minZoom ?? MIN_ZOOM,
        obj.maxZoom ?? MAX_ZOOM,
      ],
    }
  }
  const preset = recommendPresetForZoom(currentZoom)
  const [min, max] = rangeOfPreset(preset)
  return {
    preset,
    customRange: [
      Number.isFinite(min) ? min : MIN_ZOOM,
      Number.isFinite(max) ? max : MAX_ZOOM,
    ],
  }
}

// 把 form 输出转回 (minZoom, maxZoom)
const formToZoomRange = (preset, customRange) => {
  if (preset === 'custom') {
    return { minZoom: customRange[0], maxZoom: customRange[1] }
  }
  const [min, max] = rangeOfPreset(preset)
  const result = {}
  if (Number.isFinite(min)) result.minZoom = min
  if (Number.isFinite(max)) result.maxZoom = max
  return result
}

export default function ObjectEditorModal({
  open,
  objectType,
  mode = 'create',
  initialValues,
  currentZoom = 0,
  onOk,
  onCancel,
  onDelete,
}) {
  const [form] = Form.useForm()

  const titleMap = objectType === 'marker' ? MARKER_TITLE : LABEL_TITLE
  const title = titleMap[mode] || titleMap.create

  const defaults = useMemo(() => {
    const base = valuesToForm(initialValues || {}, currentZoom)
    if (objectType === 'marker') {
      // 优先用 initialValues.iconId, 否则从旧 type 映射, 否则默认
      const iconId =
        initialValues?.iconId ||
        (initialValues ? resolveIcon(initialValues).id : DEFAULT_ICON_ID)
      return {
        name: initialValues?.name || '',
        iconId,
        ...base,
      }
    }
    return {
      text: initialValues?.text || '',
      size: initialValues?.size || 'md',
      ...base,
    }
  }, [initialValues, objectType, currentZoom])

  useEffect(() => {
    if (open) {
      form.resetFields()
      form.setFieldsValue(defaults)
    }
  }, [open, defaults, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    const zoomRange = formToZoomRange(values.preset, values.customRange)
    const payload =
      objectType === 'marker'
        ? {
            name: values.name.trim(),
            iconId: values.iconId,
            ...zoomRange,
          }
        : {
            text: values.text.trim(),
            size: values.size,
            ...zoomRange,
          }
    onOk(payload)
  }

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'edit' ? '保存' : '添加'}
      cancelText="取消"
      width={460}
      destroyOnClose
      footer={(_, { OkBtn, CancelBtn }) => (
        <div className="object-editor-modal__footer">
          {mode === 'edit' && onDelete && (
            <Button danger onClick={onDelete}>
              删除
            </Button>
          )}
          <div className="object-editor-modal__footer-right">
            <CancelBtn />
            <OkBtn />
          </div>
        </div>
      )}
    >
      <div className="object-editor-modal__zoom-hint">
        当前缩放: <b>{currentZoom.toFixed(2)}</b>
        <span className="object-editor-modal__tier">
          {zoomTierName(currentZoom)}
        </span>
      </div>

      <Form form={form} layout="vertical" initialValues={defaults} preserve={false}>
        {objectType === 'marker' ? (
          <>
            <Form.Item
              label="名称"
              name="name"
              rules={[{ required: true, message: '请输入名称' }]}
            >
              <Input placeholder="例如:王都洛城" autoFocus />
            </Form.Item>
            <Form.Item label="图标" name="iconId">
              <IconPicker />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              label="文本"
              name="text"
              rules={[{ required: true, message: '请输入文本' }]}
            >
              <Input placeholder="例如:北境联邦" autoFocus />
            </Form.Item>
            <Form.Item label="字号" name="size">
              <Radio.Group options={LABEL_SIZES} optionType="button" />
            </Form.Item>
          </>
        )}

        <Form.Item label="可见性" name="preset">
          <Select options={PRESET_OPTIONS} />
        </Form.Item>

        <Form.Item
          shouldUpdate={(prev, cur) => prev.preset !== cur.preset}
          noStyle
        >
          {({ getFieldValue }) =>
            getFieldValue('preset') === 'custom' && (
              <Form.Item
                label={`自定义可见区间 (zoom ${MIN_ZOOM} ~ ${MAX_ZOOM})`}
                name="customRange"
              >
                <Slider
                  range
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.25}
                  marks={{
                    [MIN_ZOOM]: String(MIN_ZOOM),
                    [-1]: '-1',
                    [2]: '2',
                    [4]: '4',
                    [MAX_ZOOM]: String(MAX_ZOOM),
                  }}
                />
              </Form.Item>
            )
          }
        </Form.Item>
      </Form>
    </Modal>
  )
}
