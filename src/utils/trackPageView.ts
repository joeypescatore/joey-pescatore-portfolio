// Google Analytics (see the gtag.js snippet in index.html) — send_page_view
// is off there since this is a client-side routed SPA, so this fires the
// page_view manually on every route change instead. Same defensive shape as
// trackVisitorEvent: gtag is a plain global set up before our bundle loads,
// but still guarded so an ad blocker or privacy extension can never break
// the app.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackPageView(path: string) {
  try {
    window.gtag?.('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    })
  } catch {
    // never let analytics break the actual app
  }
}
