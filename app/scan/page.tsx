import { redirect } from "next/navigation";

import { ScanWorkspace } from "@/components/scan-workspace";
import { hasActiveAccess } from "@/lib/auth";

export default async function ScanPage() {
  const accessEnabled = await hasActiveAccess();

  if (!accessEnabled) {
    redirect("/dashboard?locked=1");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#f0f6fc]">Accessibility Scanner</h1>
        <p className="mt-2 text-sm text-[#8b949e]">
          Analyze your source code for accessibility defects that disproportionately impact blind developers.
        </p>
      </div>
      <ScanWorkspace />
    </main>
  );
}
