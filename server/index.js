import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY in .env — see .env.example')
  process.exit(1)
}

const app  = express()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.post('/api/ask', async (req, res) => {
  const { question, topic, tech } = req.body

  if (!question?.trim()) {
    return res.status(400).json({ error: 'Question is required' })
  }

  try {
    const prompt = `You are a concise MERN stack tutor. The student is studying "${topic}" in ${tech}.

Answer their question clearly and concisely. Include a short code example only if it genuinely helps. Use markdown formatting.

Question: ${question}`

    const result = await model.generateContent(prompt)
    res.json({ answer: result.response.text() })
  } catch (err) {
    console.error('Gemini error:', err.message)
    res.status(500).json({ error: 'AI request failed. Check your API key and try again.' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server → http://localhost:${PORT}`))
