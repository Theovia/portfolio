/**
 * Case Study: Eigen Medical
 *
 * Full-screen overlay content for the Eigen Medical project.
 * Returns an HTML string using CSS classes defined in main.css
 * (cs-hero, cs-kpis, cs-kpi, cs-section, etc.)
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
