# Build Task: accessibility-code-scanner

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: accessibility-code-scanner
HEADLINE: Scan code for blind developer accessibility issues
WHAT: Scans your codebase and flags accessibility issues that make software unusable for blind developers. Detects missing alt text, keyboard navigation problems, screen reader incompatibilities, and ARIA violations in your code before deployment.
WHY: 15% of developers have disabilities, but most teams ship inaccessible code because they don't know what breaks for blind users. Manual accessibility testing is expensive and slow, while automated tools catch only basic issues.
WHO PAYS: Engineering managers and senior developers at mid-stage startups building developer tools, IDEs, or web platforms. Teams that care about inclusive design but lack accessibility expertise or dedicated QA resources.
NICHE: accessibility-tools
PRICE: $$15/mo

ARCHITECTURE SPEC:
A Next.js web app with file upload/GitHub integration that runs accessibility scans using custom AST parsers and accessibility rule engines. Users upload code or connect repositories, receive detailed reports with specific violations and remediation suggestions, and manage scans through a dashboard with tiered access based on Lemon Squeezy subscriptions.

PLANNED FILES:
- app/page.tsx
- app/dashboard/page.tsx
- app/scan/page.tsx
- app/api/scan/route.ts
- app/api/webhooks/lemonsqueezy/route.ts
- components/file-upload.tsx
- components/scan-results.tsx
- components/accessibility-report.tsx
- lib/scanner/index.ts
- lib/scanner/rules/aria-rules.ts
- lib/scanner/rules/keyboard-nav-rules.ts
- lib/scanner/rules/screen-reader-rules.ts
- lib/scanner/parsers/html-parser.ts
- lib/scanner/parsers/jsx-parser.ts
- lib/auth.ts
- lib/database.ts
- lib/lemonsqueezy.ts

DEPENDENCIES: next, tailwindcss, typescript, @lemonsqueezy/lemonsqueezy.js, next-auth, prisma, @prisma/client, cheerio, @babel/parser, @babel/traverse, acorn, acorn-jsx, multer, jszip, octokit, zod, lucide-react

REQUIREMENTS:
- Next.js 15 with App Router (app/ directory)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components (npx shadcn@latest init, then add needed components)
- Dark theme ONLY — background #0d1117, no light mode
- Stripe Payment Link for payments (hosted checkout — use the URL directly as the Buy button href)
- Landing page that converts: hero, problem, solution, pricing, FAQ
- The actual tool/feature behind a paywall (cookie-based access after purchase)
- Mobile responsive
- SEO meta tags, Open Graph tags
- /api/health endpoint that returns {"status":"ok"}
- NO HEAVY ORMs: Do NOT use Prisma, Drizzle, TypeORM, Sequelize, or Mongoose. If the tool needs persistence, use direct SQL via `pg` (Postgres) or `better-sqlite3` (local), or just filesystem JSON. Reason: these ORMs require schema files and codegen steps that fail on Vercel when misconfigured.
- INTERNAL FILE DISCIPLINE: Every internal import (paths starting with `@/`, `./`, or `../`) MUST refer to a file you actually create in this build. If you write `import { Card } from "@/components/ui/card"`, then `components/ui/card.tsx` MUST exist with a real `export const Card` (or `export default Card`). Before finishing, scan all internal imports and verify every target file exists. Do NOT use shadcn/ui patterns unless you create every component from scratch — easier path: write all UI inline in the page that uses it.
- DEPENDENCY DISCIPLINE: Every package imported in any .ts, .tsx, .js, or .jsx file MUST be
  listed in package.json dependencies (or devDependencies for build-only). Before finishing,
  scan all source files for `import` statements and verify every external package (anything
  not starting with `.` or `@/`) appears in package.json. Common shadcn/ui peers that MUST
  be added if used:
  - lucide-react, clsx, tailwind-merge, class-variance-authority
  - react-hook-form, zod, @hookform/resolvers
  - @radix-ui/* (for any shadcn component)
- After running `npm run build`, if you see "Module not found: Can't resolve 'X'", add 'X'
  to package.json dependencies and re-run npm install + npm run build until it passes.

ENVIRONMENT VARIABLES (create .env.example):
- NEXT_PUBLIC_STRIPE_PAYMENT_LINK  (full URL, e.g. https://buy.stripe.com/test_XXX)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  (pk_test_... or pk_live_...)
- STRIPE_WEBHOOK_SECRET  (set when webhook is wired)

BUY BUTTON RULE: the Buy button's href MUST be `process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK`
used as-is — do NOT construct URLs from a product ID, do NOT prepend any base URL,
do NOT wrap it in an embed iframe. The link opens Stripe's hosted checkout directly.

After creating all files:
1. Run: npm install
2. Run: npm run build
3. Fix any build errors
4. Verify the build succeeds with exit code 0

Do NOT use placeholder text. Write real, helpful content for the landing page
and the tool itself. The tool should actually work and provide value.
