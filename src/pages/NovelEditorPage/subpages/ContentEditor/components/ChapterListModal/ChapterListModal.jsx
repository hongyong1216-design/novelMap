import { Modal } from 'antd'
import './ChapterListModal.css'

export default function ChapterListModal({
  open,
  onClose,
  chapters = [],
  currentChapterId,
  onSelect,
}) {
  const handleSelect = (chapter) => {
    onSelect?.(chapter)
    onClose?.()
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <span className="chapter-list-modal__title">
          <span className="chapter-list-modal__title-tag">CHAPTERS</span>
          章节列表
        </span>
      }
      width={520}
      className="chapter-list-modal"
      destroyOnClose
    >
      <ul className="chapter-list-modal__list">
        {chapters.length === 0 && (
          <li
            className="chapter-list-modal__row"
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            暂无章节 · 在编辑器中开始书写
          </li>
        )}
        {chapters.map((c) => {
          const isCurrent = c.id === currentChapterId
          return (
            <li key={c.id} className="chapter-list-modal__row">
              <button
                type="button"
                className={
                  isCurrent
                    ? 'chapter-list-modal__item chapter-list-modal__item--current'
                    : 'chapter-list-modal__item'
                }
                onClick={() => handleSelect(c)}
              >
                <span className="chapter-list-modal__index">
                  CH.{String(c.id).padStart(2, '0')}
                </span>
                <span className="chapter-list-modal__chapter-title">{c.title}</span>
                <span className="chapter-list-modal__meta">{c.meta}</span>
                {isCurrent && <span className="chapter-list-modal__current-pill">当前</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}
