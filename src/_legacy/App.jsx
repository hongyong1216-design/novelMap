import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import WelcomeSection from './components/WelcomeSection'
import NovelGrid from './components/NovelGrid'
import EditorPage from './pages/EditorPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="app">
          <Navbar />
          <main className="main-content">
            <WelcomeSection />
            <NovelGrid />
          </main>
        </div>
      } />
      <Route path="/editor/:novelId" element={<EditorPage />} />
    </Routes>
  )
}
