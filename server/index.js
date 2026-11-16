import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import rateLimit from 'express-rate-limit'
import Anthropic from '@anthropic-ai/sdk'
import { LEVELS, buildPrompt } from './prompts.js'

const app = express()
app.set('trust proxy', 1) // behind Heroku's router, so rate limiting sees the real client IP
app.use(express.json({ limit: '256kb' }))

const model = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5'
const client = new Anthropic() // reads ANTHROPIC_API_KEY from env

// Each call spends Claude credits, so cap requests per client.
const limiter = rateLimit({
  windowMs: 60_000,
  limit: Number(process.env.RATE_LIMIT_PER_MIN) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, try again shortly' },
})

app.post('/api/generate', limiter, async (req, res) => {
  const { level, data } = req.body ?? {}
  if (!LEVELS.includes(level) || !data) {
    return res.status(400).json({ error: 'level and data are required' })
  }
  try {
    const msg = await client.messages.create({
      model,
      max_tokens: 8000,
      messages: [{ role: 'user', content: buildPrompt(level, data) }],
    })
    const text = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('')
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
    res.json(JSON.parse(json))
  } catch (err) {
    console.error(err)
    res.status(502).json({ error: 'Resume generation failed' })
  }
})

// In production the built SPA is served from this same server.
// In local dev `dist/` is usually absent and Vite serves the app instead.
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
if (existsSync(dist)) {
  app.use(express.static(dist))
  app.use((req, res, next) =>
    req.method === 'GET' && !req.path.startsWith('/api')
      ? res.sendFile(path.join(dist, 'index.html'))
      : next(),
  )
}

const port = process.env.PORT || 3002
app.listen(port, () => console.log(`Server on http://localhost:${port}`))
