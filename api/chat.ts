import type { VercelRequest, VercelResponse } from '@vercel/node'
import { OVID_SYSTEM_PROMPT } from './_ovid-knowledge.js'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
// swappable without a redeploy — just update the env var in Vercel's dashboard
const MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
// a generous sanity ceiling on payload size/latency — not the thing that
// actually decides when a conversation is "done" anymore, see
// MAX_CONVERSATION_SPEND_USD below for that
const MAX_HISTORY_MESSAGES = 60
const MAX_MESSAGE_LENGTH = 600
// 300 was cutting off longer answers (e.g. the full Ms. Crawford story)
// before they finished — gpt-4o-mini's output is cheap enough (see pricing
// below) that doubling this barely moves the spend estimate
const MAX_OUTPUT_TOKENS = 600

// $/1M tokens — update these if MODEL changes (current values are
// openai/gpt-4o-mini's public pricing). This only gates a soft
// conversational budget, not billing, so it doesn't need to be exact.
const INPUT_COST_PER_1M_TOKENS = 0.15
const OUTPUT_COST_PER_1M_TOKENS = 0.6
// stop the conversation once its estimated cost crosses this, rather than
// capping by message count (never bring that back — a long conversation of
// short messages is fine; a few very long ones can still cost more than
// many short ones, which a count alone can't tell apart). The knowledge
// base has grown a fair bit and gets resent in full every single turn, so
// each turn now costs more than it used to at the same message count —
// bumped from $0.05 to keep the actual number of messages a visitor gets
// from feeling smaller than before. Still trivial in aggregate: gpt-4o-mini
// is cheap enough that even every visitor maxing this out daily wouldn't
// add up to much.
const MAX_CONVERSATION_SPEND_USD = 0.1

// crude but consistent estimate (~4 chars/token for English) — no tokenizer
// dependency needed for a soft budget check like this one
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// there's no persistence between requests, but the client always resends
// the full conversation so far — so instead of tracking spend across
// requests, this reconstructs what each *prior* turn's own request would
// have cost (a growing prefix of this same history as input, the reply
// that followed it as output) directly from the one array we do have.
// Summed across every user turn in the history, that closely approximates
// real cumulative spend without needing to store anything server-side.
function estimateConversationSpendUsd(messages: ChatMessage[]): number {
  let cost = 0
  let historyTokens = estimateTokens(OVID_SYSTEM_PROMPT)
  for (let i = 0; i < messages.length; i++) {
    historyTokens += estimateTokens(messages[i].content)
    if (messages[i].role !== 'user') continue
    const reply = messages[i + 1]
    const outputTokens = reply?.role === 'assistant' ? estimateTokens(reply.content) : MAX_OUTPUT_TOKENS
    cost +=
      (historyTokens / 1_000_000) * INPUT_COST_PER_1M_TOKENS + (outputTokens / 1_000_000) * OUTPUT_COST_PER_1M_TOKENS
  }
  return cost
}

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

// optional: a Google Apps Script Web App URL that appends each exchange as
// a row in a spreadsheet (see .env.example for setup). Logging is entirely
// best-effort — if this isn't set, or the request fails or times out, the
// chat itself is never affected.
const LOG_WEBHOOK_URL = process.env.OVID_LOG_WEBHOOK_URL

async function logExchange(entry: {
  conversationId: string
  turn: number
  type: 'normal' | 'abuse' | 'limit_reached'
  userMessage: string
  reply: string
}) {
  if (!LOG_WEBHOOK_URL) return
  try {
    await fetch(LOG_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: new Date().toISOString(), ...entry }),
      signal: AbortSignal.timeout(3000),
    })
  } catch (err) {
    console.error('Failed to log Ovid exchange', err)
  }
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

  const conversationId = typeof req.body?.conversationId === 'string' ? req.body.conversationId : 'unknown'
  const turn = messages.length
  const latestUserMessage = [...messages].reverse().find((m) => m.role === 'user')

  if (latestUserMessage && looksLikeAbuse(latestUserMessage.content)) {
    const reply = "I'm just here to chat about Joey — ask me about his work, projects, or background!"
    await logExchange({ conversationId, turn, type: 'abuse', userMessage: latestUserMessage.content, reply })
    // a normal 200 with a canned reply, not an error — the frontend renders
    // this exactly like any other Ovid message, no special-casing needed
    res.status(200).json({ reply })
    return
  }

  if (estimateConversationSpendUsd(messages) >= MAX_CONVERSATION_SPEND_USD) {
    const reply = "That's a good stopping point for this conversation!"
    await logExchange({
      conversationId,
      turn,
      type: 'limit_reached',
      userMessage: latestUserMessage?.content ?? '',
      reply,
    })
    // same shape as the abuse response above — a normal 200 the frontend
    // renders like any other reply, plus a flag telling it to lock the
    // input instead of computing this itself (it can't, without
    // duplicating the estimate above)
    res.status(200).json({ reply, limitReached: true })
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

  await logExchange({
    conversationId,
    turn,
    type: 'normal',
    userMessage: latestUserMessage?.content ?? '',
    reply,
  })
  res.status(200).json({ reply })
}
