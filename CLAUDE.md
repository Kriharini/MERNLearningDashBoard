# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build (outputs to dist/)
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

> **Note:** If you see `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, run `npm config set strict-ssl false` first.

## Architecture

React 19 + Vite 8 + React Router 7 + react-markdown MERN stack learning dashboard. No external UI library or CSS framework; all styles are plain CSS using custom properties defined in `src/index.css`.

**Entry point:** `src/main.jsx` → `<BrowserRouter>` → `src/App.jsx`

### Navigation flow

`main.jsx` wraps the app in `<BrowserRouter>`. `App.jsx` renders `<Sidebar>` + `<Routes>` side-by-side. `Sidebar.jsx` uses `<NavLink>` which applies the `active` class automatically based on the current URL.

```
src/
├── data/
│   ├── mernData.js           # TECHS array — topics, resources, and content per tech
│   ├── interviewData.js      # 20 MERN interview Q&A (5 per tech)
│   └── content/
│       ├── mongodb.md        # Topic content for MongoDB (8 sections)
│       ├── express.md        # Topic content for Express (8 sections)
│       ├── react.md          # Topic content for React (8 sections)
│       └── node.md           # Topic content for Node.js (8 sections)
├── hooks/
│   └── useLocalStorage.js    # useState wrapper that persists to localStorage
├── components/
│   └── Sidebar.jsx           # <NavLink> list with tech color dots
├── pages/
│   ├── Home.jsx              # Overview: overall progress + tech cards  (/)
│   ├── LearnPage.jsx         # Reusable topic checklist + expandable content
│   ├── MongoDB.jsx           # <LearnPage id="mongodb" />              (/mongodb)
│   ├── Express.jsx           # <LearnPage id="express" />              (/express)
│   ├── ReactPage.jsx         # <LearnPage id="react" />                (/react)
│   ├── NodePage.jsx          # <LearnPage id="node" />                 (/node)
│   ├── Notes.jsx             # Multi-note editor, auto-saved           (/notes)
│   └── Interview.jsx         # Filterable accordion Q&A                (/interview)
├── App.jsx                   # Layout shell + <Routes> definitions
├── App.css                   # All component styles
└── index.css                 # CSS custom properties + global reset
```

### Data & persistence

- **`src/data/mernData.js`** — `TECHS` array; each entry has `id`, `label`, `color`, `description`, `topics[]`, `content` (raw markdown string imported via `?raw`), and `resources[]`. Adding a topic here automatically reflects in `LearnPage` and the `Home` progress cards.
- **`src/data/content/*.md`** — imported via Vite's built-in `?raw` suffix (no plugin needed). Each file has one `## Heading` per topic whose text matches the topic string exactly. `LearnPage` splits on `^## ` at runtime to build a `{ topicTitle → body }` map and renders it with `react-markdown`.
- **`src/data/interviewData.js`** — `INTERVIEW_QA` array; each entry has `category` (`mongodb` | `express` | `react` | `node`), `question`, `answer`.
- **`useLocalStorage(key, initial)`** — drop-in replacement for `useState` that syncs to `localStorage`. Progress keys: `mern-{id}-progress` (boolean array). Notes key: `mern-notes`.

### Styling conventions

- CSS custom properties live in `index.css` under `:root` (light) and `@media (prefers-color-scheme: dark)`.
- Sidebar uses a hardcoded dark background (`#1e1e2e`) independent of the theme.
- All component styles live in `App.css`; no per-component CSS files.

### Adding a new page

1. Create `src/pages/NewPage.jsx`
2. Add `<Route path="/new-page" element={<NewPage />} />` in `App.jsx`
3. Add `{ to: '/new-page', label: 'New Page' }` to the `NAV` array in `Sidebar.jsx`

### Adding a new MERN tech tab

1. Add an entry to `TECHS` in `src/data/mernData.js`
2. Create `src/data/content/newtech.md` with `## Topic Name` sections matching each topic string
3. Import it in `mernData.js` with `import newtechContent from './content/newtech.md?raw'` and add `content: newtechContent` to the entry
4. Create `src/pages/NewTech.jsx` that renders `<LearnPage id="new-tech" />`
5. Add the route and `NAV` entry (same as above)

### Adding content for a topic

Edit the relevant `src/data/content/<tech>.md` file. The `## Heading` must match the topic string in `mernData.js` exactly (case-sensitive). Supports standard Markdown: headings, lists, bold, inline code, and fenced code blocks.
