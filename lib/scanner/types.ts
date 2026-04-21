export type IssueSeverity = "low" | "medium" | "high" | "critical";
export type IssueCategory = "aria" | "keyboard" | "screen-reader";

export interface SourceFile {
  path: string;
  content: string;
}

export interface AccessibilityIssue {
  id: string;
  category: IssueCategory;
  ruleId: string;
  severity: IssueSeverity;
  message: string;
  suggestion: string;
  filePath: string;
  line?: number;
  codeSnippet?: string;
  docsUrl?: string;
}

export type AccessibilityIssueInput = Omit<AccessibilityIssue, "id">;

export interface ScanSummary {
  totalIssues: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  filesWithIssues: number;
  scannedFiles: number;
}

export interface ScanResult {
  scannedAt: string;
  source: "upload" | "github";
  sourceLabel: string;
  filesScanned: number;
  ignoredFiles: number;
  issues: AccessibilityIssue[];
  summary: ScanSummary;
}
