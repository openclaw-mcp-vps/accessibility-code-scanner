import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqItems = [
  {
    question: "What does the scanner detect?",
    answer:
      "It analyzes HTML/JSX/TSX source for accessibility failures that impact blind developers: missing alt text, unlabeled form controls, keyboard-inaccessible interactions, focus traps, and invalid ARIA patterns."
  },
  {
    question: "Will this replace manual accessibility testing?",
    answer:
      "No. It is designed as a fast pre-deployment guardrail. You still need manual audits and user testing, but this catches costly regressions before they reach QA or production."
  },
  {
    question: "Who is this built for?",
    answer:
      "Engineering managers and senior developers at startup teams shipping internal tools, IDE extensions, and web apps where accessibility quality is a product requirement."
  },
  {
    question: "How does access work after payment?",
    answer:
      "Checkout uses Stripe hosted payments. After purchase, verify your checkout email once in the dashboard to set your access cookie and unlock the scanner."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-[#30363d] bg-[#11161d]/80 p-6 backdrop-blur-sm sm:p-10">
        <div className="max-w-3xl space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#1f6feb] bg-[#111d2f] px-3 py-1 text-xs font-medium text-[#79c0ff]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Accessibility QA For Engineering Teams
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#f0f6fc] sm:text-5xl">
            Scan code for blind developer accessibility issues before deployment
          </h1>
          <p className="text-base leading-relaxed text-[#8b949e] sm:text-lg">
            Accessibility Code Scanner finds the accessibility bugs that make software unusable for blind developers.
            Detect ARIA violations, keyboard navigation failures, and screen reader blockers in minutes across your
            codebase or GitHub repository.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK} rel="noreferrer" target="_blank">
                Buy Now - $15/mo
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">The Problem</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#8b949e]">
            Most teams ship inaccessible interfaces because blind user workflows are rarely validated in CI and manual
            audits are slow and expensive.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">The Solution</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#8b949e]">
            Run targeted AST-based and markup-level rules to detect actionable accessibility regressions while code is
            still in development.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why Teams Pay</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#8b949e]">
            Save QA cycles, prevent costly accessibility fixes post-launch, and ship inclusive experiences without a
            dedicated accessibility specialist.
          </CardContent>
        </Card>
      </section>

      <section className="mt-14 rounded-2xl border border-[#30363d] bg-[#11161d]/70 p-6 sm:p-10">
        <h2 className="text-2xl font-semibold text-[#f0f6fc] sm:text-3xl">What You Get</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#f0f6fc]">
              <Zap className="h-4 w-4 text-[#58a6ff]" />
              Fast repository scanning
            </p>
            <p className="mt-2 text-sm text-[#8b949e]">
              Upload ZIP archives or connect GitHub repositories to scan up to 160 source files in a single run.
            </p>
          </div>
          <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#f0f6fc]">
              <CheckCircle2 className="h-4 w-4 text-[#3fb950]" />
              Actionable issue reports
            </p>
            <p className="mt-2 text-sm text-[#8b949e]">
              Every finding includes severity, rule ID, affected file path, optional line number, and remediation
              guidance linked to WCAG/ARIA references.
            </p>
          </div>
          <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#f0f6fc]">
              <CheckCircle2 className="h-4 w-4 text-[#3fb950]" />
              Coverage built for blind workflows
            </p>
            <p className="mt-2 text-sm text-[#8b949e]">
              Rules emphasize keyboard behavior, semantic structure, and screen reader compatibility rather than generic
              style-only lint checks.
            </p>
          </div>
          <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#f0f6fc]">
              <CheckCircle2 className="h-4 w-4 text-[#3fb950]" />
              Paywalled production tool
            </p>
            <p className="mt-2 text-sm text-[#8b949e]">
              The scanner is gated behind Stripe checkout and a verified access cookie to keep usage tied to paid
              accounts.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[#8b949e]">
            <p>Single plan optimized for mid-stage startup teams that need practical accessibility enforcement.</p>
            <div className="rounded-xl border border-[#238636] bg-[#0f2d18] p-5">
              <p className="text-xs uppercase tracking-wide text-[#7ee787]">Accessibility Tools Plan</p>
              <p className="mt-1 text-3xl font-bold text-[#f0f6fc]">$15/month</p>
              <ul className="mt-4 space-y-2">
                <li>Repository and ZIP upload scans</li>
                <li>Detailed issue reporting with remediation</li>
                <li>Dashboard scan history</li>
                <li>Cookie-based paid access control</li>
              </ul>
              <Button asChild className="mt-5 w-full sm:w-auto">
                <a href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK} rel="noreferrer" target="_blank">
                  Start Subscription
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqItems.map((item) => (
              <div key={item.question}>
                <h3 className="text-sm font-semibold text-[#f0f6fc]">{item.question}</h3>
                <p className="mt-1 text-sm text-[#8b949e]">{item.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
