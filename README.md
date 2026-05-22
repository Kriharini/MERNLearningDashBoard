# MERN Learning Dashboard

A personal learning tracker for the MERN stack — MongoDB, Express, React, and Node.js.

## Features

- **Topic checklists** — track progress through 8 topics per technology with a visual progress bar
- **Expandable content** — click any topic to read a concise explanation with code examples (rendered from Markdown)
- **Interview prep** — 20 Q&A cards filterable by technology
- **Notes editor** — multi-note editor with auto-save to localStorage
- **Light / dark mode** — follows system preference via `prefers-color-scheme`
- **Progress persistence** — all progress saved to localStorage, survives page reloads

## Tech stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI |
| Vite | 8 | Build tool & dev server |
| React Router | 7 | Client-side routing |
| react-markdown | 9 | Render topic content from `.md` files |

No backend. No database. Frontend-only.

## Getting started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev       # http://localhost:5173

# Production build
npm run build

# Preview production build
npm run preview
```

> **Windows / SSL note:** If you see `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, run `npm config set strict-ssl false` first.

## Project structure

```
src/
├── data/
│   ├── mernData.js        # Topic metadata and resource links
│   ├── interviewData.js   # Interview Q&A
│   └── content/           # Markdown files — one per tech
│       ├── mongodb.md
│       ├── express.md
│       ├── react.md
│       └── node.md
├── hooks/
│   └── useLocalStorage.js # Persistent state hook
├── components/
│   └── Sidebar.jsx
├── pages/
│   ├── Home.jsx
│   ├── LearnPage.jsx      # Shared checklist + content viewer
│   ├── Notes.jsx
│   └── Interview.jsx
├── App.jsx
├── App.css                # All component styles
└── index.css              # CSS variables + global reset
```

## Adding topic content

Edit `src/data/content/<tech>.md`. Each `## Heading` must match the topic string in `mernData.js` exactly — that's how `LearnPage` maps content to the right topic.

## License

MIT
