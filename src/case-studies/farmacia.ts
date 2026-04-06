/**
 * Case Study: Farmacia ERP
 *
 * Full-screen overlay content for the Farmacia ERP project.
 * Returns an HTML string using CSS classes defined in main.css
 * (cs-hero, cs-kpis, cs-kpi, cs-section, etc.)
 */

export function renderFarmaciaCaseStudy(): string {
  return `
    <div class="cs-hero">
      Built a production ERP in <em>14 days</em>. Alone.
    </div>

    <div class="cs-kpis">
      <div class="cs-kpi">
        <div class="cs-kpi-value">3,600</div>
        <div class="cs-kpi-label">COMMITS</div>
      </div>
      <div class="cs-kpi">
        <div class="cs-kpi-value">27</div>
        <div class="cs-kpi-label">PAGES</div>
      </div>
      <div class="cs-kpi">
        <div class="cs-kpi-value">54</div>
        <div class="cs-kpi-label">EDGE FUNCTIONS</div>
      </div>
      <div class="cs-kpi">
        <div class="cs-kpi-value">8,700+</div>
        <div class="cs-kpi-label">PRODUCTS</div>
      </div>
      <div class="cs-kpi">
        <div class="cs-kpi-value">13</div>
        <div class="cs-kpi-label">DB TRIGGERS</div>
      </div>
      <div class="cs-kpi">
        <div class="cs-kpi-value">$0/mo</div>
        <div class="cs-kpi-label">HOSTING COST</div>
      </div>
    </div>

    <div class="cs-section">
      <div class="cs-section-title">THE CHALLENGE</div>
      <p>
        A retail pharmacy with 23 employees running on a legacy Windows POS +
        Excel spreadsheets. 87 operational processes, most manual. Previous ERP
        attempt (Odoo) added 4 seconds of latency to every sale.
      </p>
    </div>

    <div class="cs-section">
      <div class="cs-section-title">THE SOLUTION</div>
      <p>
        Full ERP built on React + TypeScript + Supabase. Trigger-driven stock
        pipeline (13 PostgreSQL triggers, FEFO lot tracking, ACID transactions).
        Offline-first POS with service worker + IndexedDB. AI-powered supplier
        offer analysis via Telegram bot + Gemini Flash. Predictive restocking
        reduced emergency warehouse requests from ~50/day to ~2-3/day.
      </p>
    </div>

    <div class="cs-section">
      <div class="cs-section-title">THE RESULT</div>
      <p>
        Odoo eliminated entirely. POS latency: 4s &rarr; 80ms. 81.6% of 87
        legacy processes digitized. 210+ architectural decisions documented.
        System running in production daily. Hosting cost: $0/month on Cloudflare
        Pages.
      </p>
    </div>

    <div class="cs-stack-grid">
      <span class="stack-tag">React</span>
      <span class="stack-tag">TypeScript</span>
      <span class="stack-tag">Supabase</span>
      <span class="stack-tag">PostgreSQL</span>
      <span class="stack-tag">Cloudflare Pages</span>
      <span class="stack-tag">Gemini</span>
      <span class="stack-tag">Sentry</span>
      <span class="stack-tag">PostHog</span>
      <span class="stack-tag">TanStack Query</span>
      <span class="stack-tag">Tailwind</span>
    </div>
  `
}
