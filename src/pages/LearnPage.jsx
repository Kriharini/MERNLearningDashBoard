import { useState, useMemo } from 'react'
import Markdown from 'react-markdown'
import { TECHS } from '../data/mernData'
import { useLocalStorage } from '../hooks/useLocalStorage'

function parseTopicContent(raw) {
  const map = {}
  if (!raw) return map
  const sections = raw.split(/^## /m).filter(s => s.trim())
  for (const section of sections) {
    const nl = section.indexOf('\n')
    if (nl === -1) continue
    const heading = section.slice(0, nl).trim()
    const body    = section.slice(nl + 1).trim()
    if (heading && body) map[heading] = body
  }
  return map
}

export default function LearnPage({ id }) {
  const tech = TECHS.find(t => t.id === id)
  const { label, color, description, topics, resources, content } = tech

  const [checked, setChecked] = useLocalStorage(
    `mern-${id}-progress`,
    new Array(topics.length).fill(false)
  )
  const [expanded, setExpanded] = useState(null)

  const safeChecked  = topics.map((_, i) => !!checked[i])
  const contentMap   = useMemo(() => parseTopicContent(content), [content])

  const toggle = i => {
    const next = [...safeChecked]
    next[i] = !next[i]
    setChecked(next)
  }

  const toggleExpand = i => setExpanded(expanded === i ? null : i)

  const completed = safeChecked.filter(Boolean).length
  const pct = Math.round((completed / topics.length) * 100)

  return (
    <div className="page">
      <div className="learn-header" style={{ borderLeftColor: color }}>
        <h1>{label}</h1>
        <p className="subtitle">{description}</p>
        <div className="progress-wrap">
          <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
        </div>
        <p className="progress-text">{completed} / {topics.length} topics completed · {pct}%</p>
      </div>

      <div className="card">
        <h2>Topics</h2>
        <ul className="topics-list">
          {topics.map((topic, i) => (
            <li key={i} className={`topic-item${safeChecked[i] ? ' done' : ''}`}>
              <div className="topic-item-row">
                <label>
                  <input
                    type="checkbox"
                    checked={safeChecked[i]}
                    onChange={() => toggle(i)}
                  />
                  <span>{topic}</span>
                </label>
                {contentMap[topic] && (
                  <button
                    className="topic-expand-btn"
                    onClick={() => toggleExpand(i)}
                    aria-label={expanded === i ? 'Collapse' : 'Expand'}
                  >
                    {expanded === i ? '▲' : '▼'}
                  </button>
                )}
              </div>
              {expanded === i && contentMap[topic] && (
                <div className="topic-content">
                  <Markdown>{contentMap[topic]}</Markdown>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>Resources</h2>
        <ul className="resources-list">
          {resources.map(r => (
            <li key={r.label}>
              <a href={r.url} target="_blank" rel="noreferrer">{r.label} →</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
