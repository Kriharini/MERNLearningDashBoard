import { useState, useMemo, useEffect, useRef } from 'react'
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
  const [expanded,   setExpanded]   = useState(null)
  const [askInput,   setAskInput]   = useState('')
  const [askLoading, setAskLoading] = useState(false)
  const [askAnswer,  setAskAnswer]  = useState(null)
  const [askError,   setAskError]   = useState(null)
  const inputRef = useRef(null)

  const safeChecked = topics.map((_, i) => !!checked[i])
  const contentMap  = useMemo(() => parseTopicContent(content), [content])

  // Reset Ask AI state when a different topic is opened
  useEffect(() => {
    setAskInput('')
    setAskAnswer(null)
    setAskError(null)
  }, [expanded])

  // Focus input when topic expands
  useEffect(() => {
    if (expanded !== null && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [expanded])

  const toggle = i => {
    const next = [...safeChecked]
    next[i] = !next[i]
    setChecked(next)
  }

  const toggleExpand = i => setExpanded(expanded === i ? null : i)

  const handleAsk = async (topic) => {
    if (!askInput.trim() || askLoading) return
    setAskLoading(true)
    setAskAnswer(null)
    setAskError(null)
    try {
      const res = await fetch('http://localhost:3001/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: askInput, topic, tech: label })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAskAnswer(data.answer)
    } catch (err) {
      setAskError(err.message || 'Something went wrong. Is the server running?')
    } finally {
      setAskLoading(false)
    }
  }

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

                  <div className="ask-ai">
                    <p className="ask-ai-label">Ask AI about this topic</p>
                    <div className="ask-ai-row">
                      <input
                        ref={inputRef}
                        className="ask-ai-input"
                        type="text"
                        placeholder={`Ask anything about ${topic}…`}
                        value={askInput}
                        onChange={e => setAskInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAsk(topic)}
                        disabled={askLoading}
                      />
                      <button
                        className="ask-ai-btn"
                        onClick={() => handleAsk(topic)}
                        disabled={askLoading || !askInput.trim()}
                        style={{ background: color }}
                      >
                        {askLoading ? '…' : 'Ask'}
                      </button>
                    </div>
                    {askError && <p className="ask-ai-error">{askError}</p>}
                    {askAnswer && (
                      <div className="ask-ai-answer">
                        <Markdown>{askAnswer}</Markdown>
                      </div>
                    )}
                  </div>
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
