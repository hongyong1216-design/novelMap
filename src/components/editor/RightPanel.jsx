import { useState } from 'react'
import './RightPanel.css'

const CommentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const LightbulbIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z" />
    <path d="M8.5 14c-1.4-1.5-2.5-3.7-2.5-5.5a6 6 0 1 1 12 0c0 1.8-1.1 4-2.5 5.5" />
  </svg>
)

const MoreIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="19" cy="12" r="1" fill="currentColor" />
    <circle cx="5" cy="12" r="1" fill="currentColor" />
  </svg>
)

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

export default function RightPanel({ characters, timelineEntries, outlineData }) {
  return (
    <aside className="right-panel">
      {/* 审阅区域 */}
      <div className="panel-section">
        <div className="section-header">
          <h3 className="panel-title">审阅</h3>
          <button className="btn-more"><MoreIcon /></button>
        </div>
        <div className="review-list">
          <div className="review-list-item">
            <CommentIcon />
            <span>评论：</span>
            <span className="badge">3</span>
          </div>
          <div className="review-list-item">
            <LightbulbIcon />
            <span>建议</span>
          </div>
        </div>
      </div>

      {/* 角色列表 */}
      <div className="panel-section">
        <div className="section-header">
          <h3 className="panel-title">角色</h3>
          <button className="btn-more"><MoreIcon /></button>
        </div>
        <div className="characters-list">
          {characters.map(char => (
            <div key={char.id} className="character-item">
              <div
                className="character-avatar-small"
                style={{ background: `linear-gradient(135deg, ${char.color}, ${char.color}aa)` }}
              >
                {char.name.charAt(0)}
              </div>
              <span className="character-name">{char.name}</span>
            </div>
          ))}
        </div>
        <div className="character-actions">
          <button className="btn-character-action">快速档案</button>
          <button className="btn-character-action">笔记</button>
        </div>
      </div>

      {/* 时间线 */}
      <div className="panel-section">
        <h3 className="panel-title">时间线</h3>
        <div className="timeline-vertical">
          {timelineEntries.map((entry, index) => (
            <div key={entry.id} className="timeline-row">
              <div className="timeline-dot-col">
                <div className={`timeline-dot ${entry.chapter === '第4章' ? 'active' : ''}`} />
                {index !== timelineEntries.length - 1 && <div className="timeline-line" />}
              </div>
              <span className={`timeline-label ${entry.chapter === '第4章' ? 'active' : ''}`}>
                {entry.chapter}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 修订历史 */}
      <div className="panel-section">
        <h3 className="panel-title">修订历史</h3>
        <div className="revision-history">
          <div className="revision-item">
            <span className="revision-badge">V1.2 当前</span>
            <ChevronDown />
          </div>
        </div>
      </div>

      {/* 大纲 */}
      <div className="panel-section">
        <div className="section-header">
          <h3 className="panel-title">大纲</h3>
          <button className="btn-more"><MoreIcon /></button>
        </div>
        <div className="outline-list">
          <div className="outline-header">
            <ChevronDown />
            <span>第4章</span>
          </div>
          <div className="outline-items">
            {outlineData.map(item => (
              <div key={item.id} className="outline-item">
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
