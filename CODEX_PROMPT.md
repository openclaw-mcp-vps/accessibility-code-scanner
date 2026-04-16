# Build Task: accessibility-code-scanner

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: accessibility-code-scanner
HEADLINE: Scan code for blind developer accessibility issues
WHAT: None
WHY: None
WHO PAYS: None
NICHE: accessibility-tools
PRICE: $$15/mo

ARCHITECTURE SPEC:
A Next.js web application that analyzes uploaded code files or GitHub repositories for accessibility issues that specifically impact blind developers, such as missing alt text in documentation, poor variable naming, and inadequate code comments. The tool provides detailed reports with actionable recommendations and integrates with popular development workflows.

PLANNED FILES:
- app/page.tsx
- app/scan/page.tsx
- app/dashboard/page.tsx
- app/api/scan/route.ts
- app/api/webhook/route.ts
- components/FileUpload.tsx
- components/ScanResults.tsx
- components/AccessibilityReport.tsx
- lib/scanner/index.ts
- lib/scanner/rules.ts
- lib/auth.ts
- lib/lemonsqueezy.ts
- lib/database.ts

DEPENDENCIES: next, tailwindcss, @lemonsqueezy/lemonsqueezy.js, next-auth, prisma, @prisma/client, typescript, eslint, @typescript-eslint/parser, acorn, acorn-walk, github-api, file-type, zod

REQUIREMENTS:
- Next.js 15 with App Router (app/ directory)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components (npx shadcn@latest init, then add needed components)
- Dark theme ONLY — background #0d1117, no light mode
- Lemon Squeezy checkout overlay for payments
- Landing page that converts: hero, problem, solution, pricing, FAQ
- The actual tool/feature behind a paywall (cookie-based access after purchase)
- Mobile responsive
- SEO meta tags, Open Graph tags
- /api/health endpoint that returns {"status":"ok"}

ENVIRONMENT VARIABLES (create .env.example):
- NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID
- NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID
- LEMON_SQUEEZY_WEBHOOK_SECRET

After creating all files:
1. Run: npm install
2. Run: npm run build
3. Fix any build errors
4. Verify the build succeeds with exit code 0

Do NOT use placeholder text. Write real, helpful content for the landing page
and the tool itself. The tool should actually work and provide value.


PREVIOUS ATTEMPT FAILED WITH:
Codex exited 1: Reading additional input from stdin...
OpenAI Codex v0.121.0 (research preview)
--------
workdir: /tmp/openclaw-builds/accessibility-code-scanner
model: gpt-5.3-codex
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 019d94fb-62bc-7c10-b45a-92f9564c6078
--------
user
# Build Task: accessibility-code-scanner

Build a complete, production-ready Next.js 15 App Router application.

PROJECT: accessibility-code-scanner
HEADLINE: S
Please fix the above errors and regenerate.