import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AccessibilityIssue } from "@/lib/scanner/types";

interface AccessibilityReportProps {
  issues: AccessibilityIssue[];
}

function severityVariant(severity: AccessibilityIssue["severity"]): "destructive" | "warning" | "default" | "outline" {
  if (severity === "critical" || severity === "high") {
    return "destructive";
  }

  if (severity === "medium") {
    return "warning";
  }

  if (severity === "low") {
    return "outline";
  }

  return "default";
}

export function AccessibilityReport({ issues }: AccessibilityReportProps) {
  if (issues.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-[#3fb950]">
            No accessibility violations were detected in the scanned files. Keep manual testing in your release flow for
            full coverage.
          </p>
        </CardContent>
      </Card>
    );
  }

  const groupedByFile = issues.reduce<Record<string, AccessibilityIssue[]>>((acc, issue) => {
    if (!acc[issue.filePath]) {
      acc[issue.filePath] = [];
    }

    acc[issue.filePath].push(issue);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groupedByFile).map(([filePath, fileIssues]) => (
        <Card key={filePath}>
          <CardHeader className="border-b border-[#30363d] pb-4">
            <CardTitle className="text-base font-semibold">{filePath}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {fileIssues.map((issue) => (
              <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4" key={issue.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={severityVariant(issue.severity)}>{issue.severity.toUpperCase()}</Badge>
                  <Badge variant="outline">{issue.category}</Badge>
                  <span className="text-xs text-[#8b949e]">{issue.ruleId}</span>
                  {issue.line ? <span className="text-xs text-[#8b949e]">Line {issue.line}</span> : null}
                </div>

                <p className="mt-3 text-sm font-medium text-[#f0f6fc]">{issue.message}</p>
                <p className="mt-1 text-sm text-[#8b949e]">{issue.suggestion}</p>

                {issue.codeSnippet ? (
                  <pre className="mt-3 overflow-x-auto rounded-md border border-[#30363d] bg-[#010409] p-3 text-xs text-[#a5d6ff]">
                    {issue.codeSnippet}
                  </pre>
                ) : null}

                {issue.docsUrl ? (
                  <a
                    className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#58a6ff] hover:text-[#79c0ff]"
                    href={issue.docsUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    WCAG / ARIA guidance
                  </a>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
