export interface TechAtom {
  symbol: string
  name: string
  category: 'core' | 'supporting' | 'specialist'
  color: [number, number, number]
  electrons: number
  projects: string[]
  description: string
}

export const TECH_STACK: TechAtom[] = [
  // Core (large atoms)
  {
    symbol: 'Re',
    name: 'React',
    category: 'core',
    color: [0, 212, 170],
    electrons: 6,
    projects: ['Farmacia ERP', 'LeadForge'],
    description: 'Primary frontend framework. 27-page ERP with 85+ custom hooks.',
  },
  {
    symbol: 'Ts',
    name: 'TypeScript',
    category: 'core',
    color: [68, 136, 255],
    electrons: 5,
    projects: ['Farmacia ERP', 'Eigen Medical', 'LeadForge'],
    description: 'Strict typing across all production systems. 4.9MB in farmacia alone.',
  },
  {
    symbol: 'Sb',
    name: 'Supabase',
    category: 'core',
    color: [0, 212, 170],
    electrons: 7,
    projects: ['Farmacia ERP'],
    description: 'PostgreSQL + Edge Functions + Realtime + Auth. 28+ tables, 54 edge functions.',
  },
  {
    symbol: 'Cl',
    name: 'Claude API',
    category: 'core',
    color: [196, 164, 74],
    electrons: 4,
    projects: ['Eigen Medical', 'OpenClaw', 'LeadForge'],
    description: 'Primary AI model. Sonnet for complex reasoning, Haiku for speed.',
  },
  {
    symbol: 'Pg',
    name: 'PostgreSQL',
    category: 'core',
    color: [68, 136, 255],
    electrons: 8,
    projects: ['Farmacia ERP', 'LeadForge'],
    description: '13 triggers, FEFO lot tracking, ACID transactions. The real backend.',
  },
  {
    symbol: 'Cf',
    name: 'Cloudflare',
    category: 'core',
    color: [255, 68, 102],
    electrons: 5,
    projects: ['Eigen Medical', 'Farmacia ERP'],
    description: 'Workers + D1 + Pages. $0/month hosting for production systems.',
  },

  // Supporting (medium atoms)
  {
    symbol: 'Py',
    name: 'Python',
    category: 'supporting',
    color: [196, 164, 74],
    electrons: 3,
    projects: ['ERP Migration'],
    description: 'ETL pipelines, data transformation, 50+ migration scripts.',
  },
  {
    symbol: 'Vt',
    name: 'Vite',
    category: 'supporting',
    color: [170, 102, 255],
    electrons: 3,
    projects: ['Farmacia ERP', 'LeadForge', 'Portfolio'],
    description: 'Build tool. SWC transforms, code splitting, <2s HMR.',
  },
  {
    symbol: 'Tw',
    name: 'Tailwind',
    category: 'supporting',
    color: [68, 136, 255],
    electrons: 3,
    projects: ['Farmacia ERP', 'LeadForge'],
    description: 'Utility-first CSS with shadcn/ui component library.',
  },
  {
    symbol: 'Dn',
    name: 'Deno',
    category: 'supporting',
    color: [0, 212, 170],
    electrons: 3,
    projects: ['Farmacia ERP', 'Eigen Medical'],
    description: 'Runtime for Supabase Edge Functions and Cloudflare Workers.',
  },

  // Specialist (small atoms)
  {
    symbol: 'Dz',
    name: 'Drizzle',
    category: 'specialist',
    color: [0, 212, 170],
    electrons: 2,
    projects: ['LeadForge'],
    description: 'TypeScript ORM. Type-safe SQL with zero runtime overhead.',
  },
  {
    symbol: 'Fz',
    name: 'Fuse.js',
    category: 'specialist',
    color: [196, 164, 74],
    electrons: 2,
    projects: ['Farmacia ERP'],
    description: 'Fuzzy search across 8,700+ products with pharma-aware matching.',
  },
  {
    symbol: 'Rs',
    name: 'Resend',
    category: 'specialist',
    color: [255, 68, 102],
    electrons: 2,
    projects: ['Eigen Medical', 'LeadForge'],
    description: 'Transactional email. Nurture sequences, digests, alerts.',
  },
  {
    symbol: 'Tq',
    name: 'TanStack Query',
    category: 'specialist',
    color: [255, 68, 102],
    electrons: 2,
    projects: ['Farmacia ERP'],
    description: 'Server state management. Optimistic updates, cache invalidation.',
  },
  {
    symbol: 'Sn',
    name: 'Sentry',
    category: 'specialist',
    color: [170, 102, 255],
    electrons: 2,
    projects: ['Farmacia ERP'],
    description: 'Error monitoring with source map upload in production.',
  },
  {
    symbol: 'Ph',
    name: 'PostHog',
    category: 'specialist',
    color: [68, 136, 255],
    electrons: 2,
    projects: ['Farmacia ERP'],
    description: 'Product analytics. Session replays, feature flags.',
  },
]
