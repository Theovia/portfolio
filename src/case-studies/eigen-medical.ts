/**
 * Case Study: Eigen Medical
 *
 * Full-screen overlay content for the Eigen Medical project.
 * Returns an HTML string using CSS classes defined in main.css
 * (cs-hero, cs-kpis, cs-kpi, cs-section, cs-architecture, etc.)
 *
 * Includes an inline SVG cell signaling pathway diagram that maps
 * the closed-loop attribution system to a signal transduction metaphor.
 */

export function renderEigenMedicalCaseStudy(): string {
  return `
    <div class="cs-hero">
      From ad click to <em>surgery</em>. Every step tracked.
    </div>

    <div class="cs-kpis">
      <div class="cs-kpi">
        <div class="cs-kpi-value">2</div>
        <div class="cs-kpi-label">AI MODELS</div>
      </div>
      <div class="cs-kpi">
        <div class="cs-kpi-value">20+</div>
        <div class="cs-kpi-label">SCORING SIGNALS</div>
      </div>
      <div class="cs-kpi">
        <div class="cs-kpi-value">8</div>
        <div class="cs-kpi-label">LANDING PAGES (EN/ES)</div>
      </div>
      <div class="cs-kpi">
        <div class="cs-kpi-value">7-seq</div>
        <div class="cs-kpi-label">NURTURE EMAILS</div>
      </div>
      <div class="cs-kpi">
        <div class="cs-kpi-value">8</div>
        <div class="cs-kpi-label">CHATBOT TOOLS</div>
      </div>
      <div class="cs-kpi">
        <div class="cs-kpi-value">&check;</div>
        <div class="cs-kpi-label">CLOSED-LOOP ATTRIBUTION</div>
      </div>
    </div>

    <div class="cs-section">
      <div class="cs-section-title">THE CHALLENGE</div>
      <p>
        A plastic surgeon spending hours qualifying leads manually. No way to
        know which ads actually generated surgeries (not just clicks or
        conversations). Generic chatbot with no intelligence &mdash; scripted
        responses, no scoring, no follow-up.
      </p>
    </div>

    <div class="cs-section">
      <div class="cs-section-title">THE SOLUTION</div>
      <p>
        AI chatbot with full persona simulation (Claude Sonnet for complex,
        Haiku for speed), 8 tools, and prompt injection defense. Two-layer lead
        scoring: synchronous tool-call signals at 0ms latency + async
        conversation pattern extraction. Meta Conversions API integration firing
        events at every stage: Schedule &rarr; Consultation &rarr; Purchase
        &rarr; Surgery. Automated reengagement 6-22h after last message. Daily
        clinic digests, pre-consultation doctor briefs, post-surgery review
        requests.
      </p>
    </div>

    <div class="cs-architecture">
      <svg
        viewBox="0 0 520 920"
        xmlns="http://www.w3.org/2000/svg"
        style="width:100%; max-width:600px; display:block; margin:0 auto;"
        role="img"
        aria-label="Signal transduction pathway diagram of the Eigen Medical closed-loop attribution system"
      >
        <defs>
          <filter id="eigen-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="eigen-edge-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
            <feFlood flood-color="#00d4aa" flood-opacity="0.25" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="eigen-feedback-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feFlood flood-color="#c4a44a" flood-opacity="0.3" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="eigen-arrow" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#00d4aa" opacity="0.7" />
          </marker>
          <marker id="eigen-feedback-arrow" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#c4a44a" opacity="0.6" />
          </marker>
          <linearGradient id="eigen-bg-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0a0a12" />
            <stop offset="100%" stop-color="#060610" />
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="520" height="920" fill="url(#eigen-bg-grad)" rx="8" />

        <!-- Step 1: Receptor -->
        <g filter="url(#eigen-edge-glow)">
          <rect x="60" y="20" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.06)" stroke="#00d4aa" stroke-width="0.8" stroke-opacity="0.5" />
        </g>
        <text x="260" y="42" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">RECEPTOR</text>
        <text x="260" y="63" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#00d4aa" font-weight="500">Meta Ad / Landing Page</text>

        <!-- Arrow 1 -->
        <line x1="260" y1="84" x2="260" y2="118" stroke="#00d4aa" stroke-width="1" stroke-opacity="0.5" marker-end="url(#eigen-arrow)" />
        <text x="268" y="106" font-family="'Inter', sans-serif" font-size="10" fill="#e8e8f066" font-style="italic">ligand binding (patient click)</text>

        <!-- Step 2: Ion Channel -->
        <g filter="url(#eigen-edge-glow)">
          <rect x="60" y="120" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.06)" stroke="#00d4aa" stroke-width="0.8" stroke-opacity="0.5" />
        </g>
        <text x="260" y="142" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">ION CHANNEL</text>
        <text x="260" y="163" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#00d4aa" font-weight="500">ManyChat (External Request)</text>

        <!-- Arrow 2 -->
        <line x1="260" y1="184" x2="260" y2="218" stroke="#00d4aa" stroke-width="1" stroke-opacity="0.5" marker-end="url(#eigen-arrow)" />
        <text x="268" y="206" font-family="'Inter', sans-serif" font-size="10" fill="#e8e8f066" font-style="italic">signal transduction</text>

        <!-- Step 3: G-Protein Coupled -->
        <g filter="url(#eigen-edge-glow)">
          <rect x="60" y="220" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.06)" stroke="#00d4aa" stroke-width="0.8" stroke-opacity="0.5" />
        </g>
        <text x="260" y="242" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">G-PROTEIN COUPLED</text>
        <text x="260" y="263" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#00d4aa" font-weight="500">Cloudflare Worker (router.js)</text>

        <!-- Arrow 3 -->
        <line x1="260" y1="284" x2="260" y2="318" stroke="#00d4aa" stroke-width="1" stroke-opacity="0.5" marker-end="url(#eigen-arrow)" />
        <text x="268" y="306" font-family="'Inter', sans-serif" font-size="10" fill="#e8e8f066" font-style="italic">conformational change</text>

        <!-- Step 4: Kinase -->
        <g filter="url(#eigen-edge-glow)">
          <rect x="60" y="320" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.06)" stroke="#00d4aa" stroke-width="0.8" stroke-opacity="0.5" />
        </g>
        <text x="260" y="342" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">KINASE</text>
        <text x="260" y="363" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#00d4aa" font-weight="500">Claude Sonnet / Haiku (AI Chatbot)</text>

        <!-- Arrow 4 -->
        <line x1="260" y1="384" x2="260" y2="418" stroke="#00d4aa" stroke-width="1" stroke-opacity="0.5" marker-end="url(#eigen-arrow)" />
        <text x="268" y="406" font-family="'Inter', sans-serif" font-size="10" fill="#e8e8f066" font-style="italic">phosphorylation (lead scoring)</text>

        <!-- Step 5: Second Messenger -->
        <g filter="url(#eigen-edge-glow)">
          <rect x="60" y="420" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.06)" stroke="#00d4aa" stroke-width="0.8" stroke-opacity="0.5" />
        </g>
        <text x="260" y="442" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">SECOND MESSENGER</text>
        <text x="260" y="463" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#00d4aa" font-weight="500">D1 Database (lead_scores)</text>

        <!-- Arrow 5 -->
        <line x1="260" y1="484" x2="260" y2="518" stroke="#00d4aa" stroke-width="1" stroke-opacity="0.5" marker-end="url(#eigen-arrow)" />
        <text x="268" y="506" font-family="'Inter', sans-serif" font-size="10" fill="#e8e8f066" font-style="italic">signal amplification</text>

        <!-- Step 6: Transcription Factor -->
        <g filter="url(#eigen-edge-glow)">
          <rect x="60" y="520" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.06)" stroke="#00d4aa" stroke-width="0.8" stroke-opacity="0.5" />
        </g>
        <text x="260" y="542" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">TRANSCRIPTION FACTOR</text>
        <text x="260" y="563" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#00d4aa" font-weight="500">Scoring Engine (20+ signals)</text>

        <!-- Arrow 6 -->
        <line x1="260" y1="584" x2="260" y2="618" stroke="#00d4aa" stroke-width="1" stroke-opacity="0.5" marker-end="url(#eigen-arrow)" />
        <text x="268" y="606" font-family="'Inter', sans-serif" font-size="10" fill="#e8e8f066" font-style="italic">gene expression</text>

        <!-- Step 7: Protein Output -->
        <g filter="url(#eigen-edge-glow)">
          <rect x="60" y="620" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.06)" stroke="#00d4aa" stroke-width="0.8" stroke-opacity="0.5" />
        </g>
        <text x="260" y="642" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">PROTEIN OUTPUT</text>
        <text x="260" y="663" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#00d4aa" font-weight="500">Meta CAPI Event</text>

        <!-- Arrow 7 -->
        <line x1="260" y1="684" x2="260" y2="718" stroke="#00d4aa" stroke-width="1" stroke-opacity="0.5" marker-end="url(#eigen-arrow)" />
        <text x="268" y="706" font-family="'Inter', sans-serif" font-size="10" fill="#e8e8f066" font-style="italic">secretion (feedback loop)</text>

        <!-- Step 8: Cellular Response -->
        <g filter="url(#eigen-edge-glow)">
          <rect x="60" y="720" width="400" height="64" rx="6"
            fill="rgba(0,212,170,0.08)" stroke="#00d4aa" stroke-width="1.2" stroke-opacity="0.7" />
        </g>
        <text x="260" y="742" text-anchor="middle"
          font-family="'Space Grotesk', sans-serif" font-size="10" fill="#c4a44a" letter-spacing="0.12em">CELLULAR RESPONSE</text>
        <text x="260" y="763" text-anchor="middle"
          font-family="'Inter', sans-serif" font-size="14" fill="#e8e8f0" font-weight="600">Ad Optimization &rarr; Next Surgery</text>

        <!-- Feedback loop: curved path from Cellular Response back to Receptor -->
        <path d="M 460 752 C 500 752, 510 400, 510 52 C 510 30, 490 20, 470 20"
          fill="none" stroke="#c4a44a" stroke-width="1" stroke-opacity="0.35"
          stroke-dasharray="6 3" marker-end="url(#eigen-feedback-arrow)"
          filter="url(#eigen-feedback-glow)" />
        <text x="505" y="400" text-anchor="middle"
          font-family="'JetBrains Mono', monospace" font-size="7" fill="#c4a44a" fill-opacity="0.5" letter-spacing="0.1em"
          transform="rotate(90, 505, 400)">POSITIVE FEEDBACK LOOP</text>

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
        Signal transduction pathway &mdash; closed-loop attribution from ad click to surgery
      </p>
    </div>

    <div class="cs-section">
      <div class="cs-section-title">THE RESULT</div>
      <p>
        Closed-loop attribution &mdash; the clinic knows exactly which ad
        generated a surgery, not just a conversation. AI handles patient
        conversations 24/7 with tier-aware messaging. Lead scoring calibrated
        from real data (118+ subscribers). Complete nurture automation from first
        contact through 30-day post-surgery follow-up.
      </p>
    </div>

    <div class="cs-stack-grid">
      <span class="stack-tag">Cloudflare Workers</span>
      <span class="stack-tag">D1</span>
      <span class="stack-tag">Claude API</span>
      <span class="stack-tag">Meta CAPI</span>
      <span class="stack-tag">Resend</span>
      <span class="stack-tag">ManyChat</span>
      <span class="stack-tag">OpenRouter</span>
    </div>
  `
}
