## Routing & Route Parameters

Express routing maps HTTP methods and URL paths to handler functions. Route parameters let you capture dynamic values from the URL.

**Basic routing:**
```js
import express from 'express'
const router = express.Router()

router.get('/',          (req, res) => res.send('List all'))
router.post('/',         (req, res) => res.send('Create'))
router.get('/:id',       (req, res) => res.send(`Get ${req.params.id}`))
router.put('/:id',       (req, res) => res.send(`Update ${req.params.id}`))
router.delete('/:id',    (req, res) => res.send(`Delete ${req.params.id}`))

export default router
```

**Route parameters vs query strings:**
```js
// Route param — part of the path: GET /users/42
req.params.id  // "42"

// Query string — after ?: GET /users?sort=name&page=2
req.query.sort  // "name"
req.query.page  // "2"
```

**Organizing routes:**
```js
// app.js — mount the router under a prefix
import userRouter from './routes/users.js'
app.use('/api/users', userRouter)
// All routes inside userRouter are now under /api/users
```

**Route chaining:**
```js
router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)
```

## Middleware Concepts & Pipeline

Middleware functions run between the request arriving and the response being sent. They have access to `req`, `res`, and `next()`.

**The middleware signature:**
```js
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`)
  next() // must call next() to pass control to the next middleware
}
app.use(logger)
```

**Order matters** — middleware executes in the order it is registered.

**Types of middleware:**
- **Application-level** — `app.use(fn)` or `app.get('/path', fn)`
- **Router-level** — `router.use(fn)`
- **Error-handling** — 4 parameters: `(err, req, res, next)`
- **Built-in** — `express.json()`, `express.urlencoded()`, `express.static()`
- **Third-party** — `cors`, `helmet`, `morgan`, `multer`

**Common setup:**
```js
import express from 'express'
import cors    from 'cors'
import morgan  from 'morgan'

const app = express()

app.use(cors())                           // allow cross-origin requests
app.use(morgan('dev'))                    // request logging
app.use(express.json())                   // parse JSON bodies
app.use(express.urlencoded({ extended: true })) // parse form bodies
```

**Error-handling middleware** must be registered last:
```js
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: err.message })
})
```

## Request & Response Handling

`req` and `res` are enhanced versions of Node's `IncomingMessage` and `ServerResponse` with many conveniences added by Express.

**Reading the request:**
```js
req.params      // route parameters    { id: '42' }
req.query       // query string        { page: '2' }
req.body        // parsed body         { name: 'Alice' }  (requires express.json())
req.headers     // request headers     { authorization: 'Bearer ...' }
req.method      // HTTP verb           'GET'
req.url         // full URL path       '/api/users?page=2'
req.ip          // client IP
```

**Sending a response:**
```js
res.status(200).json({ data: users })   // JSON response
res.status(201).json({ data: newUser }) // 201 Created
res.status(204).send()                  // No Content (DELETE success)
res.status(400).json({ message: 'Bad request' })
res.status(404).json({ message: 'Not found' })
res.redirect('/login')                  // redirect
res.sendFile(path.join(__dirname, 'index.html'))
```

**HTTP status codes to know:**
- `200` OK, `201` Created, `204` No Content
- `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found
- `409` Conflict, `422` Unprocessable Entity
- `500` Internal Server Error

**Best practice** — always set a status code explicitly rather than relying on defaults.

## REST API Design Principles

REST (Representational State Transfer) is a set of conventions for designing HTTP APIs that are predictable and easy to consume.

**Core principles:**
- **Stateless** — each request carries all information needed; server holds no session state
- **Resource-based URLs** — nouns, not verbs (`/users`, not `/getUsers`)
- **HTTP verbs for actions** — `GET` read, `POST` create, `PUT/PATCH` update, `DELETE` delete
- **Consistent responses** — always return JSON with predictable shapes

**URL conventions:**
```
GET    /api/posts          → list all posts
POST   /api/posts          → create a post
GET    /api/posts/:id      → get one post
PUT    /api/posts/:id      → replace a post
PATCH  /api/posts/:id      → partially update a post
DELETE /api/posts/:id      → delete a post

GET    /api/posts/:id/comments   → nested resource
```

**Consistent response shape:**
```js
// Success
res.status(200).json({ success: true, data: post })

// Error
res.status(404).json({ success: false, message: 'Post not found' })

// Paginated list
res.json({ success: true, data: posts, total: 100, page: 1, limit: 10 })
```

**Versioning** — prefix routes with `/api/v1/` to allow breaking changes without breaking existing clients.

## Error Handling & Validation

Robust error handling prevents server crashes and returns meaningful messages to the client.

**Async error wrapper** — avoids try/catch in every route:
```js
const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next)

router.get('/:id', catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'Not found' })
  res.json({ data: user })
}))
```

**Custom error class:**
```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}
// Usage: throw new AppError('Not found', 404)
```

**Input validation with `express-validator`:**
```js
import { body, validationResult } from 'express-validator'

const rules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
]

router.post('/register', rules, (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })
  // ... proceed
})
```

**Global error handler** (last middleware in app.js):
```js
app.use((err, req, res, next) => {
  const status = err.statusCode || 500
  res.status(status).json({ message: err.message || 'Something went wrong' })
})
```

## Authentication with JWT

JWT (JSON Web Token) is a stateless authentication mechanism. The server signs a token on login; the client sends it with every subsequent request.

**JWT structure:** `header.payload.signature` — the payload is base64-encoded (not encrypted), so never put secrets in it.

**Login and issue token:**
```js
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user || !(await bcrypt.compare(req.body.password, user.password)))
    return res.status(401).json({ message: 'Invalid credentials' })

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})
```

**Auth middleware — protect routes:**
```js
function protect(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] // "Bearer <token>"
  if (!token) return res.status(401).json({ message: 'Not authenticated' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

router.get('/profile', protect, (req, res) => res.json({ user: req.user }))
```

**Security tips:**
- Store `JWT_SECRET` in `.env` — use a long random string
- Keep token expiry short (`15m` – `7d`); use refresh tokens for long sessions
- Store tokens in `httpOnly` cookies (not `localStorage`) to prevent XSS theft

## File Uploads with Multer

Multer is a Node.js middleware for handling `multipart/form-data`, the encoding used for file uploads.

**Basic setup — store files on disk:**
```js
import multer from 'multer'
import path   from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    cb(null, allowed.includes(file.mimetype))
  }
})
```

**Using in a route:**
```js
// Single file
router.post('/avatar', upload.single('avatar'), (req, res) => {
  res.json({ path: req.file.path })
})

// Multiple files
router.post('/photos', upload.array('photos', 5), (req, res) => {
  res.json({ files: req.files.map(f => f.path) })
})
```

**Memory storage** (buffer instead of file) — useful before uploading to S3/Cloudinary:
```js
const upload = multer({ storage: multer.memoryStorage() })
// req.file.buffer contains the raw bytes
```

Always validate MIME type and file size to prevent abuse.

## CORS & Security Headers

**CORS (Cross-Origin Resource Sharing)** controls which origins can call your API from a browser.

**Using the `cors` package:**
```js
import cors from 'cors'

// Allow all origins (fine for public APIs, avoid in production)
app.use(cors())

// Allow specific origins only
app.use(cors({
  origin: ['https://myapp.com', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true  // allow cookies / auth headers cross-origin
}))
```

**Security headers with Helmet:**
```js
import helmet from 'helmet'
app.use(helmet())
```

Helmet sets headers like:
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `X-Frame-Options: DENY` — prevents clickjacking
- `Strict-Transport-Security` — enforces HTTPS
- `Content-Security-Policy` — restricts resource sources

**Rate limiting** (prevent brute-force / DoS):
```js
import rateLimit from 'express-rate-limit'

app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 requests per window
  message: 'Too many attempts, please try again later'
}))
```

**Minimum security checklist:** use `helmet`, configure `cors` explicitly, add rate limiting, sanitize inputs, and never expose stack traces in production responses.
