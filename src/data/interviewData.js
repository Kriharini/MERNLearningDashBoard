export const INTERVIEW_QA = [
  // MongoDB
  {
    category: 'mongodb',
    question: 'What is MongoDB and how does it differ from SQL databases?',
    answer: "MongoDB is a document-oriented NoSQL database that stores data as flexible JSON-like documents (BSON). Unlike SQL databases which use tables and rows with a fixed schema, MongoDB uses collections and documents with dynamic schemas, making it easier to handle unstructured or evolving data.",
  },
  {
    category: 'mongodb',
    question: 'What is a document in MongoDB?',
    answer: "A document is the basic unit of data in MongoDB, similar to a row in SQL. It is stored as BSON (Binary JSON) and can contain nested documents and arrays. Documents in the same collection do not need to have the same fields.",
  },
  {
    category: 'mongodb',
    question: 'What are indexes and why are they important?',
    answer: "Indexes store a small portion of the collection's data in an easy-to-traverse form. They improve query performance by allowing MongoDB to find documents without scanning the entire collection. Without indexes, MongoDB performs a full collection scan (O(n)).",
  },
  {
    category: 'mongodb',
    question: 'Explain the aggregation pipeline.',
    answer: "The aggregation pipeline processes documents through a series of stages. Each stage transforms the documents. Common stages: $match (filter), $group (group by field), $sort, $project (reshape fields), $lookup (join collections). It is the recommended way to perform complex data transformations in MongoDB.",
  },
  {
    category: 'mongodb',
    question: 'What is Mongoose and why use it?',
    answer: "Mongoose is an ODM (Object Data Modeling) library for MongoDB and Node.js. It provides schema validation, type casting, query building, and middleware hooks. It adds structure on top of MongoDB's flexible nature, helping enforce data consistency across your application.",
  },

  // Express
  {
    category: 'express',
    question: 'What is Express.js?',
    answer: "Express.js is a minimal and flexible Node.js web framework for building web servers and APIs. It simplifies routing, middleware integration, and request/response handling compared to Node's built-in http module.",
  },
  {
    category: 'express',
    question: 'What is middleware in Express?',
    answer: "Middleware are functions with access to req, res, and next(). They execute sequentially and can read/modify req and res, end the request cycle, or call next() to pass control to the next middleware. Common uses: body parsing, logging, authentication checks.",
  },
  {
    category: 'express',
    question: 'What is the difference between app.use() and app.get()?',
    answer: "app.use() mounts middleware that matches any HTTP method and any path starting with the given prefix. app.get() only matches HTTP GET requests on an exact path. app.use() is for middleware; app.get() is for specific route handlers.",
  },
  {
    category: 'express',
    question: 'How do you handle errors in Express?',
    answer: "Express error-handling middleware takes 4 parameters (err, req, res, next) and is placed after all routes. For async errors, wrap handlers in try/catch and call next(err), or use a library like express-async-errors to automatically forward thrown errors.",
  },
  {
    category: 'express',
    question: 'How do you implement JWT authentication?',
    answer: "On login, sign a JWT with jwt.sign({ userId }, secret, { expiresIn }). For protected routes, create middleware that reads the Authorization header, verifies the token with jwt.verify(), and attaches the decoded user to req.user. Return 401 if the token is missing or invalid.",
  },

  // React
  {
    category: 'react',
    question: 'What is the virtual DOM?',
    answer: "The virtual DOM is a lightweight in-memory representation of the real DOM. When state changes, React creates a new virtual DOM tree, diffs it against the previous one (reconciliation), and only updates real DOM nodes where changes occurred — minimizing expensive layout/paint operations.",
  },
  {
    category: 'react',
    question: 'What is the difference between state and props?',
    answer: "Props are read-only data passed from parent to child — the child cannot modify them. State is mutable data managed within a component via useState. Both trigger a re-render when they change. Props flow down the tree; state is local to the component.",
  },
  {
    category: 'react',
    question: 'What is useEffect and when do you use it?',
    answer: "useEffect runs side effects after render: data fetching, subscriptions, timers, or DOM mutations. Dependency array controls when it runs — no array (every render), empty array (mount only), listed deps (when deps change). Return a cleanup function to cancel subscriptions or clear timers.",
  },
  {
    category: 'react',
    question: 'What are React hooks?',
    answer: "Hooks let you use state and React features in function components. Built-ins: useState (local state), useEffect (side effects), useContext (consume context), useRef (mutable ref without re-render), useMemo/useCallback (memoization). Custom hooks extract reusable stateful logic into separate functions.",
  },
  {
    category: 'react',
    question: 'How does React Router work?',
    answer: "React Router uses the browser History API to sync UI with the URL. BrowserRouter provides context. Routes/Route match the URL to components. Link/NavLink update the URL without page reloads. useNavigate gives programmatic navigation; useParams reads route parameters.",
  },

  // Node.js
  {
    category: 'node',
    question: 'What is the event loop in Node.js?',
    answer: "The event loop lets Node.js perform non-blocking I/O despite being single-threaded. It continuously checks the call stack and callback queue, moving callbacks to the stack when it is empty. Phases: timers → pending callbacks → idle/prepare → poll → check → close callbacks.",
  },
  {
    category: 'node',
    question: 'What is the difference between CommonJS and ES Modules?',
    answer: "CommonJS (require/module.exports) is the original Node module system — synchronous, dynamic. ES Modules (import/export) are the JavaScript standard — asynchronous, static (enabling tree shaking). Use \"type\": \"module\" in package.json or the .mjs extension to use ES Modules in Node.",
  },
  {
    category: 'node',
    question: 'How do you handle asynchronous code in Node.js?',
    answer: "Three patterns: callbacks (original, can lead to callback hell), Promises (.then()/.catch(), chainable), and async/await (syntactic sugar over Promises, most readable). Use async/await with try/catch for modern Node.js code. Always handle Promise rejections to avoid unhandled rejection warnings.",
  },
  {
    category: 'node',
    question: 'What is package.json?',
    answer: "package.json is the project manifest. It records metadata (name, version), dependencies (production packages), devDependencies (dev-only packages), scripts (npm run commands), and the main entry point. npm uses it to install correct packages and manage the project lifecycle.",
  },
  {
    category: 'node',
    question: 'What are streams in Node.js?',
    answer: "Streams process data in chunks rather than loading everything into memory. Types: Readable (data source), Writable (data destination), Duplex (both), Transform (modify data in transit). Useful for large files, HTTP responses, and real-time data. Use pipe() to connect streams together.",
  },
]
