# AGENTS.md

This file provides guidance to AI coding agents working in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build — check for errors before marking a task done
npm run lint      # ESLint (React Hooks + React Refresh rules)
npm run preview   # Serve the production build locally
```

Run `npm run build && npm run lint` to verify changes before finishing any task.

> **SSL note (this machine):** If npm fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, run `npm config set strict-ssl false` once to fix it.

## Project overview

React 19 + Vite 8 + React Router 7 MERN stack learning dashboard. Navigation is URL-driven via `<BrowserRouter>`. No external UI library; styles are plain CSS with custom properties.

## File structure

```
src/
├── data/
│   ├── mernData.js        # TECHS array — topics + resources for each tech
│   └── interviewData.js   # INTERVIEW_QA array — 20 Q&A (5 per tech)
├── hooks/
│   └── useLocalStorage.js # useState wrapper that syncs to localStorage
├── components/
│   └── Sidebar.jsx        # <NavLink> list; active class applied by React Router
├── pages/
│   ├── Home.jsx           # Progress overview + clickable tech cards    (/)
│   ├── LearnPage.jsx      # Reusable: checklist + resources (reads TECHS by id)
│   ├── MongoDB.jsx        # Renders <LearnPage id="mongodb" />          (/mongodb)
│   ├── Express.jsx        # Renders <LearnPage id="express" />          (/express)
│   ├── ReactPage.jsx      # Renders <LearnPage id="react" />            (/react)
│   ├── NodePage.jsx       # Renders <LearnPage id="node" />             (/node)
│   ├── Notes.jsx          # Multi-note editor, persisted to localStorage (/notes)
│   └── Interview.jsx      # Filterable accordion Q&A                    (/interview)
├── App.jsx                # Layout shell + <Routes> definitions
├── App.css                # All component-level styles
└── index.css              # Global reset + CSS custom properties (light/dark theme)
```

## Key conventions

- **Routing:** `<BrowserRouter>` in `main.jsx`. Routes defined in `App.jsx` via `<Route>`. To add a page: create the component, add a `<Route>` in `App.jsx`, and add a `{ to, label }` entry to `NAV` in `Sidebar.jsx`.
- **Data:** Topic/resource content lives in `src/data/mernData.js`. Interview content lives in `src/data/interviewData.js`. Edit data there — do not hard-code content in page components.
- **Persistence:** Use `useLocalStorage(key, initial)` from `src/hooks/useLocalStorage.js` instead of `useState` when state should survive page reloads. Progress keys follow the pattern `mern-{techId}-progress`.
- **Styles:** All CSS lives in `App.css`. New components do not get their own CSS file. CSS variables are defined in `index.css :root`.
- **No TypeScript** — use `.jsx` for all component files.
