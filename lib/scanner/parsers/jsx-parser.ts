import { parse } from "@babel/parser";
import traverse, { type Visitor } from "@babel/traverse";
import type { File } from "@babel/types";
import { Parser } from "acorn";
import jsx from "acorn-jsx";

export interface ParsedJsxDocument {
  ast: File;
  usedAcornFallback: boolean;
}

export function parseJsx(content: string): ParsedJsxDocument | null {
  try {
    const ast = parse(content, {
      sourceType: "module",
      plugins: [
        "jsx",
        "typescript",
        "classProperties",
        "objectRestSpread",
        "decorators-legacy"
      ],
      errorRecovery: true
    });

    return { ast, usedAcornFallback: false };
  } catch {
    try {
      const AcornParser = Parser.extend(jsx());
      AcornParser.parse(content, {
        ecmaVersion: "latest",
        sourceType: "module",
        locations: true
      });

      return null;
    } catch {
      return null;
    }
  }
}

export function traverseJsx(ast: File, visitor: Visitor): void {
  traverse(ast, visitor);
}
