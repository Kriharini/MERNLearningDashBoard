import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const DEFAULT_NOTES = [
  { id: 1, title: 'MERN Overview', content: 'MongoDB + Express + React + Node.js\n\nMongoDB → stores data as documents\nExpress → handles HTTP routing\nReact → builds the UI\nNode.js → runs JS on the server' },
]

export default function Notes() {
  const [notes, setNotes] = useLocalStorage('mern-notes', DEFAULT_NOTES)
  const [activeId, setActiveId] = useState(notes[0]?.id ?? null)

  const active = notes.find(n => n.id === activeId)

  const addNote = () => {
    const note = { id: Date.now(), title: 'New Note', content: '' }
    const next = [...notes, note]
    setNotes(next)
    setActiveId(note.id)
  }

  const updateNote = (field, value) =>
    setNotes(notes.map(n => n.id === activeId ? { ...n, [field]: value } : n))

  const deleteNote = id => {
    const remaining = notes.filter(n => n.id !== id)
    setNotes(remaining)
    if (activeId === id) setActiveId(remaining[0]?.id ?? null)
  }

  return (
    <div className="page notes-page">
      <h1>Notes</h1>
      <p className="subtitle">Save your learning notes — auto-saved to your browser.</p>

      <div className="notes-layout">
        <aside className="notes-sidebar">
          <button className="btn-add-note" onClick={addNote}>+ New Note</button>
          <ul className="notes-list">
            {notes.map(n => (
              <li
                key={n.id}
                className={`note-item${n.id === activeId ? ' active' : ''}`}
                onClick={() => setActiveId(n.id)}
              >
                <span className="note-item-title">{n.title || 'Untitled'}</span>
                <button
                  className="note-delete-btn"
                  onClick={e => { e.stopPropagation(); deleteNote(n.id) }}
                  aria-label="Delete note"
                >
                  ×
                </button>
              </li>
            ))}
            {notes.length === 0 && (
              <li className="notes-empty-hint">No notes yet.</li>
            )}
          </ul>
        </aside>

        <div className="notes-editor">
          {active ? (
            <>
              <input
                className="note-title-input"
                value={active.title}
                onChange={e => updateNote('title', e.target.value)}
                placeholder="Note title"
              />
              <textarea
                className="note-content-input"
                value={active.content}
                onChange={e => updateNote('content', e.target.value)}
                placeholder="Start writing..."
              />
            </>
          ) : (
            <p className="notes-empty">Click &ldquo;+ New Note&rdquo; to get started.</p>
          )}
        </div>
      </div>
    </div>
  )
}
