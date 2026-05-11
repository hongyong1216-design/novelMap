import { useNavigate } from 'react-router-dom'
import './HomePage.css'

const projects = [
  {
    id: 1,
    title: '深蓝档案：回响',
    summary: '他在黑暗中听见了深海的呼唤，那是被遗忘在赛博空间里的古老指令...',
    words: '42,019',
    updated: '2小时前',
    statusLabel: '修改中',
    statusVariant: 'editing',
    cover:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBIHJDmbOigVVK6S2dv62alSQuK5kzicO_fv3-PgbtVzk0HnuBsHTSIKRSapXjTivrq5n2uH0uTdSPpwSupb7IQFKhDAh5oBbYh4o38DQGjU3T4yhAtmPAAi4EYV47DNnYjEOV_-n1NZlqT_bpLGHEgmmohCylcoxEJ-3wMt1oOaEuAhwsp7KfB7YuXtimLCWYMaSZcCLRtpf-tE9AxMovs83tdCu1-yUhtxQYy4aW-ilITTA-C60_GnWv9o5ndvLRX_UHBB-lve5I',
  },
  {
    id: 2,
    title: '锈蚀之心',
    summary: '在废弃的基站深处，最后一个人工智能正在学会如何流泪。',
    words: '128,500',
    updated: '12天前',
    statusLabel: '已封存',
    statusVariant: 'archived',
    cover:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAI8mP4J2RUB7iUZDOwNrlhoGEO9WKRExdsic726NOKdJESIcpVL9-ZQm2L-D4FHCHzuSvETFM-mE4PJX_d7KHCwPCZebI1185lQDWb9d6sxw0_YPo1p-CscdOxqIlx0RIbbPm2WIDwkPGiPfwaFYA-yKsCQQjoGMSfMxKZMB_ulMuLKuzYsxWTnwBVabuC-ajsDE8EUjRxZPzSHzFicekauXE_vfHiGXOGbJIH7Zkl5LdYacdUl7cUYjpS2WTYFZMe8_Gx40c6oFk',
  },
  {
    id: 3,
    title: '虚数边界',
    summary: '物理规律在这一刻失效，现实与虚构的界限正逐渐模糊...',
    words: '8,210',
    updated: '昨天',
    statusLabel: null,
    statusVariant: null,
    cover:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB0_z2ClDnEqiDepHWkXWJfjAxvxI4JKjH-7rJaorfWQfuYx9zw8K-V4qESgKtCH9nFIkqm3GJZTYlpYRBvNECSVGZ93FnvxkGKLW65dJ2H_AeHqzsITO_t77KSQ4SqeFYjthLu3u99DtXmDTpAXV0tob41z6m8scijDgl8PQubgRD6h5Y02NAYzeBlQdpaEUamu_h_lmLUNnXwL2A8N_EnsXRHqPZOa7q7xqqrxUjH8ACOk35Qt7odHMN12_8fdHzmQpeTAsUkIcE',
  },
]

const activityBars = [40, 60, 90, 50, 30, 75, 95]
const activeBarIndices = new Set([2, 6])

const avatarUrl =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDUTVbc0JwpaHHOKovdUqQsQAYb-YfrRgqv7IHqbGV0_HXB5keURR-ymAqExl7ZN0n-oZ-3aM-eLrL1srfYrLpERHqBZUdnqPaegZIRp5eBNf-Qll1ctBwzLdpsLp8PK7BmMThYHyPsC12HEop3FtioMFWFEZQ9wRGvBp9WT5uiIPwoUYo5wW0ko5nNbVPBC_lv6kOlfY9kZOXjwmy_BPqclhyYS3KrgSh3kWm9udbjSHaRhnlYS5RzH-SwHj1qV6eOshwNNM-yYJg'

export default function HomePage() {
  const navigate = useNavigate()

  const goToEditor = (novelId) => navigate(`/editor/${novelId}`)
  const handleCardKeyDown = (novelId) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      goToEditor(novelId)
    }
  }

  return (
    <div className="home-page">
      <header className="home-page__top-app-bar">
        <div className="home-page__brand">
          <h1 className="home-page__logo">COBALT ARCHIVE</h1>
          <nav className="home-page__nav">
            <a href="#" className="home-page__nav-link home-page__nav-link--active">
              库 (ARCHIVE)
            </a>
            <a href="#" className="home-page__nav-link">草稿 (DRAFTS)</a>
            <a href="#" className="home-page__nav-link">发布 (PUBLISH)</a>
          </nav>
        </div>
        <div className="home-page__top-actions">
          <div className="home-page__search">
            <span className="material-symbols-outlined home-page__search-icon">search</span>
            <input className="home-page__search-input" placeholder="检索核心数据..." type="text" />
          </div>
          <div className="home-page__top-actions-right">
            <button type="button" className="home-page__icon-button" aria-label="通知">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button type="button" className="home-page__icon-button" aria-label="设置">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="home-page__avatar">
              <img src={avatarUrl} alt="Auteur Profile" />
            </div>
          </div>
        </div>
      </header>

      <main className="home-page__main">
        <section className="home-page__hero">
          <h2 className="home-page__hero-title">欢迎回来，记录者。</h2>
          <p className="home-page__hero-meta">SESSION ID: ARCHIVE_OCT_2023 // 状态: 同步中</p>
        </section>

        <div className="home-page__grid">
          <button
            type="button"
            className="home-page__create-card"
            onClick={() => goToEditor('new')}
          >
            <div className="home-page__create-card-glow" />
            <span className="material-symbols-outlined home-page__create-icon">add</span>
            <span className="home-page__create-label">创建新章节</span>
            <span className="home-page__create-meta">NEW_CHRONICLE.EXE</span>
          </button>

          {projects.map((p) => (
            <article
              key={p.id}
              className="home-page__card"
              role="button"
              tabIndex={0}
              onClick={() => goToEditor(p.id)}
              onKeyDown={handleCardKeyDown(p.id)}
            >
              <div className="home-page__card-cover">
                <img className="home-page__card-image" src={p.cover} alt="" />
                <div className="home-page__card-cover-overlay" />
                {p.statusLabel && (
                  <div
                    className={`home-page__card-status home-page__card-status--${p.statusVariant}`}
                  >
                    {p.statusLabel}
                  </div>
                )}
              </div>
              <div className="home-page__card-body">
                <div>
                  <h3 className="home-page__card-title">{p.title}</h3>
                  <p className="home-page__card-summary">{p.summary}</p>
                </div>
                <div className="home-page__card-footer">
                  <div className="home-page__card-meta">
                    <div>字数: {p.words}</div>
                    <div>更新: {p.updated}</div>
                  </div>
                  <span className="material-symbols-outlined home-page__card-arrow">
                    arrow_forward_ios
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="home-page__stats">
          <div className="home-page__stat">
            <p className="home-page__stat-label home-page__stat-label--primary">档案同步率</p>
            <div className="home-page__stat-bar-track">
              <div className="home-page__stat-bar-fill" style={{ width: '94%' }} />
            </div>
            <p className="home-page__stat-meta">DATA INTEGRITY: 99.98%</p>
          </div>

          <div className="home-page__stat">
            <p className="home-page__stat-label home-page__stat-label--secondary">创作活跃度</p>
            <div className="home-page__activity-bars">
              {activityBars.map((h, i) => (
                <div
                  key={i}
                  className={
                    activeBarIndices.has(i)
                      ? 'home-page__activity-bar home-page__activity-bar--active'
                      : 'home-page__activity-bar'
                  }
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <p className="home-page__stat-meta">RECENT UPTIME: 14.2 HRS</p>
          </div>

          <div className="home-page__stat">
            <p className="home-page__stat-label home-page__stat-label--tertiary">目标进度</p>
            <p className="home-page__stat-progress">12,400 / 50,000 字</p>
            <p className="home-page__stat-meta">MILESTONE: CH_04_COMPLETE</p>
          </div>
        </div>
      </main>

      <div className="home-page__floating">
        <button type="button" className="home-page__floating-button" aria-label="灵感库">
          <span className="material-symbols-outlined">auto_stories</span>
        </button>
        <button
          type="button"
          className="home-page__floating-button home-page__floating-button--primary"
          aria-label="编辑笔记"
        >
          <span className="material-symbols-outlined">edit_note</span>
        </button>
      </div>
    </div>
  )
}
