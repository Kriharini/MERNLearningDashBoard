## Node.js Architecture & Event Loop

Node.js is a JavaScript runtime built on Chrome's V8 engine. Its key feature is a **single-threaded, non-blocking, event-driven** architecture that makes it efficient for I/O-heavy tasks.

**How it works:**
- Node runs on a single thread — no multi-threading per request
- I/O operations (file reads, network calls, DB queries) are handed off to the OS via **libuv**
- When the OS completes the work, a callback is placed in the **event queue**
- The **event loop** continuously checks: "Is the call stack empty? If so, run the next callback."

```
   ┌──────────────────────────┐
   │         Event Loop       │
   │  Timers → I/O → Poll →   │
   │  Check → Close callbacks │
   └──────────────────────────┘
         ↑            ↓
    [Call Stack]  [Event Queue]
```

**Phases of the event loop (simplified):**
1. **Timers** — `setTimeout` / `setInterval` callbacks
2. **I/O callbacks** — completed I/O operations
3. **Poll** — retrieve new I/O events (blocks here if queue is empty)
4. **Check** — `setImmediate` callbacks
5. **Close** — socket/file close callbacks

**`process.nextTick`** runs before the next event loop iteration — use sparingly as it can starve the loop.

**Key insight:** Never block the event loop with CPU-heavy synchronous work. Use worker threads (`worker_threads` module) for CPU-intensive tasks.

## Modules (CommonJS & ES Modules)

Node.js supports two module systems: **CommonJS** (the original, `.cjs`/`.js`) and **ES Modules** (modern standard, `.mjs`/`.js` with `"type":"module"`).

**CommonJS (CJS):**
```js
// Exporting
const add = (a, b) => a + b
module.exports = { add }
module.exports.PI = 3.14   // named export

// Importing
const { add } = require('./math')
const fs = require('fs')   // built-in module
```

**ES Modules (ESM):**
```js
// Exporting
export const add = (a, b) => a + b
export default function main() { ... }

// Importing
import { add } from './math.js'   // must include extension in Node
import main from './math.js'
import fs from 'node:fs'           // node: prefix recommended for built-ins
```

**Choosing between them:**
- Modern projects (including this one) use ESM — set `"type": "module"` in `package.json`
- CJS is still common in older packages and CLI tools
- You cannot `require()` an ESM module; you can `await import()` one from CJS

**Key difference:** CJS `require()` is synchronous; ESM `import` is asynchronous and statically analyzed (enables tree-shaking).

## File System (fs module)

Node's built-in `fs` module provides file I/O. Use the `fs/promises` API for `async/await` rather than the callback-based original.

**Reading files:**
```js
import { readFile, readdir } from 'node:fs/promises'

const content = await readFile('./data.json', 'utf-8')
const parsed  = JSON.parse(content)

const files = await readdir('./uploads')  // returns array of filenames
```

**Writing files:**
```js
import { writeFile, appendFile, mkdir } from 'node:fs/promises'

await writeFile('./output.txt', 'Hello World', 'utf-8')  // overwrites
await appendFile('./log.txt', `${new Date().toISOString()} event\n`)
await mkdir('./uploads', { recursive: true })  // creates path if missing
```

**Checking if a file exists:**
```js
import { access, constants } from 'node:fs/promises'

async function exists(path) {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}
```

**Watching for changes:**
```js
import { watch } from 'node:fs'
watch('./src', { recursive: true }, (event, filename) => {
  console.log(`${event}: ${filename}`)
})
```

**Sync vs async:** prefer async (`fs/promises`) in servers — sync calls block the event loop and hurt performance under load.

## HTTP Module & Creating Servers

Node's built-in `http` module lets you create an HTTP server without any framework. Understanding it demystifies what Express does under the hood.

**Basic HTTP server:**
```js
import http from 'node:http'

const server = http.createServer((req, res) => {
  const { method, url } = req

  if (method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Hello World' }))
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(3000, () => console.log('Server running on port 3000'))
```

**Reading the request body** (it arrives as a stream):
```js
function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end',  () => resolve(JSON.parse(body)))
    req.on('error', reject)
  })
}
```

**Why use Express instead?** Express wraps `http.createServer` and adds routing, middleware, `req.body` parsing, and `res.json()` — eliminating all the boilerplate above.

**HTTPS:** use `https.createServer({ key, cert }, handler)` with SSL certificates. In production, let a reverse proxy (nginx, Caddy) handle TLS instead.

## npm & Package Management

npm (Node Package Manager) ships with Node.js and is the world's largest software registry. It manages project dependencies and scripts.

**Essential commands:**
```bash
npm init -y                    # create package.json with defaults
npm install express            # add a runtime dependency
npm install --save-dev jest    # add a dev dependency
npm install                    # install all deps from package.json
npm uninstall express          # remove a package
npm update                     # update all packages within version ranges
npm run dev                    # run a script from package.json
npm list --depth=0             # show installed packages
```

**`package.json` key fields:**
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev":   "node --watch src/index.js",
    "start": "node src/index.js",
    "test":  "jest"
  },
  "dependencies":    { "express": "^4.19.0" },
  "devDependencies": { "jest": "^29.0.0" }
}
```

**`package-lock.json`** — locks exact dependency versions for reproducible installs. Always commit this file.

**Semver ranges:**
- `^1.2.3` — compatible with 1.x.x (allows minor and patch updates)
- `~1.2.3` — allows patch updates only (1.2.x)
- `1.2.3` — exact version, no updates

**`node_modules/`** — never commit this folder; add it to `.gitignore`.

## Environment Variables & dotenv

Environment variables keep secrets (API keys, DB passwords) and environment-specific config out of your source code.

**Using `.env` with `dotenv`:**
```bash
npm install dotenv
```

```ini
# .env  (never commit this file!)
PORT=3000
MONGO_URI=mongodb+srv://user:pass@cluster.net/db
JWT_SECRET=supersecretkey
NODE_ENV=development
```

```js
// Load at the very top of your entry point
import 'dotenv/config'

// Now available via process.env
const port = process.env.PORT || 3000
await mongoose.connect(process.env.MONGO_URI)
```

**Node 20+ native support** (no dotenv needed):
```bash
node --env-file=.env src/index.js
```

**Best practices:**
- Add `.env` to `.gitignore` immediately
- Provide a `.env.example` with dummy values so teammates know what variables are needed
- Validate required variables at startup:

```js
const required = ['MONGO_URI', 'JWT_SECRET']
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`)
}
```

- Use different `.env` files per environment: `.env.development`, `.env.test`, `.env.production`

## Streams & Buffers

Streams process data in chunks instead of loading everything into memory at once — essential for large files, video, or real-time data.

**Buffer:** a fixed-size chunk of raw binary data (Node's way of handling binary before it's converted to a string).
```js
const buf = Buffer.from('Hello', 'utf-8')
console.log(buf)            // <Buffer 48 65 6c 6c 6f>
console.log(buf.toString()) // "Hello"
```

**Four stream types:**
- **Readable** — source of data (file read, HTTP request body)
- **Writable** — destination (file write, HTTP response)
- **Duplex** — both readable and writable (TCP socket)
- **Transform** — duplex that modifies data (gzip, encryption)

**Pipe — connect streams together:**
```js
import { createReadStream, createWriteStream } from 'node:fs'
import { createGzip } from 'node:zlib'

// Read file → gzip → write compressed file
createReadStream('large.csv')
  .pipe(createGzip())
  .pipe(createWriteStream('large.csv.gz'))
```

**Streaming an HTTP response:**
```js
app.get('/download', (req, res) => {
  res.setHeader('Content-Type', 'text/csv')
  createReadStream('./data.csv').pipe(res)
})
```

**Why streams matter:** Reading a 1 GB file with `readFile` loads it all into RAM. A stream reads it in small chunks, keeping memory usage constant regardless of file size.

## Debugging & Error Handling

**Types of errors in Node.js:**
- **Synchronous** — throw/catch
- **Async callback** — first argument convention `(err, data) =>`
- **Promise** — `.catch()` or `try/catch` with `async/await`
- **Unhandled** — crash the process if not caught

**Structured try/catch with async/await:**
```js
async function getUser(id) {
  try {
    const user = await User.findById(id)
    if (!user) throw new Error('User not found')
    return user
  } catch (err) {
    console.error('getUser error:', err.message)
    throw err  // re-throw so the caller can handle it
  }
}
```

**Catch unhandled promise rejections** (always add to your entry point):
```js
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
  process.exit(1)
})
```

**Built-in debugger:**
```bash
node --inspect src/index.js
# Open chrome://inspect in Chrome to attach DevTools
```

**`--watch` mode** (Node 18+) — automatically restarts on file changes:
```bash
node --watch src/index.js
```

**Logging:** use structured logging libraries (`winston`, `pino`) in production rather than `console.log` — they support log levels, JSON output, and log rotation.
