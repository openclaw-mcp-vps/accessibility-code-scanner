import Link from "next/link";
import { cookies } from "next/headers";

import { AccessGate } from "@/components/access-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCESS_COOKIE_NAME } from "@/lib/auth";
import { listRecentScans } from "@/lib/database";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(ACCESS_COOKIE_NAME)?.value === "granted";
  const accessEmail = cookieStore.get("acscan_email")?.value;

  const scans = hasAccess ? await listRecentScans({ ownerEmail: accessEmail, limit: 12 }) : [];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#f0f6fc]">Scanner Dashboard</h1>
          <p className="mt-2 text-sm text-[#8b949e]">
            Manage paid access, review recent scans, and continue hardening your codebase accessibility posture.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/">Landing</Link>
          </Button>
          <Button asChild>
            <Link href="/scan">Open Scanner</Link>
          </Button>
        </div>
      </div>

      <section className="mt-8">
        {hasAccess ? (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Access Status</CardTitle>
                <Badge variant="success">Active Subscription</Badge>
              </div>
              <CardDescription>
                Access cookie is active{accessEmail ? ` for ${accessEmail}.` : "."} You can run scans on the /scan page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scans.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-[#f0f6fc]">Recent Scans</h2>
                  {scans.map((scan) => (
                    <div
                      className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4"
                      key={scan.id}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-[#f0f6fc]">{scan.sourceLabel}</p>
                        <p className="text-xs text-[#8b949e]">{new Date(scan.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#8b949e]">
                        <span>{scan.filesScanned} files scanned</span>
                        <span>•</span>
                        <span>{scan.issueCount} issues found</span>
                        <span>•</span>
                        <span>
                          {scan.summary.high} high / {scan.summary.medium} medium / {scan.summary.low} low
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#8b949e]">
                  No scans yet. Run your first scan to generate a baseline accessibility report.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <AccessGate />
        )}
      </section>
    </main>
  );
}
