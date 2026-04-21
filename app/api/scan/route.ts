import { Buffer } from "node:buffer";

import JSZip from "jszip";
import { NextResponse } from "next/server";
import { Octokit } from "octokit";

import { getAccessEmail, hasActiveAccess } from "@/lib/auth";
import { saveScan } from "@/lib/database";
import { scanCodebase } from "@/lib/scanner";
import type { SourceFile } from "@/lib/scanner/types";

export const runtime = "nodejs";

const MAX_FILES = 160;
const MAX_FILE_SIZE_BYTES = 600 * 1024;
const ALLOWED_TEXT_EXTENSIONS = [
  ".html",
  ".htm",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".vue",
  ".svelte",
  ".css"
];

function isSupportedTextFile(path: string): boolean {
  const lowerPath = path.toLowerCase();
  return ALLOWED_TEXT_EXTENSIONS.some((extension) => lowerPath.endsWith(extension));
}

function shouldIgnorePath(path: string): boolean {
  return /(^|\/)(node_modules|dist|build|coverage|\.next|\.git)(\/|$)/.test(path);
}

async function extractUploadedFiles(uploaded: File): Promise<SourceFile[]> {
  const contentBuffer = Buffer.from(await uploaded.arrayBuffer());
  const fileName = uploaded.name.toLowerCase();

  if (fileName.endsWith(".zip") || uploaded.type.includes("zip")) {
    const zip = await JSZip.loadAsync(contentBuffer);
    const files: SourceFile[] = [];

    for (const entry of Object.values(zip.files)) {
      if (entry.dir || shouldIgnorePath(entry.name) || !isSupportedTextFile(entry.name)) {
        continue;
      }

      const content = await entry.async("string");
      if (content.length > MAX_FILE_SIZE_BYTES) {
        continue;
      }

      files.push({ path: entry.name, content });
      if (files.length >= MAX_FILES) {
        break;
      }
    }

    return files;
  }

  const content = contentBuffer.toString("utf8");
  const normalizedName = uploaded.name || "uploaded-file.tsx";

  return [{ path: normalizedName, content }];
}

function parseGithubRepoUrl(url: string): { owner: string; repo: string; branch?: string } {
  const parsedUrl = new URL(url);
  if (parsedUrl.hostname !== "github.com") {
    throw new Error("GitHub URL must use github.com.");
  }

  const segments = parsedUrl.pathname.split("/").filter(Boolean);
  if (segments.length < 2) {
    throw new Error("GitHub URL must include owner and repository name.");
  }

  const owner = segments[0];
  const repo = segments[1].replace(/\.git$/, "");
  let branch: string | undefined;

  if (segments[2] === "tree" && segments[3]) {
    branch = segments[3];
  }

  return { owner, repo, branch };
}

async function fetchGithubFiles(repoUrl: string, token?: string): Promise<SourceFile[]> {
  const { owner, repo, branch } = parseGithubRepoUrl(repoUrl);
  const octokit = new Octokit({ auth: token || undefined });

  const repoInfo = await octokit.rest.repos.get({ owner, repo });
  const branchToUse = branch || repoInfo.data.default_branch;

  const treeResponse = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: branchToUse,
    recursive: "1"
  });

  const blobs = treeResponse.data.tree
    .filter((node) => node.type === "blob" && Boolean(node.path) && Boolean(node.sha))
    .filter((node) => !shouldIgnorePath(node.path ?? ""))
    .filter((node) => isSupportedTextFile(node.path ?? ""))
    .slice(0, MAX_FILES * 2);

  const files: SourceFile[] = [];

  for (const blob of blobs) {
    if (!blob.sha || !blob.path) {
      continue;
    }

    const blobResponse = await octokit.rest.git.getBlob({
      owner,
      repo,
      file_sha: blob.sha
    });

    const rawContent = Buffer.from(blobResponse.data.content, "base64").toString("utf8");
    if (rawContent.length > MAX_FILE_SIZE_BYTES) {
      continue;
    }

    files.push({
      path: blob.path,
      content: rawContent
    });

    if (files.length >= MAX_FILES) {
      break;
    }
  }

  return files;
}

export async function POST(request: Request): Promise<NextResponse> {
  const accessEnabled = await hasActiveAccess();
  if (!accessEnabled) {
    return NextResponse.json(
      { error: "Access locked. Complete checkout and verify your purchase email first." },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const upload = formData.get("archive");
  const githubUrl = String(formData.get("githubUrl") ?? "").trim();
  const githubToken = String(formData.get("githubToken") ?? "").trim();

  let files: SourceFile[] = [];
  let source: "upload" | "github" = "upload";
  let sourceLabel = "Uploaded Code";

  try {
    if (upload instanceof File && upload.size > 0) {
      files = await extractUploadedFiles(upload);
      source = "upload";
      sourceLabel = upload.name;
    } else if (githubUrl) {
      files = await fetchGithubFiles(githubUrl, githubToken || undefined);
      source = "github";
      sourceLabel = githubUrl;
    } else {
      return NextResponse.json(
        {
          error:
            "Provide a ZIP archive or GitHub repository URL to run an accessibility scan."
        },
        { status: 400 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to prepare files for scanning.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (files.length === 0) {
    return NextResponse.json(
      {
        error:
          "No supported source files found. Include HTML/JSX/TSX/JS/TS files in your upload or repository."
      },
      { status: 400 }
    );
  }

  const result = scanCodebase({ files, source, sourceLabel });
  const accessEmail = await getAccessEmail();
  const scanId = await saveScan(result, accessEmail);

  return NextResponse.json({ scanId, result });
}
