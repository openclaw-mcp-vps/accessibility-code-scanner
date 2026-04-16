import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AccessScan — Accessibility Code Scanner for Blind Developers",
  description: "Scan your code for accessibility issues that impact blind developers. Get actionable reports on alt text, variable naming, and code comments."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0d1117] text-[#c9d1d9] min-h-screen">{children}</body>
    </html>
  );
}
