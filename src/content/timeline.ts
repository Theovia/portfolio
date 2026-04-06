export interface TimelineEvent {
  year: number
  text: string
  sub: string
  color: [number, number, number]
  accent?: boolean
}

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: 2017,
    text: 'Started Biotech Engineering',
    sub: 'Tec de Monterrey',
    color: [0, 212, 170],
  },
  {
    year: 2019,
    text: 'Exchange Semester',
    sub: 'Colombia',
    color: [68, 136, 255],
  },
  {
    year: 2020,
    text: 'Exchange Semester',
    sub: 'Spain',
    color: [68, 136, 255],
  },
  {
    year: 2022,
    text: 'B.S. Completed',
    sub: '\u201cLeaders of Tomorrow\u201d full scholarship',
    color: [196, 164, 74],
  },
  {
    year: 2022.5,
    text: 'Started M.S. in Applied AI',
    sub: 'Artificial Intelligence',
    color: [170, 102, 255],
  },
  {
    year: 2024,
    text: 'M.S. Completed',
    sub: 'Tec de Monterrey',
    color: [170, 102, 255],
  },
  {
    year: 2025,
    text: 'First AI SaaS in production',
    sub: 'Eigen Medical',
    color: [255, 68, 102],
  },
  {
    year: 2025.5,
    text: 'Built LeadForge',
    sub: 'B2B lead gen platform',
    color: [170, 102, 255],
  },
  {
    year: 2026,
    text: 'Built production ERP in 14 days',
    sub: '3,600 commits. One developer.',
    color: [0, 212, 170],
    accent: true,
  },
  {
    year: 2026.3,
    text: 'Multi-agent AI OS operational',
    sub: 'OpenClaw',
    color: [68, 136, 255],
  },
]
