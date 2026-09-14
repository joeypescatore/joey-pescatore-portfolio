import type { VercelRequest, VercelResponse } from '@vercel/node'
import { OVID_SYSTEM_PROMPT, OVID_SUGGESTION_TASK } from './_ovid-knowledge.js'

// EXPERIMENTAL, local test only, delete before this ever ships.
//
// A separate, dedicated endpoint rather than folding this into chat.ts's
// same completion: firing this in parallel with the main /api/chat request
// (see OvidChat.tsx's sendMessage) is what lets the suggestion arrive close
// to the same time as the answer, instead of strictly after it, which is
// all a single sequential stream could ever do.

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash-lite'
const MAX_HISTORY_MESSAGES = 60
const MAX_MESSAGE_LENGTH = 600
// enough headroom for a real ~12-word question (with tokenization/
// punctuation overhead that's often 20+ tokens on its own) plus a little
// slack — 20 was cutting real answers off mid-sentence before they ever
// reached a "?", which silently failed isValidSuggestion's endsWith("?")
// check on anything that wasn't unusually short. isValidSuggestion below
// is what actually guards against rambling, not this number.
const SUGGESTION_MAX_TOKENS = 30

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function isValidMessage(v: unknown): v is ChatMessage {
  if (typeof v !== 'object' || v === null) return false
  const value = v as Record<string, unknown>
  if (value.role !== 'user' && value.role !== 'assistant') return false
  if (typeof value.content !== 'string' || value.content.length === 0) return false
  if (value.role === 'user' && value.content.length > MAX_MESSAGE_LENGTH) return false
  return true
}

// guaranteed-safe fallback so this endpoint can never actually come back
// empty — every one of these is a real question Ovid can always answer
// directly, no deflection possible, whatever the conversation is
const FALLBACK_SUGGESTIONS = [
  "I'm a hiring manager, what should I know?",
  "What's Joey's design philosophy?",
  "How's Wavform going?",
]

function pickFallbackSuggestion(messages: ChatMessage[], alreadyCovered: string[]): string {
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === 'user')?.content
  const covered = lastUserMessage ? [lastUserMessage, ...alreadyCovered] : alreadyCovered
  // don't fall back to suggesting the exact same thing (or a close
  // rephrasing of it) just asked, or anything already asked/suggested
  // earlier this session
  const candidates = FALLBACK_SUGGESTIONS.filter((s) => !covered.some((prev) => isTooSimilar(prev, s)))
  return candidates[Math.floor(Math.random() * candidates.length)] ?? FALLBACK_SUGGESTIONS[0]
}

// common enough in almost any question that they're useless for telling
// two questions apart — stripped before comparing so "What was his role at
// Merge?" and "What was Joey's role at Merge?" compare on {role, merge} vs
// {joey, role, merge} instead of being diluted by words both share anyway
const STOPWORDS = new Set([
  'what', 'whats', 'was', 'were', 'is', 'are', 'did', 'does', 'do', 'the', 'a', 'an', 'of', 'at', 'in', 'on', 'to',
  'for', 'his', 'her', 'he', 'she', 'it', 'its', 'about', 'how', 'who', 'and', 'with', 'that', 'this',
])

// naive plural/possessive stemming — punctuation is stripped before this
// ever runs, so a casually-typed "whats joeys design philosophy" (no
// apostrophes at all) and a properly-punctuated "What's Joey's design
// philosophy?" would otherwise tokenize to "joeys" vs "joey", two
// different strings for the same word, which was enough to dodge the
// similarity check on an otherwise obvious repeat
function stem(word: string): string {
  return word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word
}

function significantWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOPWORDS.has(w))
      .map(stem),
  )
}

// exact-match only catches literal repeats, not a close rephrasing like
// "What was his role at Merge?" vs "What was Joey's role at Merge?" — this
// compares what's actually distinctive about each question (their
// significant, non-filler words) rather than the literal string
function isTooSimilar(a: string, b: string): boolean {
  const wordsA = significantWords(a)
  const wordsB = significantWords(b)
  if (wordsA.size === 0 || wordsB.size === 0) return false
  let intersection = 0
  for (const w of wordsA) if (wordsB.has(w)) intersection++
  const union = new Set([...wordsA, ...wordsB]).size
  return intersection / union >= 0.6
}

// backstop for when the model ignores the prompt's own rules anyway —
// never show anything that isn't a single short real question
function isValidSuggestion(text: string): boolean {
  if (text === 'NONE') return false
  if (text.length === 0 || text.length > 100) return false
  if (!text.endsWith('?')) return false
  // a real sentence break before the final "?" means it rambled past a
  // single question even though it technically ends in one — checked as
  // ". "/"? "/"! " (terminator followed by whitespace) rather than just
  // counting every period, so a decimal in a stat like "38.7%" doesn't get
  // mistaken for one, which was silently rejecting otherwise good
  // suggestions that referenced a specific number
  if (/[.?!](\s|$)/.test(text.slice(0, -1))) return false
  return true
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  const messages = req.body?.messages
  const messagesValid =
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.length <= MAX_HISTORY_MESSAGES &&
    messages.every(isValidMessage)

  // EXPERIMENTAL, local-only: every question the visitor has actually
  // asked AND every suggestion already shown this session (see
  // OvidChat.tsx), so this can actively avoid repeating one instead of
  // only ever seeing the current message in isolation. Capped defensively;
  // a real session is never going to approach this many entries.
  const rawAlreadyCovered = req.body?.alreadyCovered
  const alreadyCovered: string[] = Array.isArray(rawAlreadyCovered)
    ? rawAlreadyCovered.filter((s): s is string => typeof s === 'string').slice(-30)
    : []

  if (!apiKey || !messagesValid) {
    res.status(200).json({ suggestion: pickFallbackSuggestion(messagesValid ? messages : [], alreadyCovered) })
    return
  }

  // presented as an inline transcript inside one user turn, not as the
  // real chat messages with real user/assistant roles — with only a bare
  // question and no reply yet (the common case, since this fires before
  // the answer exists), passing it as an actual trailing user message made
  // the model just answer it directly instead of suggesting a follow-up,
  // since nothing marked this apart from a normal chat turn
  const transcript = messages.map((m: ChatMessage) => `${m.role === 'user' ? 'Visitor' : 'Ovid'}: ${m.content}`).join('\n')
  const alreadyCoveredBlock =
    alreadyCovered.length > 0
      ? `\n\nQuestions already asked or suggested earlier in this same session (never repeat or closely rephrase any of these):\n${alreadyCovered.map((s) => `- ${s}`).join('\n')}`
      : ''

  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://joeypescatore.com',
        'X-Title': "Joey Pescatore's Portfolio (suggestion)",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: SUGGESTION_MAX_TOKENS,
        stream: false,
        messages: [
          { role: 'system', content: OVID_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Here is a conversation transcript between a visitor and Ovid, Joey Pescatore's portfolio assistant:\n\n${transcript}${alreadyCoveredBlock}\n\n${OVID_SUGGESTION_TASK}`,
          },
        ],
      }),
      // this is a nice-to-have, never worth making the visitor wait on —
      // if it hasn't come back quickly, just drop it
      signal: AbortSignal.timeout(6000),
    })

    if (!upstream.ok) {
      res.status(200).json({ suggestion: pickFallbackSuggestion(messages, alreadyCovered) })
      return
    }

    const data = await upstream.json()
    const suggestion = data?.choices?.[0]?.message?.content?.trim()
    // backstop for the "never repeat" instruction above in case the model
    // ignores it anyway — an exact match or a close rephrasing (see
    // isTooSimilar) of anything already asked/suggested this session gets
    // treated the same as any other invalid suggestion, falling back
    // rather than showing something that reads as a repeat
    const isRepeat = typeof suggestion === 'string' && alreadyCovered.some((prev) => isTooSimilar(prev, suggestion))
    const valid = typeof suggestion === 'string' && isValidSuggestion(suggestion) && !isRepeat
    res.status(200).json({ suggestion: valid ? suggestion : pickFallbackSuggestion(messages, alreadyCovered) })
  } catch (err) {
    console.error('suggest endpoint failed', err)
    res.status(200).json({ suggestion: pickFallbackSuggestion(messages, alreadyCovered) })
  }
}
