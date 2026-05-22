## JSX & Component Basics

JSX is a syntax extension that lets you write HTML-like markup inside JavaScript. React transforms it into `React.createElement()` calls at build time.

**JSX rules:**
- Return a single root element — wrap siblings in `<>...</>` (Fragment)
- Use `className` instead of `class`, `htmlFor` instead of `for`
- Self-close empty tags: `<img />`, `<br />`
- Expressions go in `{}`: `<h1>{user.name}</h1>`
- JavaScript, not HTML — `style` takes an object: `style={{ color: 'red' }}`

**Function component:**
```jsx
function Greeting({ name, age }) {
  return (
    <div className="card">
      <h1>Hello, {name}!</h1>
      {age >= 18 && <p>You are an adult.</p>}
    </div>
  )
}
```

**Rendering lists:**
```jsx
const items = ['Apple', 'Banana', 'Cherry']

<ul>
  {items.map((item, i) => (
    <li key={i}>{item}</li>  // key must be unique and stable
  ))}
</ul>
```

**Key rule:** `key` props help React identify which items changed. Use a unique, stable ID from your data — not the array index when the list can reorder.

## Props & State

**Props** are inputs passed from parent to child — they are read-only inside the child.  
**State** is local, mutable data managed inside a component that triggers a re-render when it changes.

**Props:**
```jsx
// Parent passes props
<Button label="Submit" disabled={false} onClick={handleClick} />

// Child receives and uses them
function Button({ label, disabled, onClick }) {
  return <button disabled={disabled} onClick={onClick}>{label}</button>
}
```

**Lifting state up** — when two sibling components need to share state, move it to their closest common parent and pass it down as props:
```jsx
function Parent() {
  const [count, setCount] = useState(0)
  return (
    <>
      <Display count={count} />
      <Controls onIncrement={() => setCount(c => c + 1)} />
    </>
  )
}
```

**Rules of props:**
- Never mutate props — treat them as read-only
- Props can be any value: string, number, object, array, function, JSX
- Use default values: `function Btn({ size = 'md' })`

## useState & useEffect Hooks

Hooks let function components use React features. The two most fundamental are `useState` (local state) and `useEffect` (side effects).

**useState:**
```jsx
const [count, setCount] = useState(0)

// Always use the setter — never mutate state directly
setCount(count + 1)          // direct value
setCount(prev => prev + 1)   // updater function (safer for async/batched updates)

// Objects — spread to avoid mutating state
setUser(prev => ({ ...prev, name: 'Alice' }))
```

**useEffect:**
```jsx
useEffect(() => {
  // runs after render
  fetchData().then(setData)

  return () => {
    // cleanup — runs before next effect and on unmount
    subscription.unsubscribe()
  }
}, [dependency]) // re-runs when dependency changes
```

**Dependency array patterns:**
- `[]` — run once on mount (like `componentDidMount`)
- `[value]` — run when `value` changes
- *(omitted)* — run after every render (usually wrong)

**Common useEffect uses:** data fetching, subscriptions, timers, DOM manipulation, syncing with external stores.

## React Router for Navigation

React Router enables client-side navigation without page reloads. In v7 (used in this project) the core API is `<BrowserRouter>`, `<Routes>`, `<Route>`, and `<Link>`.

**Setup:**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/about"   element={<About />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="*"        element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Navigation:**
```jsx
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'

// Declarative links
<Link to="/about">About</Link>
<NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About</NavLink>

// Programmatic navigation
const navigate = useNavigate()
navigate('/dashboard')
navigate(-1)  // go back

// Read URL params
const { id } = useParams()  // from path="/users/:id"
```

**Nested routes** — render child routes inside a parent layout:
```jsx
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<Overview />} />
  <Route path="settings" element={<Settings />} />
</Route>
// DashboardLayout renders <Outlet /> where children appear
```

## Context API

Context provides a way to share data across the component tree without passing props at every level (prop drilling).

**Creating and providing context:**
```jsx
import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext(null)

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

**Consuming context:**
```jsx
function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext)
  return (
    <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  )
}
```

**Wrap your app (or a subtree):**
```jsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

**When to use Context vs props:**
- Context: theme, current user, language/locale, auth state — truly global data
- Props: most other things — keeps components explicit and reusable
- Context is not a state management replacement (consider Zustand or Redux for complex state)

**Performance note:** every component that calls `useContext` re-renders when the context value changes. Split contexts by update frequency to minimize re-renders.

## Custom Hooks

Custom hooks let you extract and reuse stateful logic. Any function that starts with `use` and calls built-in hooks is a custom hook.

**Example — `useFetch`:**
```jsx
function useFetch(url) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(url)
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [url])

  return { data, loading, error }
}

// Usage
function Posts() {
  const { data, loading, error } = useFetch('/api/posts')
  if (loading) return <p>Loading…</p>
  if (error)   return <p>Error: {error.message}</p>
  return <ul>{data.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

**Benefits:**
- Share logic between components without changing their structure
- Keeps components lean — business logic lives in the hook
- Easy to test in isolation

**Other common custom hooks:** `useLocalStorage`, `useDebounce`, `useOnClickOutside`, `useWindowSize`, `usePrevious`.

**Rules of Hooks** (apply to custom hooks too):
- Only call hooks at the top level — never inside conditions, loops, or nested functions
- Only call hooks from React functions (components or other custom hooks)

## Performance Optimization

React re-renders a component whenever its state or props change. For most apps this is fast enough, but large trees or expensive computations may need optimization.

**`React.memo` — skip re-render if props haven't changed:**
```jsx
const ExpensiveList = React.memo(function ExpensiveList({ items }) {
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
})
```

**`useMemo` — cache an expensive computation:**
```jsx
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]  // recompute only when items changes
)
```

**`useCallback` — stable function reference (prevents child re-renders):**
```jsx
const handleDelete = useCallback((id) => {
  setItems(prev => prev.filter(i => i.id !== id))
}, [])  // empty deps — function never changes
```

**Code splitting with lazy loading:**
```jsx
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))

<Suspense fallback={<p>Loading chart…</p>}>
  <HeavyChart />
</Suspense>
```

**Practical advice:**
- Profile first with React DevTools Profiler before optimizing
- `React.memo` is only useful when the child is actually expensive to render
- Overusing `useMemo`/`useCallback` adds complexity without benefit for cheap operations

## Forms & Controlled Components

A **controlled component** is an input whose value is driven by React state, making the component the single source of truth.

**Controlled input:**
```jsx
function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()  // prevent page reload
    console.log(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email"    value={form.email}    onChange={handleChange} type="email" />
      <input name="password" value={form.password} onChange={handleChange} type="password" />
      <button type="submit">Login</button>
    </form>
  )
}
```

**Checkboxes and selects:**
```jsx
// Checkbox — use checked, not value
<input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
// In handler: value = e.target.type === 'checkbox' ? e.target.checked : e.target.value

// Select
<select name="role" value={form.role} onChange={handleChange}>
  <option value="user">User</option>
  <option value="admin">Admin</option>
</select>
```

**Uncontrolled inputs** use `ref` instead of state — useful for file inputs or when integrating with non-React code:
```jsx
const fileRef = useRef()
<input type="file" ref={fileRef} />
// Access: fileRef.current.files[0]
```

For complex forms with validation consider libraries like **React Hook Form** (minimal re-renders) or **Formik**.
