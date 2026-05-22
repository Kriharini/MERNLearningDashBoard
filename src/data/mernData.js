import mongoContent   from './content/mongodb.md?raw'
import expressContent from './content/express.md?raw'
import reactContent   from './content/react.md?raw'
import nodeContent    from './content/node.md?raw'

export const TECHS = [
  {
    id: 'mongodb',
    label: 'MongoDB',
    color: '#00ED64',
    description: 'Document-oriented NoSQL database for modern applications.',
    topics: [
      'Introduction to NoSQL & MongoDB',
      'CRUD Operations (Create, Read, Update, Delete)',
      'Schema Design with Mongoose',
      'Indexes & Query Performance',
      'Aggregation Pipeline',
      'Atlas & Cloud Deployment',
      'Authentication & Security',
      'Data Relationships & Population',
    ],
    content: mongoContent,
    resources: [
      { label: 'MongoDB Documentation', url: 'https://www.mongodb.com/docs/' },
      { label: 'Mongoose Documentation', url: 'https://mongoosejs.com/docs/' },
      { label: 'MongoDB University (Free)', url: 'https://learn.mongodb.com/' },
      { label: 'MongoDB CRUD Guide', url: 'https://www.mongodb.com/docs/manual/crud/' },
    ],
  },
  {
    id: 'express',
    label: 'Express',
    color: '#8b5cf6',
    description: 'Minimal and flexible Node.js web application framework.',
    topics: [
      'Routing & Route Parameters',
      'Middleware Concepts & Pipeline',
      'Request & Response Handling',
      'REST API Design Principles',
      'Error Handling & Validation',
      'Authentication with JWT',
      'File Uploads with Multer',
      'CORS & Security Headers',
    ],
    content: expressContent,
    resources: [
      { label: 'Express Documentation', url: 'https://expressjs.com/' },
      { label: 'Express API Reference', url: 'https://expressjs.com/en/4x/api.html' },
      { label: 'Security Best Practices', url: 'https://expressjs.com/en/advanced/best-practice-security.html' },
      { label: 'Using Middleware Guide', url: 'https://expressjs.com/en/guide/using-middleware.html' },
    ],
  },
  {
    id: 'react',
    label: 'React',
    color: '#61DAFB',
    description: 'JavaScript library for building user interfaces.',
    topics: [
      'JSX & Component Basics',
      'Props & State',
      'useState & useEffect Hooks',
      'React Router for Navigation',
      'Context API',
      'Custom Hooks',
      'Performance Optimization',
      'Forms & Controlled Components',
    ],
    content: reactContent,
    resources: [
      { label: 'React Documentation', url: 'https://react.dev/' },
      { label: 'React Router Documentation', url: 'https://reactrouter.com/' },
      { label: 'Hooks Reference', url: 'https://react.dev/reference/react' },
      { label: 'React Tutorial', url: 'https://react.dev/learn' },
    ],
  },
  {
    id: 'node',
    label: 'Node.js',
    color: '#68a063',
    description: "JavaScript runtime built on Chrome's V8 engine.",
    topics: [
      'Node.js Architecture & Event Loop',
      'Modules (CommonJS & ES Modules)',
      'File System (fs module)',
      'HTTP Module & Creating Servers',
      'npm & Package Management',
      'Environment Variables & dotenv',
      'Streams & Buffers',
      'Debugging & Error Handling',
    ],
    content: nodeContent,
    resources: [
      { label: 'Node.js Documentation', url: 'https://nodejs.org/en/docs/' },
      { label: 'Node.js Guides', url: 'https://nodejs.org/en/docs/guides/' },
      { label: 'npm Documentation', url: 'https://docs.npmjs.com/' },
      { label: 'Node.js Best Practices', url: 'https://github.com/goldbergyoni/nodebestpractices' },
    ],
  },
]
