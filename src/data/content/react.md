## JSX & Component Basics

JSX is a syntax extension that lets you write HTML-like markup inside JavaScript. Babel/Vite transforms it into `React.createElement()` calls at build time.

**JSX rules:**
- Return a single root element — wrap siblings in `<>...</>` (Fragment) to avoid adding extra DOM nodes
- Use `className` instead of `class`, `htmlFor` instead of `for`
- Self-close empty tags: `<img />`, `<input />`, `<br />`
- Embed any JavaScript expression in `{}`: `<h1>{user.name.toUpperCase()}</h1>`
- `style` takes an object, not a string: `style={{ color: 'red', fontSize: 16 }}`

**Function component:**
```jsx
function UserCard({ name, role, avatar }) {
  return (
    <div className="card">
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{role}</p>
    </div>
  )
}
```

**Conditional rendering:**
```jsx
// Short-circuit (renders nothing when false)
{isLoggedIn && <Dashboard />}

// Ternary
{isLoggedIn ? <Dashboard /> : <Login />}

// Early return
if (loading) return <Spinner />
```

**Rendering lists — key is required:**
```jsx
{users.map(user => (
  <UserCard key={user.id} name={user.name} role={user.role} />
))}
```

Use a stable, unique ID from your data as `key` — not the array index when the list can reorder, filter, or insert items. Wrong keys cause React to misidentify elements and produce bugs.

## Props & State

**Props** flow down from parent to child — they are read-only inside the child.  
**State** is local, mutable data owned by a component that triggers a re-render when updated.

**Passing and receiving props:**
```jsx
// Parent
<Button label="Submit" variant="primary" onClick={handleSubmit} disabled={loading} />

// Child
function Button({ label, variant = 'default', onClick, disabled }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}
```

**Special props:**
```jsx
// children — anything between opening and closing tags
function Card({ children, title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  )
}

// Usage
<Card title="Profile">
  <p>Hello world</p>
</Card>
```

**Lifting state up** — when siblings need to share state, move it to their nearest common parent:
```jsx
function Parent() {
  const [query, setQuery] = useState('')
  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <ResultsList query={query} />
    </>
  )
}
```

**Props vs State decision guide:**
- Does it come from a parent? → Prop
- Does it change over time and trigger re-render? → State
- Can you compute it from existing props/state? → Derived value (no need for state)

## useState & useEffect Hooks

**useState** — declare state in a function component:
```jsx
const [count, setCount]   = useState(0)
const [user,  setUser]    = useState(null)
const [items, setItems]   = useState([])
const [form,  setForm]    = useState({ name: '', email: '' })
```

**Updater function** — use when new state depends on old state:
```jsx
// Safe for batched/async updates
setCount(prev => prev + 1)

// Updating objects — always spread, never mutate directly
setForm(prev => ({ ...prev, email: 'new@example.com' }))

// Updating arrays
setItems(prev => [...prev, newItem])                    // add
setItems(prev => prev.filter(i => i.id !== targetId))  // remove
setItems(prev => prev.map(i => i.id === id ? { ...i, done: true } : i)) // update
```

**useEffect** — sync with the outside world (fetch, subscriptions, timers, DOM):
```jsx
useEffect(() => {
  // setup
  const controller = new AbortController()
  
  fetch(`/api/users/${id}`, { signal: controller.signal })
    .then(r => r.json())
    .then(setUser)
    .catch(err => { if (err.name !== 'AbortError') setError(err) })

  // cleanup — runs before next effect and on unmount
  return () => controller.abort()
}, [id]) // re-run when id changes
```

**Dependency array rules:**
| Array | Behaviour |
|---|---|
| `[]` | Run once after first render (mount) |
| `[a, b]` | Run when `a` or `b` changes |
| *(omitted)* | Run after every render — almost always wrong |

**Common mistake — stale closure:**
```jsx
// Bug: count is stale inside the interval
useEffect(() => {
  const id = setInterval(() => console.log(count), 1000)
  return () => clearInterval(id)
}, []) // missing count in deps

// Fix: use updater function or add count to deps
setCount(prev => prev + 1)
```

## useRef & useReducer

### useRef

`useRef` returns a mutable object `{ current: value }`. Mutating `.current` does **not** trigger a re-render.

**Two main uses:**

**1. Access a DOM node:**
```jsx
function AutoFocusInput() {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  return <input ref={inputRef} placeholder="I auto-focus" />
}
```

**2. Store a mutable value that persists across renders (like an instance variable):**
```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef(null)

  const start = () => {
    intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }
  const stop = () => clearInterval(intervalRef.current)

  return <> <button onClick={start}>Start</button> <button onClick={stop}>Stop</button> </>
}
```

### useReducer

`useReducer` is better than `useState` when state has multiple sub-values or the next state depends on complex logic.

```jsx
const initialState = { count: 0, step: 1 }

function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { ...state, count: state.count + state.step }
    case 'decrement': return { ...state, count: state.count - state.step }
    case 'setStep':   return { ...state, step: action.payload }
    case 'reset':     return initialState
    default:          throw new Error(`Unknown action: ${action.type}`)
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>−</button>
      <input
        type="number"
        value={state.step}
        onChange={e => dispatch({ type: 'setStep', payload: Number(e.target.value) })}
      />
    </>
  )
}
```

**When to prefer `useReducer` over `useState`:**
- State has 3+ related fields that change together
- Next state depends on previous in complex ways
- You want the update logic testable outside the component

## React Router for Navigation

React Router enables client-side navigation without full page reloads. This project uses v7.

**Setup:**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/users"     element={<UserList />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="*"          element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Navigation components:**
```jsx
import { Link, NavLink } from 'react-router-dom'

// Basic link
<Link to="/users">Users</Link>

// NavLink — adds active class automatically
<NavLink to="/users" className={({ isActive }) => isActive ? 'nav active' : 'nav'}>
  Users
</NavLink>
```

**Hooks:**
```jsx
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom'

// Programmatic navigation
const navigate = useNavigate()
navigate('/dashboard')           // push
navigate(-1)                     // go back
navigate('/login', { replace: true }) // replace (no back history)

// Route params — from path="/users/:id"
const { id } = useParams()

// Query string — /search?q=react&page=2
const [searchParams, setSearchParams] = useSearchParams()
const query = searchParams.get('q')

// Current location
const location = useLocation()  // { pathname, search, hash, state }
```

**Nested routes with layouts:**
```jsx
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index       element={<Overview />} />
  <Route path="stats" element={<Stats />} />
</Route>

// DashboardLayout.jsx — renders children at <Outlet />
import { Outlet } from 'react-router-dom'
function DashboardLayout() {
  return <div><Sidebar /><main><Outlet /></main></div>
}
```

**Protected route pattern:**
```jsx
function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

<Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
```

## Context API

Context lets you share data across the component tree without passing props at every level (avoiding "prop drilling").

**Create → Provide → Consume:**

```jsx
// 1. Create
import { createContext, useContext, useState } from 'react'
const AuthContext = createContext(null)

// 2. Custom hook — cleaner consumer API + error guard
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

// 3. Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login  = async (email, password) => { /* ... */ setUser(data) }
  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 4. Wrap your app
<AuthProvider><App /></AuthProvider>

// 5. Consume anywhere in the tree
function NavBar() {
  const { user, logout } = useAuth()
  return <button onClick={logout}>{user?.name}</button>
}
```

**Performance — context re-renders every consumer when value changes:**
```jsx
// Memoize value to avoid unnecessary re-renders
const value = useMemo(() => ({ user, login, logout }), [user])
<AuthContext.Provider value={value}>
```

**Split contexts by update frequency:**
```jsx
// Fast-changing UI state and slow-changing user data in separate contexts
<ThemeProvider>      {/* changes rarely */}
  <UserProvider>     {/* changes on login/logout */}
    <App />
  </UserProvider>
</ThemeProvider>
```

**When NOT to use Context:** don't reach for it for every shared state. For frequently-updating values (e.g. mouse position, form state), consider Zustand or other state managers.

## Custom Hooks

A custom hook is a function starting with `use` that calls other hooks. It lets you extract and share stateful logic without changing component structure.

**`useFetch` — data fetching:**
```jsx
function useFetch(url) {
  const [state, dispatch] = useReducer(
    (s, a) => ({ ...s, ...a }),
    { data: null, loading: true, error: null }
  )

  useEffect(() => {
    let cancelled = false
    dispatch({ loading: true, error: null })

    fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then(data => { if (!cancelled) dispatch({ data, loading: false }) })
      .catch(error => { if (!cancelled) dispatch({ error, loading: false }) })

    return () => { cancelled = true }
  }, [url])

  return state
}
```

**`useDebounce` — delay a rapidly-changing value:**
```jsx
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// Usage — only triggers search API after user stops typing 300ms
const debouncedQuery = useDebounce(query)
useEffect(() => { search(debouncedQuery) }, [debouncedQuery])
```

**`useLocalStorage` — persistent state:**
```jsx
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial }
    catch { return initial }
  })
  const set = v => { setValue(v); localStorage.setItem(key, JSON.stringify(v)) }
  return [value, set]
}
```

**Rules of Hooks** (apply to custom hooks too):
- Only call hooks at the **top level** — never inside conditions, loops, or nested functions
- Only call hooks from **React functions** (components or custom hooks)

## Component Lifecycle & Reconciliation

**Lifecycle in function components maps to hooks:**

| Class lifecycle | Hook equivalent |
|---|---|
| `componentDidMount` | `useEffect(() => { ... }, [])` |
| `componentDidUpdate` | `useEffect(() => { ... }, [dep])` |
| `componentWillUnmount` | `useEffect(() => { return () => cleanup() }, [])` |
| `shouldComponentUpdate` | `React.memo` |

**The Reconciliation process:**

React keeps a virtual DOM — a lightweight JS copy of the real DOM. On each render:
1. React runs your component function and builds a new virtual DOM tree
2. It **diffs** the new tree against the previous one (reconciliation)
3. It computes the minimal set of real DOM changes needed
4. It applies only those changes (commit phase)

**The `key` prop and reconciliation:**
```jsx
// Without key — React reuses the same input element when list changes
// causing stale values in uncontrolled inputs
{users.map(u => <input defaultValue={u.name} />)}  // Bug!

// With key — React destroys and recreates the element when key changes
{users.map(u => <input key={u.id} defaultValue={u.name} />)}  // Correct
```

**Render phases:**
- **Render phase** (pure, may be interrupted): React calls your component function
- **Commit phase** (synchronous, DOM is updated): `useLayoutEffect` runs here
- **After paint**: `useEffect` runs here

**`useLayoutEffect`** — like `useEffect` but fires synchronously after DOM mutations, before the browser paints. Use it to read DOM measurements (e.g. element size) to avoid visual flicker:
```jsx
useLayoutEffect(() => {
  const { height } = ref.current.getBoundingClientRect()
  setHeight(height)  // applied before paint — no flicker
}, [])
```

**Strict Mode** — in development, React intentionally double-invokes render functions and effects to surface bugs from impure renders or missing cleanups:
```jsx
<React.StrictMode><App /></React.StrictMode>
```

## Performance Optimization

**The golden rule:** profile first with React DevTools Profiler, then optimize. Premature optimization adds complexity for no gain.

**`React.memo` — skip re-render when props are unchanged:**
```jsx
const UserRow = React.memo(function UserRow({ user, onDelete }) {
  console.log('rendered:', user.name)
  return <li>{user.name} <button onClick={() => onDelete(user.id)}>×</button></li>
})
// Only re-renders if user or onDelete reference changes
```

**`useCallback` — stable function reference:**
```jsx
// Without useCallback, handleDelete is a new function on every render
// causing UserRow to re-render even with React.memo
const handleDelete = useCallback((id) => {
  setUsers(prev => prev.filter(u => u.id !== id))
}, []) // no deps — function never changes
```

**`useMemo` — cache expensive computation:**
```jsx
const filteredUsers = useMemo(
  () => users.filter(u => u.name.toLowerCase().includes(query.toLowerCase())),
  [users, query]  // recompute only when users or query changes
)
```

**Code splitting — lazy load heavy components:**
```jsx
import { lazy, Suspense } from 'react'

const HeavyChart   = lazy(() => import('./HeavyChart'))
const AdminPanel   = lazy(() => import('./AdminPanel'))

<Suspense fallback={<Spinner />}>
  <HeavyChart />
</Suspense>
```

**Virtualization — render only visible rows:**

For lists with thousands of items, use `react-window` or `react-virtual` to render only what's in the viewport. Rendering 10,000 `<li>` elements at once is a common performance killer.

**Avoid these common re-render causes:**
```jsx
// Bad — new object on every render defeats React.memo
<Component options={{ theme: 'dark' }} />

// Good — stable reference
const options = useMemo(() => ({ theme: 'dark' }), [])
<Component options={options} />
```

## Error Boundaries

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree and display a fallback UI instead of crashing the whole app.

**Error boundaries only work as class components** (no hook equivalent yet):
```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Log to an error reporting service (Sentry, Datadog, etc.)
    console.error('Caught by ErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h2>Something went wrong.</h2>
    }
    return this.props.children
  }
}
```

**Usage — wrap sections you want to isolate:**
```jsx
<ErrorBoundary fallback={<p>Chart failed to load.</p>}>
  <RevenueChart />
</ErrorBoundary>

<ErrorBoundary fallback={<p>Comments unavailable.</p>}>
  <CommentSection />
</ErrorBoundary>
```

**What error boundaries do NOT catch:**
- Errors in event handlers (use regular try/catch there)
- Async errors (`setTimeout`, `fetch` rejections)
- Errors in the boundary itself

**`react-error-boundary` package** — a well-maintained library that adds hooks and reset functionality:
```jsx
import { ErrorBoundary } from 'react-error-boundary'

function Fallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

<ErrorBoundary FallbackComponent={Fallback} onReset={() => refetch()}>
  <DataTable />
</ErrorBoundary>
```

## Forms & Controlled Components

A **controlled component** is an input whose value is driven by React state — React is the single source of truth.

**Controlled form pattern:**
```jsx
function RegisterForm() {
  const [form, setForm]     = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = ({ target: { name, value, type, checked } }) => {
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const validate = () => {
    const e = {}
    if (!form.name)                  e.name = 'Required'
    if (!/\S+@\S+/.test(form.email)) e.email = 'Invalid email'
    if (form.password.length < 8)    e.password = 'Min 8 characters'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) return setErrors(e2)

    setLoading(true)
    await registerUser(form)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name"     value={form.name}     onChange={handleChange} />
      {errors.name && <span>{errors.name}</span>}

      <input name="email"    value={form.email}    onChange={handleChange} type="email" />
      {errors.email && <span>{errors.email}</span>}

      <input name="password" value={form.password} onChange={handleChange} type="password" />
      {errors.password && <span>{errors.password}</span>}

      <button disabled={loading}>{loading ? 'Submitting…' : 'Register'}</button>
    </form>
  )
}
```

**Select, checkbox, textarea:**
```jsx
// Select
<select name="role" value={form.role} onChange={handleChange}>
  <option value="">Choose…</option>
  <option value="user">User</option>
  <option value="admin">Admin</option>
</select>

// Checkbox — use checked not value
<input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />

// Textarea — works like input
<textarea name="bio" value={form.bio} onChange={handleChange} rows={4} />
```

**Uncontrolled inputs** use `useRef` — useful for file inputs:
```jsx
const fileRef = useRef()
<input type="file" ref={fileRef} />
// Read: fileRef.current.files[0]
```

For complex forms consider **React Hook Form** — minimal re-renders, built-in validation, great DX.

## Component Patterns

Design patterns for building flexible, reusable React components.

### Higher-Order Component (HOC)

A function that takes a component and returns an enhanced version of it:
```jsx
function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" />
    return <Component {...props} user={user} />
  }
}

const ProtectedDashboard = withAuth(Dashboard)
```

### Render Props

Pass a function as a prop to share logic with flexible rendering:
```jsx
function MouseTracker({ render }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  return (
    <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>
      {render(pos)}
    </div>
  )
}

// Usage
<MouseTracker render={({ x, y }) => <p>Mouse: {x}, {y}</p>} />
```

> Modern alternative: extract to a custom hook (`useMousePosition`).

### Compound Components

Components that share implicit state and work together as a unit:
```jsx
const TabsContext = createContext(null)

function Tabs({ children, defaultTab }) {
  const [active, setActive] = useState(defaultTab)
  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>
}

Tabs.List = function TabList({ children }) {
  return <div className="tab-list">{children}</div>
}

Tabs.Tab = function Tab({ value, children }) {
  const { active, setActive } = useContext(TabsContext)
  return (
    <button className={active === value ? 'active' : ''} onClick={() => setActive(value)}>
      {children}
    </button>
  )
}

Tabs.Panel = function Panel({ value, children }) {
  const { active } = useContext(TabsContext)
  return active === value ? <div>{children}</div> : null
}

// Usage — clean, expressive API
<Tabs defaultTab="profile">
  <Tabs.List>
    <Tabs.Tab value="profile">Profile</Tabs.Tab>
    <Tabs.Tab value="settings">Settings</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="profile"><ProfileForm /></Tabs.Panel>
  <Tabs.Panel value="settings"><SettingsForm /></Tabs.Panel>
</Tabs>
```

### Controlled vs Uncontrolled Components (pattern)

Design your reusable components to work both ways:
```jsx
function Toggle({ checked, defaultChecked, onChange }) {
  // If checked prop provided → controlled (parent owns state)
  // If defaultChecked provided → uncontrolled (component owns state)
  const [internal, setInternal] = useState(defaultChecked ?? false)
  const isControlled = checked !== undefined
  const value = isControlled ? checked : internal

  const handleChange = () => {
    if (!isControlled) setInternal(v => !v)
    onChange?.(!value)
  }

  return <button onClick={handleChange}>{value ? 'ON' : 'OFF'}</button>
}
```
