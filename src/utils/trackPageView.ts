// PostHog client, initialized once in ./posthog with capture_pageview
// disabled there — this fires the $pageview event manually on every
// client-side route change instead (see ScrollToTop's effect in App.tsx),
// since a SPA's history-based navigation never triggers a real page load.
import { posthog } from './posthog'

export function trackPageView(path: string) {
  try {
    posthog.capture('$pageview', { path })
  } catch {
    // never let analytics break the actual app
  }
}
