import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ScanResult } from "@/lib/scanner/types";

export interface PurchaseRecord {
  email: string;
  source: "stripe" | "manual";
  createdAt: string;
  eventId?: string;
}

export interface StoredScanRecord {
  id: string;
  ownerEmail?: string;
  createdAt: string;
  source: ScanResult["source"];
  sourceLabel: string;
  filesScanned: number;
  ignoredFiles: number;
  issueCount: number;
  summary: ScanResult["summary"];
  issues: ScanResult["issues"];
}

interface DatabaseStore {
  purchases: PurchaseRecord[];
  scans: StoredScanRecord[];
}

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(STORE_DIR, "store.json");
const EMPTY_STORE: DatabaseStore = { purchases: [], scans: [] };

let writeQueue: Promise<void> = Promise.resolve();

async function ensureStoreFile(): Promise<void> {
  await mkdir(STORE_DIR, { recursive: true });

  try {
    await readFile(STORE_PATH, "utf8");
  } catch {
    await writeFile(STORE_PATH, JSON.stringify(EMPTY_STORE, null, 2), "utf8");
  }
}

async function readStore(): Promise<DatabaseStore> {
  await ensureStoreFile();
  const content = await readFile(STORE_PATH, "utf8");

  try {
    const parsed = JSON.parse(content) as DatabaseStore;
    return {
      purchases: parsed.purchases ?? [],
      scans: parsed.scans ?? []
    };
  } catch {
    return { ...EMPTY_STORE };
  }
}

async function writeStore(store: DatabaseStore): Promise<void> {
  await ensureStoreFile();
  const tmpPath = `${STORE_PATH}.tmp`;
  await writeFile(tmpPath, JSON.stringify(store, null, 2), "utf8");
  await rename(tmpPath, STORE_PATH);
}

async function mutateStore(mutator: (store: DatabaseStore) => void): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    const store = await readStore();
    mutator(store);
    await writeStore(store);
  });

  await writeQueue;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function addPurchase(purchase: PurchaseRecord): Promise<void> {
  const normalizedEmail = normalizeEmail(purchase.email);

  await mutateStore((store) => {
    const exists = store.purchases.some((entry) => normalizeEmail(entry.email) === normalizedEmail);

    if (!exists) {
      store.purchases.push({
        ...purchase,
        email: normalizedEmail,
        createdAt: purchase.createdAt || new Date().toISOString()
      });
    }
  });
}

export async function hasPurchase(email: string): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  const store = await readStore();

  return store.purchases.some((entry) => normalizeEmail(entry.email) === normalizedEmail);
}

export async function saveScan(scan: ScanResult, ownerEmail?: string): Promise<string> {
  const recordId = randomUUID();

  await mutateStore((store) => {
    store.scans.unshift({
      id: recordId,
      ownerEmail: ownerEmail ? normalizeEmail(ownerEmail) : undefined,
      createdAt: new Date().toISOString(),
      source: scan.source,
      sourceLabel: scan.sourceLabel,
      filesScanned: scan.filesScanned,
      ignoredFiles: scan.ignoredFiles,
      issueCount: scan.summary.totalIssues,
      summary: scan.summary,
      issues: scan.issues
    });

    if (store.scans.length > 100) {
      store.scans = store.scans.slice(0, 100);
    }
  });

  return recordId;
}

export async function listRecentScans(options?: {
  ownerEmail?: string;
  limit?: number;
}): Promise<StoredScanRecord[]> {
  const store = await readStore();
  const limit = options?.limit ?? 20;

  if (options?.ownerEmail) {
    const normalizedEmail = normalizeEmail(options.ownerEmail);
    return store.scans
      .filter((record) => record.ownerEmail === normalizedEmail)
      .slice(0, limit);
  }

  return store.scans.slice(0, limit);
}
