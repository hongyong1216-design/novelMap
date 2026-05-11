import { useState } from 'react'
import './ContentEditor.css'
import ChapterListModal from './components/ChapterListModal/ChapterListModal'
import FloatingModal from '../../../../components/FloatingModal/FloatingModal'

const chapters = [
  { id: 31, title: '深海的回声', meta: '2,341 字 · 已完成' },
  { id: 32, title: '断裂的协议', meta: '1,890 字 · 已完成' },
  { id: 33, title: '生锈的钢铁', meta: '2,012 字 · 已完成' },
  { id: 34, title: '钴蓝档案的终局', meta: '1,248 字 · 进行中' },
  { id: 35, title: '光与噪声', meta: '草稿' },
  { id: 36, title: '最终同步', meta: '草稿' },
]

const currentChapterId = 34

const initialTitle = '第三十四章：钴蓝档案的终局'

const initialContent = [
  '冷冽的钴蓝色光芒在实验室的显示屏上跳动。周遭寂静得只能听到散热系统的低鸣，那种声音像是一种古老的机械呼吸。',
  '"系统状态：同步中。" 终端屏幕上闪烁着冰冷的白色字符。他停下了敲击，手指悬停在感应板上方，由于长时间的专注，指尖微微有些发凉。',
  '这个档案中不仅记录着代码，更记录着一个时代的消亡。每一个字节都承载着过去十年的工业记忆。那些关于深海矿坑、无人哨站和生锈的钢铁巨兽的记忆。',
  '在这个充斥着工业废料和数字残影的世界里，真相往往被隐藏在最底层的协议之中。',
  '他深吸一口气，再次将手指落在控制台上。随着最后一行指令的输入，屏幕上的光流开始加速，整个房间被一种深邃的、几乎是神圣的蓝色所吞没。',
].join('\n\n')

const starmapUrl =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCtktrWfym5DHwF9en_Ri0Bjqg7nb2v2-hpzWrKjiiQ6QQ2EalE-8umi5OAJu8JYZiLQPjnkw0_ei7JGLclr9iqi0wR7DX9DxqimcElW0SOug6_UUFa59GZzNyuLTypTz70A2VZwOD0T_hFgp001tSeoIUJ8SfoXmkT4PCVq9svxe0uQTMR6ucVydlm9j4r9MMsxsJHW1cl2ohKiXa5jAfd0qh8BsrOOpv2qn7BDNmYMqaEuW2CGAoIMGuIhBliWiZD210ZEt8L9tA'

const editorTitle = (
  <span className="content-editor__file-name">FILE_EDIT: 第三十四章_深蓝协议.txt</span>
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

