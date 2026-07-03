import { useState } from 'react'
import './ContentEditor.css'
import ChapterListModal from './components/ChapterListModal/ChapterListModal'
import FloatingModal from '../../../../components/FloatingModal/FloatingModal'

const chapters = []

const currentChapterId = null

const initialTitle = ''

const initialContent = ''

const starmapUrl =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCtktrWfym5DHwF9en_Ri0Bjqg7nb2v2-hpzWrKjiiQ6QQ2EalE-8umi5OAJu8JYZiLQPjnkw0_ei7JGLclr9iqi0wR7DX9DxqimcElW0SOug6_UUFa59GZzNyuLTypTz70A2VZwOD0T_hFgp001tSeoIUJ8SfoXmkT4PCVq9svxe0uQTMR6ucVydlm9j4r9MMsxsJHW1cl2ohKiXa5jAfd0qh8BsrOOpv2qn7BDNmYMqaEuW2CGAoIMGuIhBliWiZD210ZEt8L9tA'

const editorTitle = (
  <span className="content-editor__file-name">FILE_EDIT: 未命名.txt</span>
)

const countWords = (text) => text.replace(/\s/g, '').length

export default function ContentEditor() {
  const [chapterModalOpen, setChapterModalOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(true)
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)

  const wordCount = countWords(title) + countWords(content)

  const handleSave = () => {
    // TODO: 持久化到后端
    console.log('save', { title, content })
    setEditorOpen(false)
  }

  const handleCancel = () => {
    setTitle(initialTitle)
    setContent(initialContent)
    setEditorOpen(false)
  }

  const footerExtra = (
    <span className="content-editor__word-count">字数 {wordCount}</span>
  )

  return (
    <div className="content-editor">
      <div className="content-editor__bg-grid" />
      <div className="content-editor__bg-starmap">
        <img src={starmapUrl} alt="" />
      </div>

      <FloatingModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editorTitle}
        defaultWidth={896}
        defaultHeight={720}
        className="content-editor__modal"
        onSave={handleSave}
        onCancel={handleCancel}
        footerExtra={footerExtra}
      >
        <div className="content-editor__article-wrap">
          <div className="content-editor__article">
            <input
              type="text"
              className="content-editor__chapter-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="章节标题"
            />
            <textarea
              className="content-editor__textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始书写..."
            />
          </div>
        </div>
      </FloatingModal>

      <button
        type="button"
        className="content-editor__fab content-editor__fab--restore"
        onClick={() => setEditorOpen(true)}
      >
        <span className="material-symbols-outlined">refresh</span>
        <div className="content-editor__fab-text">
          <span className="content-editor__fab-label">恢复最近</span>
          <span className="content-editor__fab-value">ARCHIVE_LAST_SESSION</span>
        </div>
      </button>

      <button
        type="button"
        className="content-editor__fab content-editor__fab--chapters"
        onClick={() => setChapterModalOpen(true)}
      >
        <div className="content-editor__fab-text content-editor__fab-text--right">
          <span className="content-editor__fab-label">章节列表</span>
          <span className="content-editor__fab-value">NAVIGATE_CHAPTERS</span>
        </div>
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          list
        </span>
      </button>

      <div className="content-editor__meta">
        <div className="content-editor__meta-item">
          <p className="content-editor__meta-label content-editor__meta-label--primary">
            Connectivity
          </p>
          <p className="content-editor__meta-value">UPLINK_STABLE_99%</p>
        </div>
        <div className="content-editor__meta-item">
          <p className="content-editor__meta-label content-editor__meta-label--tertiary">
            Temporal Sync
          </p>
          <p className="content-editor__meta-value">23:58:12 UTC+8</p>
        </div>
        <div className="content-editor__meta-divider" />
        <div className="content-editor__meta-bars">
          <div className="content-editor__meta-bar-row">
            <span className="content-editor__meta-bar content-editor__meta-bar--w4 content-editor__meta-bar--lit" />
            <span className="content-editor__meta-bar content-editor__meta-bar--w8 content-editor__meta-bar--dim" />
          </div>
          <div className="content-editor__meta-bar-row">
            <span className="content-editor__meta-bar content-editor__meta-bar--w6 content-editor__meta-bar--mid" />
            <span className="content-editor__meta-bar content-editor__meta-bar--w6 content-editor__meta-bar--mid" />
          </div>
        </div>
      </div>

      <ChapterListModal
        open={chapterModalOpen}
        onClose={() => setChapterModalOpen(false)}
        chapters={chapters}
        currentChapterId={currentChapterId}
        onSelect={(c) => {
          // TODO: 切换章节逻辑
          console.log('select chapter', c.id)
        }}
      />
    </div>
  )
}

