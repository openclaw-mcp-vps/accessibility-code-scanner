"use client";

import { useMemo, useState } from "react";
import { Github, LoaderCircle, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ScanResult } from "@/lib/scanner/types";

interface FileUploadProps {
  onScanComplete: (result: ScanResult) => void;
}

type SourceMode = "upload" | "github";

export function FileUpload({ onScanComplete }: FileUploadProps) {
  const [sourceMode, setSourceMode] = useState<SourceMode>("upload");
  const [archive, setArchive] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (isScanning) {
      return false;
    }

    if (sourceMode === "upload") {
      return Boolean(archive);
    }

    return githubUrl.length > 0;
  }, [archive, githubUrl, isScanning, sourceMode]);

  async function handleScan(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsScanning(true);

    try {
      const formData = new FormData();

      if (sourceMode === "upload") {
        if (!archive) {
          throw new Error("Select a ZIP archive to scan.");
        }

        formData.set("archive", archive);
      } else {
        formData.set("githubUrl", githubUrl.trim());
        if (githubToken.trim()) {
          formData.set("githubToken", githubToken.trim());
        }
      }

      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as { error?: string; result?: ScanResult };
      if (!response.ok || !payload.result) {
        throw new Error(payload.error ?? "Accessibility scan failed.");
      }

      onScanComplete(payload.result);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Scan failed.";
      setError(message);
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run An Accessibility Scan</CardTitle>
        <CardDescription>
          Upload a ZIP archive or connect a GitHub repository to find accessibility issues that break workflows for
          blind developers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleScan}>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant={sourceMode === "upload" ? "default" : "outline"}
              onClick={() => setSourceMode("upload")}
            >
              <UploadCloud className="h-4 w-4" />
              Upload ZIP
            </Button>
            <Button
              type="button"
              variant={sourceMode === "github" ? "default" : "outline"}
              onClick={() => setSourceMode("github")}
            >
              <Github className="h-4 w-4" />
              GitHub Repo
            </Button>
          </div>

          {sourceMode === "upload" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#c9d1d9]" htmlFor="archive-input">
                ZIP Archive
              </label>
              <Input
                id="archive-input"
                type="file"
                accept=".zip"
                onChange={(event) => setArchive(event.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-[#8b949e]">
                Upload the repository snapshot as a ZIP. The scanner will inspect up to 160 source files.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#c9d1d9]" htmlFor="github-url">
                  GitHub Repository URL
                </label>
                <Input
                  id="github-url"
                  type="url"
                  placeholder="https://github.com/owner/repository"
                  value={githubUrl}
                  onChange={(event) => setGithubUrl(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#c9d1d9]" htmlFor="github-token">
                  GitHub Token (Optional)
                </label>
                <Input
                  id="github-token"
                  type="password"
                  placeholder="ghp_..."
                  value={githubToken}
                  onChange={(event) => setGithubToken(event.target.value)}
                />
                <p className="text-xs text-[#8b949e]">
                  Add a token to scan private repositories and avoid strict API rate limits.
                </p>
              </div>
            </div>
          )}

          {error ? <p className="rounded-md border border-[#da3633] bg-[#2d1215] p-3 text-sm text-[#ffb3b8]">{error}</p> : null}

          <Button className="w-full sm:w-auto" disabled={!canSubmit} type="submit">
            {isScanning ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              "Run Scan"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
