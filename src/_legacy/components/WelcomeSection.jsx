import '../styles/WelcomeSection.css'

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

export default function WelcomeSection() {
  return (
    <section className="welcome-section">
      <div className="welcome-text">
        <h1>欢迎回来，沙拉！</h1>
        <p>您的创作中心（共 12 部小说）</p>
      </div>
      <div className="search-container">
        <span className="search-icon">
          <SearchIcon />
        </span>
        <input type="text" placeholder="搜索小说..." />
      </div>
    </section>
  )
}
