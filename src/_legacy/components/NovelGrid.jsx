import NovelCard from './NovelCard'
import { novels } from '../data/novels'
import '../styles/NovelGrid.css'

const ChevronDown = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export default function NovelGrid() {
  return (
    <section className="novel-section">
      <div className="section-header">
        <h2 className="section-title">最近小说</h2>
        <div className="sort-control">
          排序方式：<span className="sort-value">最近更新 <ChevronDown /></span>
        </div>
      </div>
      <div className="novels-grid">
        {novels.map(novel => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
      </div>
    </section>
  )
}
