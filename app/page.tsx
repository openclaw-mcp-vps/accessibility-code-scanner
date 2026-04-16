export default function Page() {
  const checks = [
    "Missing alt text in docs & README images",
    "Cryptic variable & function names",
    "Insufficient inline code comments",
    "Unlabeled form fields in UI code",
    "Screen-reader-hostile HTML patterns",
    "GitHub repo deep-scan support",
  ];

  const faqs = [
    {
      q: "What types of files can I scan?",
      a: "Upload any source file (.js, .ts, .py, .html, .md, etc.) or paste a public GitHub repository URL. We analyze code structure, documentation, and markup for blind-developer accessibility gaps.",
    },
    {
      q: "How is this different from standard accessibility checkers?",
      a: "Most tools focus on end-user UI. AccessScan targets the developer experience — variable naming clarity, comment density, and documentation quality that blind developers rely on when reading code with a screen reader.",
    },
    {
      q: "Can I integrate this into my CI/CD pipeline?",
      a: "Yes. Subscribers get an API key and a GitHub Action you can drop into any workflow to block merges that introduce accessibility regressions.",
    },
  ];

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-20">
      {/* Hero */}
      <section className="text-center space-y-6">
        <span className="inline-block bg-[#161b22] border border-[#30363d] text-[#58a6ff] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest">
          Accessibility Tools
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
          Code accessibility,{" "}
          <span className="text-[#58a6ff]">built for blind developers</span>
        </h1>
        <p className="text-lg text-[#8b949e] max-w-xl mx-auto">
          Upload a file or point to a GitHub repo. AccessScan flags every place your code makes life harder for developers who rely on screen readers — and tells you exactly how to fix it.
        </p>
        <a
          href={process.env.NEXT_PUBLIC_LS_CHECKOUT_URL || "#"}
          className="inline-block bg-[#58a6ff] hover:bg-[#79b8ff] text-[#0d1117] font-bold px-8 py-3 rounded-lg transition-colors text-base"
        >
          Start scanning — $15/mo
        </a>
        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {checks.map((c) => (
            <li key={c} className="flex items-start gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-3 text-sm text-[#c9d1d9]">
              <span className="text-[#58a6ff] font-bold mt-0.5">✓</span>
              {c}
            </li>
          ))}
        </ul>
      </section>

      {/* Pricing */}
      <section className="flex justify-center">
        <div className="w-full max-w-sm bg-[#161b22] border border-[#58a6ff] rounded-2xl p-8 space-y-6 text-center shadow-lg shadow-[#58a6ff]/10">
          <p className="text-xs font-semibold text-[#58a6ff] uppercase tracking-widest">Pro Plan</p>
          <div>
            <span className="text-5xl font-extrabold text-white">$15</span>
            <span className="text-[#8b949e] ml-1">/month</span>
          </div>
          <ul className="space-y-2 text-sm text-[#c9d1d9] text-left">
            {["Unlimited file & repo scans", "Detailed per-issue reports", "CI/CD GitHub Action", "API access", "Priority email support"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-[#58a6ff]">✓</span>{f}
              </li>
            ))}
          </ul>
          <a
            href={process.env.NEXT_PUBLIC_LS_CHECKOUT_URL || "#"}
            className="block w-full bg-[#58a6ff] hover:bg-[#79b8ff] text-[#0d1117] font-bold py-3 rounded-lg transition-colors"
          >
            Get started
          </a>
          <p className="text-xs text-[#8b949e]">Cancel anytime. No contracts.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white text-center">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <details key={q} className="bg-[#161b22] border border-[#30363d] rounded-lg px-5 py-4 group">
              <summary className="cursor-pointer font-semibold text-[#c9d1d9] list-none flex justify-between items-center">
                {q}
                <span className="text-[#58a6ff] text-lg">+</span>
              </summary>
              <p className="mt-3 text-sm text-[#8b949e] leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
