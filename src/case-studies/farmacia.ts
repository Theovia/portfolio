/**
 * Case Study: Farmacia ERP
 *
 * Full-screen overlay content for the Farmacia ERP project.
 * Returns an HTML string using CSS classes defined in main.css
 * (cs-hero, cs-kpis, cs-kpi, cs-section, cs-architecture, etc.)
 *
 * Includes an inline SVG cell signaling pathway diagram that maps
 * the ERP architecture to a signal transduction metaphor.
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

    <div class="cs-architecture">
      <svg
        viewBox="0 0 520 920"
        xmlns="http://www.w3.org/2000/svg"
        style="width:100%; max-width:600px; display:block; margin:0 auto;"
        role="img"
        aria-label="Signal transduction pathway diagram of the Farmacia ERP architecture"
      >
        <defs>
          <filter id="farm-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="farm-edge-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
            <feFlood flood-color="#00d4aa" flood-opacity="0.25" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="farm-arrow" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#00d4aa" opacity="0.7" />
          </marker>
          <linearGradient id="farm-bg-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0a0a12" />
            <stop offset="100%" stop-color="#060610" />
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="520" height="920" fill="url(#farm-bg-grad)" rx="8" />

        <!-- Step 1: Receptor -->
        <g filter="url(#farm-edge-glow)">
          <rect x="60" y="20" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.06)" stroke="#00d4aa" stroke-width="0.8" stroke-opacity="0.5" />
        </g>
        <text x="260" y="42" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">RECEPTOR</text>
        <text x="260" y="63" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#00d4aa" font-weight="500">User Action (POS / Warehouse / Purchasing)</text>

        <!-- Arrow 1 -->
        <line x1="260" y1="84" x2="260" y2="118" stroke="#00d4aa" stroke-width="1" stroke-opacity="0.5" marker-end="url(#farm-arrow)" />
        <text x="268" y="106" font-family="'Inter', sans-serif" font-size="10" fill="#e8e8f066" font-style="italic">ligand binding</text>

        <!-- Step 2: First Messenger -->
        <g filter="url(#farm-edge-glow)">
          <rect x="60" y="120" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.06)" stroke="#00d4aa" stroke-width="0.8" stroke-opacity="0.5" />
        </g>
        <text x="260" y="142" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">FIRST MESSENGER</text>
        <text x="260" y="163" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#00d4aa" font-weight="500">React Frontend (27 pages, 85+ hooks)</text>

        <!-- Arrow 2 -->
        <line x1="260" y1="184" x2="260" y2="218" stroke="#00d4aa" stroke-width="1" stroke-opacity="0.5" marker-end="url(#farm-arrow)" />
        <text x="268" y="206" font-family="'Inter', sans-serif" font-size="10" fill="#e8e8f066" font-style="italic">signal transduction</text>

        <!-- Step 3: G-Protein -->
        <g filter="url(#farm-edge-glow)">
          <rect x="60" y="220" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.06)" stroke="#00d4aa" stroke-width="0.8" stroke-opacity="0.5" />
        </g>
        <text x="260" y="242" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">G-PROTEIN</text>
        <text x="260" y="263" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#00d4aa" font-weight="500">TanStack Query + Supabase Client</text>

        <!-- Arrow 3 -->
        <line x1="260" y1="284" x2="260" y2="318" stroke="#00d4aa" stroke-width="1" stroke-opacity="0.5" marker-end="url(#farm-arrow)" />
        <text x="268" y="306" font-family="'Inter', sans-serif" font-size="10" fill="#e8e8f066" font-style="italic">activation cascade</text>

        <!-- Step 4: Kinase Cascade -->
        <g filter="url(#farm-edge-glow)">
          <rect x="60" y="320" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.06)" stroke="#00d4aa" stroke-width="0.8" stroke-opacity="0.5" />
        </g>
        <text x="260" y="342" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">KINASE CASCADE</text>
        <text x="260" y="363" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#00d4aa" font-weight="500">Supabase Edge Functions (54)</text>

        <!-- Arrow 4 -->
        <line x1="260" y1="384" x2="260" y2="418" stroke="#00d4aa" stroke-width="1" stroke-opacity="0.5" marker-end="url(#farm-arrow)" />
        <text x="268" y="406" font-family="'Inter', sans-serif" font-size="10" fill="#e8e8f066" font-style="italic">phosphorylation</text>

        <!-- Step 5: Second Messenger -->
        <g filter="url(#farm-edge-glow)">
          <rect x="60" y="420" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.06)" stroke="#00d4aa" stroke-width="0.8" stroke-opacity="0.5" />
        </g>
        <text x="260" y="442" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">SECOND MESSENGER</text>
        <text x="260" y="463" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#00d4aa" font-weight="500">PostgreSQL Triggers (13)</text>

        <!-- Arrow 5 -->
        <line x1="260" y1="484" x2="260" y2="518" stroke="#00d4aa" stroke-width="1" stroke-opacity="0.5" marker-end="url(#farm-arrow)" />
        <text x="268" y="506" font-family="'Inter', sans-serif" font-size="10" fill="#e8e8f066" font-style="italic">amplification</text>

        <!-- Step 6: Transcription Factor -->
        <g filter="url(#farm-edge-glow)">
          <rect x="60" y="520" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.06)" stroke="#00d4aa" stroke-width="0.8" stroke-opacity="0.5" />
        </g>
        <text x="260" y="542" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">TRANSCRIPTION FACTOR</text>
        <text x="260" y="563" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="13" fill="#00d4aa" font-weight="500">stock_movements &rarr; stock_quants</text>

        <!-- Arrow 6 -->
        <line x1="260" y1="584" x2="260" y2="618" stroke="#00d4aa" stroke-width="1" stroke-opacity="0.5" marker-end="url(#farm-arrow)" />
        <text x="268" y="606" font-family="'Inter', sans-serif" font-size="10" fill="#e8e8f066" font-style="italic">gene expression</text>

        <!-- Step 7: Protein Output -->
        <g filter="url(#farm-edge-glow)">
          <rect x="60" y="620" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.06)" stroke="#00d4aa" stroke-width="0.8" stroke-opacity="0.5" />
        </g>
        <text x="260" y="642" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">PROTEIN OUTPUT</text>
        <text x="260" y="663" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#00d4aa" font-weight="500">Real-time Stock Update</text>

        <!-- Arrow 7 -->
        <line x1="260" y1="684" x2="260" y2="718" stroke="#00d4aa" stroke-width="1" stroke-opacity="0.5" marker-end="url(#farm-arrow)" />
        <text x="268" y="706" font-family="'Inter', sans-serif" font-size="10" fill="#e8e8f066" font-style="italic">phenotype</text>

        <!-- Step 8: Cellular Response -->
        <g filter="url(#farm-edge-glow)">
          <rect x="60" y="720" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.08)" stroke="#00d4aa" stroke-width="1.2" stroke-opacity="0.7" />
        </g>
        <text x="260" y="742" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">CELLULAR RESPONSE</text>
        <text x="260" y="763" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#e8e8f0" font-weight="600">Inventory Accuracy + POS at 80ms</text>

        <!-- Membrane line decoration at top -->
        <line x1="30" y1="12" x2="490" y2="12" stroke="#c4a44a" stroke-width="0.5" stroke-opacity="0.3" stroke-dasharray="8 4" />
        <text x="260" y="9" text-anchor="middle"
          font-family="'JetBrains Mono', monospace" font-size="7" fill="#c4a44a" fill-opacity="0.3" letter-spacing="0.2em">EXTRACELLULAR</text>

        <!-- Membrane line at bottom -->
        <line x1="30" y1="800" x2="490" y2="800" stroke="#c4a44a" stroke-width="0.5" stroke-opacity="0.3" stroke-dasharray="8 4" />
        <text x="260" y="815" text-anchor="middle"
          font-family="'JetBrains Mono', monospace" font-size="7" fill="#c4a44a" fill-opacity="0.3" letter-spacing="0.2em">PHENOTYPE EXPRESSED</text>

        <!-- Side annotation: signal flow -->
        <text x="35" y="420" text-anchor="middle"
          font-family="'JetBrains Mono', monospace" font-size="7" fill="#5a5a72" letter-spacing="0.15em"
          transform="rotate(-90, 35, 420)">SIGNAL FLOW</text>
      </svg>
      <p style="text-align:center; font-family:'JetBrains Mono', monospace; font-size:10px; color:#5a5a72; letter-spacing:0.08em; margin-top:16px;">
        Signal transduction pathway &mdash; how a user action propagates through the system
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
