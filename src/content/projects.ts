export interface Project {
  id: string
  name: string
  organelle: string
  oneLiner: string
  keyMetric: string
  color: [number, number, number]
  tier: 1 | 2
  detail: {
    title: string
    subtitle: string
    metrics: { label: string; value: string }[]
    description: string
    stack: string[]
  }
}

export const PROJECTS: Project[] = [
  {
    id: 'farmacia-erp',
    name: 'Farmacia ERP',
    organelle: 'nucleus',
    oneLiner: 'Production ERP replacing legacy system. 27 pages, offline-first POS, trigger-driven stock.',
    keyMetric: '3,600 commits. One developer.',
    color: [0, 212, 170],
    tier: 1,
    detail: {
      title: 'Farmacia ERP',
      subtitle: 'NUCLEUS // PRODUCTION SYSTEM',
      metrics: [
        { label: 'COMMITS', value: '3,600' },
        { label: 'PAGES', value: '27' },
        { label: 'EDGE FUNCTIONS', value: '54' },
        { label: 'PRODUCTS', value: '8,700+' },
        { label: 'DB TRIGGERS', value: '13' },
        { label: 'HOSTING COST', value: '$0/mo' },
      ],
      description:
        'Full ERP for a retail pharmacy with 23 employees. Replaced a legacy Windows POS + Odoo ERP. ' +
        'Trigger-driven stock pipeline (13 PostgreSQL triggers, FEFO lot tracking, ACID transactions). ' +
        'Offline-first POS with service worker + IndexedDB. AI-powered supplier offer analysis. ' +
        'Predictive restocking reduced emergency requests from ~50/day to ~2-3/day. ' +
        'POS latency went from 4 seconds (Odoo) to 80ms. 81.6% of 87 legacy processes digitized. ' +
        '210+ architectural decisions documented.',
      stack: [
        'React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Cloudflare Pages',
        'TanStack Query', 'Tailwind', 'Gemini', 'Sentry', 'PostHog',
      ],
    },
  },
  {
    id: 'eigen-medical',
    name: 'Eigen Medical',
    organelle: 'mitochondria',
    oneLiner: 'AI SaaS for medical practice. Chatbot, lead scoring, closed-loop ad attribution.',
    keyMetric: 'Ad click \u2192 consultation \u2192 surgery. Full loop tracked.',
    color: [255, 68, 102],
    tier: 1,
    detail: {
      title: 'Eigen Medical',
      subtitle: 'MITOCHONDRIA // REVENUE ENGINE',
      metrics: [
        { label: 'AI MODELS', value: '2' },
        { label: 'SCORING SIGNALS', value: '20+' },
        { label: 'LANDING PAGES', value: '8 (EN/ES)' },
        { label: 'NURTURE EMAILS', value: '7-sequence' },
        { label: 'CHATBOT TOOLS', value: '8' },
        { label: 'ATTRIBUTION', value: 'Closed-loop' },
      ],
      description:
        'AI SaaS platform for a medical practice. AI chatbot handles patient conversations on Messenger ' +
        'with full persona simulation, 8 tools, and prompt injection defense. Two-layer lead scoring: ' +
        'synchronous tool-call signals (0ms latency) + async conversation pattern extraction. ' +
        'Meta Conversions API integration firing events at every stage: Schedule \u2192 Consultation \u2192 ' +
        'Purchase \u2192 Surgery. The clinic knows exactly which ad generated a surgery. ' +
        'Automated reengagement, daily digests, pre-consultation doctor briefs.',
      stack: [
        'Cloudflare Workers', 'D1', 'Claude API', 'Meta CAPI',
        'Resend', 'ManyChat', 'OpenRouter',
      ],
    },
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    organelle: 'ribosome',
    oneLiner: 'Multi-agent AI operating system. 4 autonomous agents with shared memory.',
    keyMetric: 'Self-governing. 12 cron jobs. 210+ decisions.',
    color: [68, 136, 255],
    tier: 2,
    detail: {
      title: 'OpenClaw',
      subtitle: 'RIBOSOMES // THE BUILDER OF BUILDERS',
      metrics: [
        { label: 'AGENTS', value: '4' },
        { label: 'CRON JOBS', value: '12' },
        { label: 'MEMORY CHUNKS', value: '133' },
        { label: 'CHANNELS', value: 'WA + TG' },
      ],
      description:
        'Multi-agent AI operating system with 4 autonomous agents (main, public, scout, strategos). ' +
        'Shared memory with hybrid BM25+vector search. Cross-platform identity linking. ' +
        'Self-governing with health monitoring, session memory indexing, and memory deduplication. ' +
        'Each agent has its own personality, model config, and fallback chains.',
      stack: [
        'Node.js', 'Claude API', 'OpenAI API', 'WhatsApp', 'Telegram',
        'PostgreSQL', 'Embedding Search',
      ],
    },
  },
  {
    id: 'leadforge',
    name: 'LeadForge',
    organelle: 'er',
    oneLiner: 'B2B lead generation. Scraping, waterfall enrichment, multi-region campaigns.',
    keyMetric: '48% \u2192 71% enrichment rate. $0.56 AI cost.',
    color: [170, 102, 255],
    tier: 2,
    detail: {
      title: 'LeadForge',
      subtitle: 'ENDOPLASMIC RETICULUM // THE NETWORK',
      metrics: [
        { label: 'ENRICHMENT', value: '48%\u219271%' },
        { label: 'AI COST', value: '$0.56' },
        { label: 'PACKAGES', value: '6' },
        { label: 'VENDORS', value: '5+' },
      ],
      description:
        'Multi-region B2B lead generation platform. Scrapes Google Maps + Ad Libraries, enriches contacts ' +
        'through a waterfall of vendors (cheapest first), scores leads, and runs campaigns via email/WhatsApp. ' +
        'AI Deep Search recovered 56 leads that all other vendors failed on.',
      stack: [
        'TypeScript', 'Hono', 'Drizzle ORM', 'Railway',
        'Claude API', 'Brave Search', 'Resend',
      ],
    },
  },
  {
    id: 'the-method',
    name: 'The Method',
    organelle: 'golgi',
    oneLiner: 'AI-assisted development. Decision logs. One-person team methodology.',
    keyMetric: '210+ documented decisions. Every system built solo.',
    color: [196, 164, 74],
    tier: 2,
    detail: {
      title: 'The Method',
      subtitle: 'GOLGI APPARATUS // THE APPROACH',
      metrics: [
        { label: 'DECISIONS', value: '210+' },
        { label: 'TEAM SIZE', value: '1' },
        { label: 'SYSTEMS SHIPPED', value: '4' },
        { label: 'METHODOLOGY', value: 'AI-native' },
      ],
      description:
        'Not a project \u2014 the approach. AI-assisted development where Claude is a thinking partner, ' +
        'not a code generator. Every architectural choice documented in numbered decisions (D001-D210+) ' +
        'with problem statement, analysis, solution, and verification. Adversarial QA testing with ' +
        'P0/P1/P2 classification. One engineer producing output equivalent to a 4-6 person team.',
      stack: [
        'Claude Code', 'Decision Logs', 'Adversarial QA',
        'OpenClaw', 'Git', 'Continuous Documentation',
      ],
    },
  },
]

export const getProjectById = (id: string) => PROJECTS.find((p) => p.id === id)
export const getTier1Projects = () => PROJECTS.filter((p) => p.tier === 1)
