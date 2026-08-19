import { useEffect } from 'react'
import { Button, Form, Input, Modal, Select } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { NODE_TAG_OPTIONS } from '../../data/storyline'
import './NodeEditModal.css'

const TAG_OPTIONS = NODE_TAG_OPTIONS.map((t) => ({ label: t, value: t }))

/**
 * 节点弹窗：点画布节点以「查看」打开，点「新增节点」以「编辑」打开。
 * node 为 null 时表示新增。
 */
export default function NodeEditModal({
  open,
  node = null,
  mode = 'view',
  onEdit,
  onCancel,
  onSubmit,
  onDelete,
}) {
  const [form] = Form.useForm()
  const isCreate = !node
  const isEdit = mode === 'edit'

  // 进入编辑态时把当前节点灌进表单；新增则给一份空值
  useEffect(() => {
    if (!open || !isEdit) return
    form.setFieldsValue({
      act: node?.act || '',
      title: node?.title || '',
      desc: node?.desc || '',
      tags: node?.tags || [],
    })
  }, [open, isEdit, node, form])

  const handleSubmit = async () => {
    let values
    try {
      values = await form.validateFields()
    } catch {
      return // 校验未通过，antd 已在表单里标红提示
    }
    onSubmit?.({
      ...values,
      act: values.act?.trim() || '未命名章节',
      title: values.title.trim(),
      desc: values.desc?.trim() || '',
      tags: values.tags || [],
    })
  }

  const title = isEdit ? (isCreate ? '新增节点' : '编辑节点') : '节点详情'

  const footer = isEdit
    ? [
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {isCreate ? '创建' : '保存'}
        </Button>,
      ]
    : [
        // 靠 CSS 推到最左，和「关闭 / 编辑」拉开距离，免得手滑点到
        <Button
          key="delete"
          danger
          icon={<DeleteOutlined />}
          onClick={onDelete}
          className="node-modal__delete-btn"
        >
          删除
        </Button>,
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>,
        <Button
          key="edit"
          type="primary"
          icon={<EditOutlined />}
          onClick={onEdit}
        >
          编辑
        </Button>,
      ]

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      footer={footer}
      width={560}
      destroyOnHidden
      className="node-modal"
    >
      {isEdit ? (
        <Form form={form} layout="vertical" className="node-modal__form">
          <Form.Item label="章节" name="act">
            <Input placeholder="例如：第一章" />
          </Form.Item>

          <Form.Item
            label="节点标题"
            name="title"
            rules={[{ required: true, message: '请填写节点标题' }]}
          >
            <Input placeholder="给这个节点起个名字" />
          </Form.Item>

          <Form.Item label="节点内容" name="desc">
            <Input.TextArea
              placeholder="描述这一段剧情……"
              autoSize={{ minRows: 6, maxRows: 14 }}
            />
          </Form.Item>

          <Form.Item label="标签" name="tags">
            <Select
              mode="tags"
              options={TAG_OPTIONS}
              placeholder="选择或输入标签"
              tokenSeparators={[',', '，']}
            />
          </Form.Item>
        </Form>
      ) : (
        <div className="node-modal__view">
          <span className="node-modal__act">{node?.act}</span>
          <h3 className="node-modal__title">{node?.title}</h3>

          {node?.tags?.length > 0 && (
            <div className="node-modal__tags">
              {node.tags.map((tag) => (
                <span key={tag} className="node-modal__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {node?.desc ? (
            <p className="node-modal__desc">{node.desc}</p>
          ) : (
            <p className="node-modal__desc node-modal__desc--empty">
              这个节点还没有内容，点「编辑」补充。
            </p>
          )}
        </div>
      )}
    </Modal>
  )
}
