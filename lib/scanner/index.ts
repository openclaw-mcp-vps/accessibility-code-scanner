import { createHash } from "node:crypto";

import { runAriaRules } from "@/lib/scanner/rules/aria-rules";
import { runKeyboardNavigationRules } from "@/lib/scanner/rules/keyboard-nav-rules";
import { runScreenReaderRules } from "@/lib/scanner/rules/screen-reader-rules";
import type { AccessibilityIssue, AccessibilityIssueInput, ScanResult, SourceFile } from "@/lib/scanner/types";

const SCANNABLE_EXTENSIONS = [
  ".html",
  ".htm",
  ".jsx",
  ".tsx",
  ".js",
  ".ts",
  ".vue",
  ".svelte"
];

function isScannableFile(path: string): boolean {
  const normalized = path.toLowerCase();
  return SCANNABLE_EXTENSIONS.some((extension) => normalized.endsWith(extension));
}

function detectMode(path: string): "html" | "jsx" {
  const normalized = path.toLowerCase();
  if (normalized.endsWith(".html") || normalized.endsWith(".htm")) {
    return "html";
  }

  return "jsx";
}

function normalizeIssue(issue: AccessibilityIssueInput): AccessibilityIssue {
  const hash = createHash("sha256")
    .update(`${issue.filePath}:${issue.ruleId}:${issue.line ?? 0}:${issue.message}`)
    .digest("hex")
    .slice(0, 16);

  return {
    ...issue,
    id: hash
  };
}

function severityRank(severity: AccessibilityIssue["severity"]): number {
  if (severity === "critical") {
    return 4;
  }

  if (severity === "high") {
    return 3;
  }

  if (severity === "medium") {
    return 2;
  }

  return 1;
}

export interface ScanCodebaseOptions {
  files: SourceFile[];
  source: "upload" | "github";
  sourceLabel: string;
}

export function scanCodebase({ files, source, sourceLabel }: ScanCodebaseOptions): ScanResult {
  const scannableFiles = files.filter((file) => isScannableFile(file.path));
  const ignoredFiles = files.length - scannableFiles.length;
  const rawIssues: AccessibilityIssueInput[] = [];

  for (const file of scannableFiles) {
    const mode = detectMode(file.path);

    rawIssues.push(...runAriaRules(file.path, file.content, mode));
    rawIssues.push(...runKeyboardNavigationRules(file.path, file.content, mode));
    rawIssues.push(...runScreenReaderRules(file.path, file.content, mode));
  }

  const dedupe = new Map<string, AccessibilityIssue>();
  for (const rawIssue of rawIssues) {
    const issue = normalizeIssue(rawIssue);
    dedupe.set(issue.id, issue);
  }

  const issues = [...dedupe.values()].sort((a, b) => {
    const severityDelta = severityRank(b.severity) - severityRank(a.severity);
    if (severityDelta !== 0) {
      return severityDelta;
    }

    if (a.filePath !== b.filePath) {
      return a.filePath.localeCompare(b.filePath);
    }

    return (a.line ?? 0) - (b.line ?? 0);
  });

  const filesWithIssues = new Set(issues.map((issue) => issue.filePath)).size;

  return {
    scannedAt: new Date().toISOString(),
    source,
    sourceLabel,
    filesScanned: scannableFiles.length,
    ignoredFiles,
    issues,
    summary: {
      totalIssues: issues.length,
      critical: issues.filter((issue) => issue.severity === "critical").length,
      high: issues.filter((issue) => issue.severity === "high").length,
      medium: issues.filter((issue) => issue.severity === "medium").length,
      low: issues.filter((issue) => issue.severity === "low").length,
      filesWithIssues,
      scannedFiles: scannableFiles.length
    }
  };
}
