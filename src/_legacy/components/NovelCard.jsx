import { useNavigate } from 'react-router-dom'
import '../styles/NovelCard.css'

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const ShareIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

const MoreIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="5" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </svg>
)

const PencilIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
)

export default function NovelCard({ novel }) {
  const navigate = useNavigate()
  const { title, author, genre, progress, words, chapter, lastUpdated, coverGradient, progressColor, id } = novel

  const handleEdit = (e) => {
    e.preventDefault()
    navigate(`/editor/${id}`)
  }

  const handleContinueWriting = () => {
    navigate(`/editor/${id}`)
  }

  return (
    <article className="novel-card">
      <div className="card-top">
        <div
          className="book-cover"
          style={{ background: coverGradient }}
        >
          <span className="book-cover-title">{title}</span>
        </div>
        <div className="card-info">
          <div className="field-label">书名</div>
          <div className="card-title">{title}</div>
          <div className="card-meta-row">
            <span className="meta-label">作者：</span>{author}
          </div>
          <div className="card-meta-row">
            <span className="meta-label">类型：</span>{genre}
          </div>
        </div>
      </div>

      <div className="progress-wrapper">
        <div className="progress-header">
          <span>进度</span>
          <span className="progress-pct">{progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%`, background: progressColor }}
          />
        </div>
      </div>

      <div className="stats-row">
        {words} 字<span className="sep">|</span>第 {chapter} 章
      </div>
      <div className="last-updated">最近更新：{lastUpdated}</div>

      <div className="card-actions">
        <button className="btn-continue" onClick={handleContinueWriting}>继续写作</button>
        <button className="action-btn" title="编辑" onClick={handleEdit}><EditIcon /></button>
        <button className="action-btn" title="分享"><ShareIcon /></button>
        <button className="action-btn" title="更多"><MoreIcon /></button>
      </div>

      <div className="card-footer">
        <a href="#" className="edit-link" onClick={handleEdit}>
          <PencilIcon />
          编辑详情
        </a>
      </div>
    </article>
  )
}
