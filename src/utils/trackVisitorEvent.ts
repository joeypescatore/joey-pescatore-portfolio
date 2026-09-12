// visitors.now (see the script tag in index.html) exposes a global
// `visitors.track(event, properties?)` for custom events — it's a plain,
// non-async, non-deferred <script> in <head> before our own bundle loads,
// so window.visitors is always defined by the time this ever runs. Still
// guarded/try-caught: an ad blocker or privacy extension can strip the
// script entirely, and this should never be able to break the chat UI.
declare global {
  interface Window {
    visitors?: {
      track: (event: string, properties?: Record<string, unknown>) => void
    }
  }
}

export function trackVisitorEvent(event: string, properties?: Record<string, unknown>) {
  try {
    window.visitors?.track(event, properties)
  } catch {
    // never let analytics break the actual feature
  }
}
