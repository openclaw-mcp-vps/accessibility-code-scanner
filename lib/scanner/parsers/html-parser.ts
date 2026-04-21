import { load, type CheerioAPI } from "cheerio";

export interface ParsedHtmlDocument {
  $: CheerioAPI;
  content: string;
  lines: string[];
}

export function parseHtml(content: string): ParsedHtmlDocument {
  return {
    $: load(content),
    content,
    lines: content.split(/\r?\n/)
  };
}

export function inferLineNumber(content: string, fragment: string): number | undefined {
  const normalized = fragment.trim();
  if (!normalized) {
    return undefined;
  }

  const index = content.indexOf(normalized);
  if (index === -1) {
    return undefined;
  }

  return content.slice(0, index).split(/\r?\n/).length;
}
