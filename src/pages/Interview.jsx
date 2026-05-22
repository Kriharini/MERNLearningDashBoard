import { useState } from 'react'
import { INTERVIEW_QA } from '../data/interviewData'

const CATEGORIES = ['all', 'mongodb', 'express', 'react', 'node']

const LABELS = { all: 'All', mongodb: 'MongoDB', express: 'Express', react: 'React', node: 'Node.js' }

export default function Interview() {
  const [filter, setFilter] = useState('all')
  const [open, setOpen]     = useState(null)

  const filtered = filter === 'all'
    ? INTERVIEW_QA
    : INTERVIEW_QA.filter(q => q.category === filter)

  const toggle = i => setOpen(open === i ? null : i)

  return (
    <div className="page">
      <h1>Interview Questions</h1>
      <p className="subtitle">Common MERN stack interview Q&amp;A — click a question to reveal the answer.</p>

      <div className="filter-tabs">
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`filter-tab${filter === c ? ' active' : ''}`}
            onClick={() => { setFilter(c); setOpen(null) }}
          >
            {LABELS[c]}
          </button>
        ))}
      </div>

      <div className="accordion">
        {filtered.map((q, i) => (
          <div key={i} className={`accordion-item${open === i ? ' open' : ''}`}>
            <button className="accordion-trigger" onClick={() => toggle(i)}>
              <span>{q.question}</span>
              <span className="accordion-icon">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && (
              <div className="accordion-content">
                <p>{q.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
