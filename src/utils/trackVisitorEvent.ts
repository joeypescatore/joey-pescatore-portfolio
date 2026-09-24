// PostHog client, initialized once in ./posthog — this is for custom
// interaction events (e.g. opened_ovid_chat); see trackPageView.ts for the
// route-change ($pageview) side of things. Still guarded/try-caught: an ad
// blocker or privacy extension can strip PostHog entirely, and this should
// never be able to break the chat UI.
import { posthog } from './posthog'

export function trackVisitorEvent(event: string, properties?: Record<string, unknown>) {
  try {
    posthog.capture(event, properties)
  } catch {
    // never let analytics break the actual feature
  }
}
