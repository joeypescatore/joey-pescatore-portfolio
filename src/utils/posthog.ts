// Single PostHog client for the whole app. Importing this module (directly
// or via trackVisitorEvent/trackPageView) runs `init` exactly once — module
// evaluation is cached by the JS runtime, so every importer shares the same
// initialized instance.
//
// The project API key below is meant to be public: it's a write-only
// ingestion key (it can send events in, it can't read data out), the same
// way a GA Measurement ID or the old visitors.now token was safe to embed
// directly in client code. The real secrets in this repo (OPENROUTER_API_KEY,
// etc.) stay server-side in api/ and go through env vars instead.
//
// capture_pageview is off because this is a client-side routed SPA — the
// default autocapture only fires on a real page load, so it would only ever
// see the first route. Pageviews are instead sent manually on every route
// change from trackPageView.ts.
import posthog from 'posthog-js'

posthog.init('phc_AyLY4ysXHVNDsTSh5bA6yto9UTvF8ct4LGoExrbEkDoT', {
  api_host: 'https://us.i.posthog.com',
  person_profiles: 'identified_only',
  capture_pageview: false,
})

export { posthog }
