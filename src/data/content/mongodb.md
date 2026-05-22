## Introduction to NoSQL & MongoDB

MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like BSON documents instead of rows and columns.

**Core concepts:**
- Data lives in **collections** (like tables) made up of **documents**
- Documents are BSON objects — JSON with extra types like `Date` and `ObjectId`
- Schema is flexible — documents in the same collection can have different fields
- Scales horizontally via **sharding**; high availability via **replica sets**

```js
// Example MongoDB document
{
  _id: ObjectId("64a1f2b3c4d5e6f7a8b9c0d1"),
  name: "Alice",
  email: "alice@example.com",
  tags: ["admin", "user"],
  createdAt: new Date()
}
```

**When to use MongoDB:**
- Data is hierarchical or nested (arrays, embedded objects)
- Schema evolves frequently during development
- You need horizontal scaling across multiple servers

## CRUD Operations (Create, Read, Update, Delete)

CRUD is the foundation of working with any database. MongoDB provides a rich query language for all four operations.

**Create:**
```js
await db.collection('users').insertOne({ name: 'Bob', age: 25 })
await db.collection('users').insertMany([{ name: 'Carol' }, { name: 'Dave' }])
```

**Read:**
```js
await db.collection('users').findOne({ name: 'Bob' })
await db.collection('users').find({ age: { $gt: 20 } }).toArray()
```

**Update:**
```js
// $set only updates the specified fields
await db.collection('users').updateOne({ name: 'Bob' }, { $set: { age: 26 } })
// $push adds an item to an array
await db.collection('users').updateOne({ name: 'Bob' }, { $push: { tags: 'vip' } })
```

**Delete:**
```js
await db.collection('users').deleteOne({ name: 'Bob' })
await db.collection('users').deleteMany({ age: { $lt: 18 } })
```

**Common query operators:** `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$and`, `$or`

## Schema Design with Mongoose

Mongoose is an ODM (Object Data Modeling) library for MongoDB and Node.js. It enforces structure via schemas and adds validation, middleware, and virtual fields.

**Defining a schema and model:**
```js
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  age:   { type: Number, min: 0 },
  role:  { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
})

export const User = mongoose.model('User', userSchema)
```

**Using the model:**
```js
const user = await User.create({ name: 'Alice', email: 'alice@example.com' })
const found = await User.findOne({ email: 'alice@example.com' })
await User.findByIdAndUpdate(id, { age: 31 }, { new: true })
await User.findByIdAndDelete(id)
```

**Key Mongoose features:**
- **Validation** — built-in (`required`, `min`, `max`, `enum`) and custom validators
- **Middleware (hooks)** — `pre('save', ...)` for password hashing, timestamps, etc.
- **Virtuals** — computed properties not stored in DB (e.g. `fullName`)
- **Populate** — replaces ObjectId references with actual documents

## Indexes & Query Performance

Indexes allow MongoDB to find documents quickly without scanning every document in a collection (a **collection scan**).

**Creating indexes:**
```js
// Single field index
userSchema.index({ email: 1 })  // 1 = ascending, -1 = descending

// Compound index
userSchema.index({ lastName: 1, firstName: 1 })

// Unique index
userSchema.index({ email: 1 }, { unique: true })

// Text index for full-text search
userSchema.index({ bio: 'text' })
```

**Explain a query** to see if it uses an index:
```js
await User.find({ email: 'x@x.com' }).explain('executionStats')
// Look for "IXSCAN" (index scan) vs "COLLSCAN" (collection scan)
```

**Best practices:**
- Index fields used in `find`, `sort`, or `populate` queries
- Compound indexes follow a **left-prefix rule** — index `{ a, b, c }` covers queries on `a`, `a+b`, or `a+b+c`
- Too many indexes slow down writes — only index what you query
- Use `sparse: true` for optional fields to avoid indexing null entries

## Aggregation Pipeline

The aggregation pipeline processes documents through a series of stages, each transforming the data. It's the MongoDB equivalent of SQL `GROUP BY`, `JOIN`, `HAVING`, etc.

**Common stages:**
```js
await Order.aggregate([
  { $match:  { status: 'completed' } },         // filter documents
  { $group:  { _id: '$userId', total: { $sum: '$amount' } } }, // group & compute
  { $sort:   { total: -1 } },                   // sort results
  { $limit:  10 },                              // take top 10
  { $lookup: {                                  // join another collection
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'user'
  }},
  { $project: { 'user.name': 1, total: 1 } }   // shape output fields
])
```

**Useful accumulator operators for `$group`:**
- `$sum` — total
- `$avg` — average
- `$min` / `$max` — extremes
- `$push` — collect values into an array
- `$first` / `$last` — first/last value in group

**`$unwind`** — flattens an array field into separate documents, useful before grouping on array elements.

## Atlas & Cloud Deployment

MongoDB Atlas is the official managed cloud database service. It runs MongoDB on AWS, Azure, or GCP with built-in backups, monitoring, and scaling.

**Getting started:**
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Add your IP to the **Network Access** allowlist
3. Create a database user under **Database Access**
4. Copy the connection string from **Connect > Drivers**

**Connecting from Node.js:**
```js
import mongoose from 'mongoose'

await mongoose.connect(process.env.MONGO_URI)
// MONGO_URI = "mongodb+srv://user:pass@cluster.mongodb.net/dbname"
```

**Atlas features to know:**
- **Free tier (M0)** — 512 MB storage, shared cluster, good for learning/dev
- **Atlas Search** — full-text search powered by Lucene
- **Atlas Data API** — access data via HTTP without a driver
- **Triggers** — run server-side functions on database events
- **Charts** — built-in data visualization tool

Store your connection string in `.env` and never commit it to git.

## Authentication & Security

Securing a MongoDB deployment covers both the database server itself and how your application connects to it.

**Mongoose-level security (most common in MERN apps):**
```js
// Hash passwords before saving — never store plaintext
import bcrypt from 'bcryptjs'

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}
```

**MongoDB Atlas security checklist:**
- Enable **IP Allowlist** — only allow known IPs (or your server's IP)
- Use **database users** with minimum required permissions (principle of least privilege)
- Enable **TLS/SSL** (Atlas does this by default)
- Never use `{ username: 'admin', password: 'password' }`

**Query injection prevention:**
```js
// Dangerous — user input goes directly into query
await User.findOne({ username: req.body.username })

// Safe — Mongoose sanitizes types, but also use express-mongo-sanitize
import mongoSanitize from 'express-mongo-sanitize'
app.use(mongoSanitize())
```

## Data Relationships & Population

MongoDB supports two strategies for relating documents: **embedding** (nesting) and **referencing** (storing ObjectIds and using `populate`).

**Embedding** — good for data always read together, one-to-few relationships:
```js
// Post with embedded comments
{ title: 'Hello', comments: [{ text: 'Nice!', author: 'Bob' }] }
```

**Referencing with populate** — good for many-to-many or large sub-documents:
```js
const postSchema = new mongoose.Schema({
  title:  String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
})

// Fetch post and replace author ObjectId with full User document
const post = await Post.findById(id).populate('author', 'name email')
```

**Choosing a strategy:**
- **Embed** when: sub-documents are small, always accessed with parent, rarely updated independently
- **Reference** when: sub-documents are large, shared by many parents, or updated frequently on their own

**`$lookup`** (raw aggregation join):
```js
await Post.aggregate([
  { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorInfo' } }
])
```
