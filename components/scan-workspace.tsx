"use client";

import { useState } from "react";

import { FileUpload } from "@/components/file-upload";
import { ScanResults } from "@/components/scan-results";
import type { ScanResult } from "@/lib/scanner/types";

export function ScanWorkspace() {
  const [result, setResult] = useState<ScanResult | null>(null);

  return (
    <div className="space-y-6">
      <FileUpload onScanComplete={setResult} />
      <ScanResults result={result} />
    </div>
  );
}
