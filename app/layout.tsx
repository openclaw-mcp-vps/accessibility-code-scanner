import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "700"]
});

const bodyFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL("https://accessibility-code-scanner.dev"),
  title: {
    default: "Accessibility Code Scanner",
    template: "%s | Accessibility Code Scanner"
  },
  description:
    "Scan codebases for accessibility blockers that make software unusable for blind developers. Detect ARIA mistakes, keyboard traps, and screen reader issues before deployment.",
  openGraph: {
    type: "website",
    title: "Accessibility Code Scanner",
    description:
      "Find blind-developer accessibility issues in code before they ship: alt text gaps, keyboard failures, ARIA violations, and screen reader incompatibilities.",
    url: "https://accessibility-code-scanner.dev",
    siteName: "Accessibility Code Scanner"
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility Code Scanner",
    description:
      "Production-focused accessibility scanning for engineering teams building web and developer platforms."
  },
  keywords: [
    "accessibility scanner",
    "WCAG code analysis",
    "ARIA linting",
    "keyboard navigation testing",
    "blind developer accessibility"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} bg-[#0d1117] text-[#c9d1d9] antialiased`}>
        <div className="relative min-h-screen overflow-x-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(31,111,235,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(35,134,54,0.2),transparent_35%),linear-gradient(180deg,#0d1117_0%,#0a0e14_100%)]" />
          {children}
        </div>
      </body>
    </html>
  );
}
