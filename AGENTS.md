# AGENTS.md — FIT SUPPLEMENT Project

## Project Overview
FIT SUPPLEMENT เป็นเว็บไซต์ให้ข้อมูลอาหารเสริมสำหรับคนไทยที่เข้าฟิตเนส โดยเน้นความถูกต้อง โปร่งใส และอิงหลักฐานทางวิทยาศาสตร์

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (CSS-based config via `@theme` in globals.css) + tailwind.config.ts for reference
- **Icons**: lucide-react
- **Utilities**: clsx
- **Runtime**: Node.js

## Color System
| Token | Hex | Usage |
|---|---|---|
| `background` | `#0D1110` | Page background |
| `secondary` | `#151B18` | Section backgrounds, nav |
| `card` | `#1B221E` | Card backgrounds |
| `primary` | `#B5F36D` | Accent, CTA, highlights |
| `primary-dark` | `#8BC34A` | Primary hover states |
| `textPrimary` | `#FFFFFF` | Main text |
| `textSecondary` | `#A5AEA8` | Muted/secondary text |
| `border` | `#303A33` | Borders, dividers |

## Project Structure
```
c:\Users\ASUS\Desktop\ggggggg\
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Dark theme + Tailwind v4 @theme
│   │   ├── supplements/
│   │   │   ├── page.tsx        # Supplement listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Supplement detail
│   │   ├── goals/
│   │   │   └── page.tsx        # Goals browser
│   │   ├── calculator/
│   │   │   └── protein/
│   │   │       └── page.tsx    # Protein calculator
│   │   ├── compare/
│   │   │   └── page.tsx        # Side-by-side compare
│   │   ├── safety/
│   │   │   └── page.tsx        # Safety information
│   │   ├── articles/
│   │   │   ├── page.tsx        # Articles listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Article detail
│   │   └── about/
│   │       └── page.tsx        # About page
│   ├── components/
│   │   ├── layout/             # Navbar, Footer, Layout wrappers
│   │   ├── ui/                 # Reusable UI components (Button, Card, Badge...)
│   │   └── supplements/        # Supplement-specific components
│   ├── data/
│   │   ├── supplements.ts      # Supplement data array
│   │   ├── goals.ts            # Goal data array
│   │   ├── articles.ts         # Article data array
│   │   └── references.ts       # Shared references/citations
│   ├── lib/
│   │   └── utils.ts            # cn(), formatDateTH(), calcReadingTime(), etc.
│   └── types/
│       └── index.ts            # TypeScript interfaces: Supplement, Article, Goal, Reference
├── tailwind.config.ts          # Tailwind config (also for IDE intellisense)
├── next.config.ts              # Next.js config (Turbopack + Tailwind)
├── tsconfig.json
└── AGENTS.md                   # This file
```

## TypeScript Interfaces (src/types/index.ts)
- `Reference` — scientific reference/citation
- `Supplement` — full supplement data model
- `Article` — blog/knowledge article
- `Goal` — fitness goal with linked supplements
- `SupplementCategory` — union type for supplement categories
- `GoalType` — union type for goal types
- `EvidenceLevel` — union type: 'strong' | 'moderate' | 'limited' | 'insufficient'

## Data Files (src/data/)
All data is static TypeScript files. No database required for v1.

| File | Exports | Records |
|---|---|---|
| `supplements.ts` | `supplements: Supplement[]` | 8 supplements |
| `goals.ts` | `goals: Goal[]` | 6 goals |
| `articles.ts` | `articles: Article[]` | 7 articles |
| `references.ts` | `siteReferences: Reference[]` | Shared refs |

## Development Rules
1. **Thai-first content**: All user-facing text must be in Thai. English only for technical terms.
2. **Evidence-based**: All supplement claims must be backed by references in the data.
3. **No unsubstantiated marketing**: Do not write content that overstates supplement benefits.
4. **Accessibility**: Use semantic HTML, proper ARIA labels, and color contrast ≥ 4.5:1.
5. **No hardcoded colors**: Always use the CSS token system (e.g., `bg-background`, `text-primary`).
6. **Data integrity**: `slug` values in supplement data must match Goal `relatedSupplements` slugs exactly.
7. **TypeScript strict**: No `any` types. All data must conform to `src/types/index.ts`.
8. **Component naming**: PascalCase for components, camelCase for utilities.
9. **Import alias**: Use `@/` for all project imports (e.g., `import { cn } from '@/lib/utils'`).

## Agent Collaboration Notes
- `@scaffold` owns: initial project setup, folder structure, data files, types, utils
- Future agents should build components in `src/components/` and page implementations in `src/app/`
- Always run `npm run build` to verify TypeScript before marking a task done
