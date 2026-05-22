import { useNavigate } from 'react-router-dom'
import { TECHS } from '../data/mernData'

function readProgress(id, total) {
  try {
    const stored = JSON.parse(localStorage.getItem(`mern-${id}-progress`)) || []
    return stored.filter(Boolean).length
  } catch {
    return 0
  }
}

export default function Home() {
  const navigate = useNavigate()

  const progress = TECHS.map(t => ({
    ...t,
    completed: readProgress(t.id, t.topics.length),
    total: t.topics.length,
  }))

  const totalTopics    = progress.reduce((s, t) => s + t.total, 0)
  const totalCompleted = progress.reduce((s, t) => s + t.completed, 0)
  const overallPct     = Math.round((totalCompleted / totalTopics) * 100)

  return (
    <div className="page">
      <h1>MERN Learning Hub</h1>
      <p className="subtitle">Track your progress across the full stack.</p>

      <div className="card overview-card">
        <div className="overview-stats">
          <div>
            <p className="ov-value">{totalCompleted}</p>
            <p className="ov-label">Completed</p>
          </div>
          <div>
            <p className="ov-value">{totalTopics - totalCompleted}</p>
            <p className="ov-label">Remaining</p>
          </div>
          <div>
            <p className="ov-value">{overallPct}%</p>
            <p className="ov-label">Overall</p>
          </div>
        </div>
        <div className="progress-wrap">
          <div className="progress-bar" style={{ width: `${overallPct}%`, background: 'var(--accent)' }} />
        </div>
      </div>

      <div className="tech-grid">
        {progress.map(tech => {
          const pct = Math.round((tech.completed / tech.total) * 100)
          return (
            <div
              key={tech.id}
              className="tech-card"
              onClick={() => navigate(`/${tech.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/${tech.id}`)}
            >
              <div className="tech-card-stripe" style={{ background: tech.color }} />
              <h2>{tech.label}</h2>
              <p>{tech.description}</p>
              <div className="progress-wrap" style={{ marginTop: 16 }}>
                <div className="progress-bar" style={{ width: `${pct}%`, background: tech.color }} />
              </div>
              <p className="progress-text">{tech.completed} / {tech.total} topics · {pct}%</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
