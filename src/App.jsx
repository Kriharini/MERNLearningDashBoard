import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home      from './pages/Home'
import MongoDB   from './pages/MongoDB'
import Express   from './pages/Express'
import ReactPage from './pages/ReactPage'
import NodePage  from './pages/NodePage'
import Notes     from './pages/Notes'
import Interview from './pages/Interview'
import './App.css'

export default function App() {
  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/mongodb"   element={<MongoDB />} />
          <Route path="/express"   element={<Express />} />
          <Route path="/react"     element={<ReactPage />} />
          <Route path="/node"      element={<NodePage />} />
          <Route path="/notes"     element={<Notes />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
