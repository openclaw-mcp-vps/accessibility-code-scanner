import { AlertCircle, CheckCircle2, FileCode2, FolderSearch, Radar } from "lucide-react";

import { AccessibilityReport } from "@/components/accessibility-report";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScanResult } from "@/lib/scanner/types";

interface ScanResultsProps {
  result: ScanResult | null;
}

export function ScanResults({ result }: ScanResultsProps) {
  if (!result) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-[#8b949e]">
            Run a scan to generate file-by-file accessibility findings, severity scoring, and practical remediation
            guidance.
          </p>
        </CardContent>
      </Card>
    );
  }

  const issueDensity = result.filesScanned > 0 ? (result.summary.totalIssues / result.filesScanned).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Scan Summary</CardTitle>
            <Badge variant={result.summary.totalIssues > 0 ? "warning" : "success"}>
              {result.summary.totalIssues > 0 ? "Needs Attention" : "Accessible Baseline"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
              <p className="flex items-center gap-2 text-xs text-[#8b949e]">
                <FolderSearch className="h-3.5 w-3.5" />
                Source
              </p>
              <p className="mt-1 text-sm font-medium text-[#f0f6fc]">{result.sourceLabel}</p>
            </div>
            <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
              <p className="flex items-center gap-2 text-xs text-[#8b949e]">
                <FileCode2 className="h-3.5 w-3.5" />
                Files Scanned
              </p>
              <p className="mt-1 text-sm font-medium text-[#f0f6fc]">{result.filesScanned}</p>
            </div>
            <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
              <p className="flex items-center gap-2 text-xs text-[#8b949e]">
                <Radar className="h-3.5 w-3.5" />
                Total Issues
              </p>
              <p className="mt-1 text-sm font-medium text-[#f0f6fc]">{result.summary.totalIssues}</p>
            </div>
            <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
              <p className="flex items-center gap-2 text-xs text-[#8b949e]">
                <AlertCircle className="h-3.5 w-3.5" />
                Issue Density
              </p>
              <p className="mt-1 text-sm font-medium text-[#f0f6fc]">{issueDensity} / file</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border border-[#da3633] bg-[#2d1215] p-3 text-center">
              <p className="text-xs text-[#ffb3b8]">High</p>
              <p className="text-lg font-semibold text-[#ff7b72]">{result.summary.high}</p>
            </div>
            <div className="rounded-md border border-[#9e6a03] bg-[#2a1d0b] p-3 text-center">
              <p className="text-xs text-[#f2cc60]">Medium</p>
              <p className="text-lg font-semibold text-[#f2cc60]">{result.summary.medium}</p>
            </div>
            <div className="rounded-md border border-[#30363d] bg-[#161b22] p-3 text-center">
              <p className="text-xs text-[#8b949e]">Low</p>
              <p className="text-lg font-semibold text-[#c9d1d9]">{result.summary.low}</p>
            </div>
            <div className="rounded-md border border-[#238636] bg-[#0f2d18] p-3 text-center">
              <p className="text-xs text-[#7ee787]">Files Clean</p>
              <p className="text-lg font-semibold text-[#7ee787]">
                {Math.max(result.filesScanned - result.summary.filesWithIssues, 0)}
              </p>
            </div>
          </div>

          {result.summary.totalIssues === 0 ? (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-[#238636] bg-[#0f2d18] p-3 text-sm text-[#7ee787]">
              <CheckCircle2 className="h-4 w-4" />
              No blocking issues found in this scan.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <AccessibilityReport issues={result.issues} />
    </div>
  );
}
