import { useState } from 'react'
import { Input, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import './BasicInfoForm.css'

export default function BasicInfoForm({ faction, onChange }) {
  const [draftTag, setDraftTag] = useState('')
  const [adding, setAdding] = useState(false)

  const updateCapability = (next) => {
    onChange?.({ capabilities: next })
  }

  const handleRemoveCapability = (target) => {
    updateCapability(faction.capabilities.filter((c) => c !== target))
  }

  const handleSubmitTag = () => {
    const value = draftTag.trim()
    if (value && !faction.capabilities.includes(value)) {
      updateCapability([...faction.capabilities, value])
    }
    setDraftTag('')
    setAdding(false)
  }

  return (
    <div className="basic-info">
      <div className="basic-info__field">
        <label className="basic-info__label basic-info__label--primary">
          势力概述 / OVERVIEW
        </label>
        <Input.TextArea
          value={faction.overview}
          onChange={(e) => onChange?.({ overview: e.target.value })}
          placeholder="在此输入势力背景故事..."
          autoSize={{ minRows: 4 }}
          variant="borderless"
          className="basic-info__textarea"
        />
      </div>

      <div className="basic-info__row">
        <div className="basic-info__field">
          <label className="basic-info__label">领导人 (LEADERSHIP)</label>
          <Input
            value={faction.leadership}
            onChange={(e) => onChange?.({ leadership: e.target.value })}
            variant="borderless"
            className="basic-info__input"
            placeholder="未指定"
          />
        </div>
        <div className="basic-info__field">
          <label className="basic-info__label">所属区域 (SECTOR)</label>
          <Input
            value={faction.sector}
            onChange={(e) => onChange?.({ sector: e.target.value })}
            variant="borderless"
            className="basic-info__input"
            placeholder="未指定"
          />
        </div>
      </div>

      <div className="basic-info__field">
        <label className="basic-info__label">拥有的能力 (CAPABILITIES)</label>
        <div className="basic-info__tags">
          {faction.capabilities.map((c) => (
            <Tag
              key={c}
              closable
              onClose={() => handleRemoveCapability(c)}
              className="basic-info__tag"
            >
              {c}
            </Tag>
          ))}
          {adding ? (
            <Input
              size="small"
              autoFocus
              value={draftTag}
              onChange={(e) => setDraftTag(e.target.value)}
              onBlur={handleSubmitTag}
              onPressEnter={handleSubmitTag}
              className="basic-info__tag-input"
              placeholder="能力名称"
            />
          ) : (
            <button
              type="button"
              className="basic-info__tag-add"
              onClick={() => setAdding(true)}
            >
              <PlusOutlined />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
