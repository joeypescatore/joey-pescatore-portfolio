import type { VercelRequest, VercelResponse } from '@vercel/node'
import { OVID_SYSTEM_PROMPT } from './_ovid-knowledge'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
// swappable without a redeploy — just update the env var in Vercel's dashboard
const MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
// caps how much history gets resent each turn — the main lever on cost per
// session — and how long any single response can run, both enforced
// server-side regardless of what the client sends
const MAX_HISTORY_MESSAGES = 12
const MAX_MESSAGE_LENGTH = 600
const MAX_OUTPUT_TOKENS = 300

// deterministic pre-filter for the clearest "use this as a free homework/code
// LLM" attempts — this is plain code, not a model decision, so it can't be
// argued around with "ignore previous instructions" or role-play tricks the
// way a system-prompt-only defense can. Deliberately narrow (structural
// patterns, not topic words like "code") so it doesn't false-positive on a
// real question like "did you write the code for Wavform yourself?". The
// system prompt's own rules are the backstop for subtler attempts this
// doesn't catch.
const ABUSE_PATTERNS = [
  /```/, // pasted or requested code block
  /\b(write|generate)\s+(me\s+)?(a|an|some)\s+(function|program|script|code|essay|poem|story|paper|sql|query|regex)\b/i,
  /\bsolve\s+(this|for|the)\b[\s\S]*\b(equation|integral|derivative|problem)\b/i,
  /\b(do|help me with|complete|finish)\s+(my\s+)?(homework|assignment|essay|thesis)\b/i,
  /\bdebug\s+(this|my)\s+code\b/i,
  /\btranslate\s+(this|the following)\b/i,
]

function looksLikeAbuse(text: string): boolean {
  return ABUSE_PATTERNS.some((pattern) => pattern.test(text))
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function isValidMessage(value: unknown): value is ChatMessage {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    (v.role === 'user' || v.role === 'assistant') &&
    typeof v.content === 'string' &&
    v.content.length > 0 &&
    v.content.length <= MAX_MESSAGE_LENGTH
  )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY is not set')
    res.status(500).json({ error: 'Chat is not configured' })
    return
  }

  const messages = req.body?.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages must be a non-empty array' })
    return
  }
  if (messages.length > MAX_HISTORY_MESSAGES) {
    res.status(400).json({ error: 'Conversation is too long — please start a new chat' })
    return
  }
  if (!messages.every(isValidMessage)) {
    res.status(400).json({ error: 'Invalid message in conversation' })
    return
  }

  const latestUserMessage = [...messages].reverse().find((m) => m.role === 'user')
  if (latestUserMessage && looksLikeAbuse(latestUserMessage.content)) {
    // a normal 200 with a canned reply, not an error — the frontend renders
    // this exactly like any other Ovid message, no special-casing needed
    res.status(200).json({
      reply: "I'm just here to chat about Joey — ask me about his work, projects, or background!",
    })
    return
  }

  let upstream: Response
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // OpenRouter uses these to attribute traffic to the calling app —
        // optional, but good practice and free
        'HTTP-Referer': 'https://joeypescatore.com',
        'X-Title': "Joey Pescatore's Portfolio",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [{ role: 'system', content: OVID_SYSTEM_PROMPT }, ...messages],
      }),
    })
  } catch (err) {
    console.error('OpenRouter request failed', err)
    res.status(502).json({ error: 'Chat is temporarily unavailable' })
    return
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '')
    console.error('OpenRouter error', upstream.status, text)
    res.status(502).json({ error: 'Chat is temporarily unavailable' })
    return
  }

  const data = await upstream.json()
  const reply = data?.choices?.[0]?.message?.content
  if (typeof reply !== 'string' || reply.length === 0) {
    res.status(502).json({ error: 'No response generated' })
    return
  }

  res.status(200).json({ reply })
}
