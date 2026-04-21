import type { AccessibilityIssueInput } from "@/lib/scanner/types";
import { inferLineNumber, parseHtml } from "@/lib/scanner/parsers/html-parser";
import { parseJsx, traverseJsx } from "@/lib/scanner/parsers/jsx-parser";
import { getJsxAttribute, getJsxAttributeStringValue, getJsxTagName } from "@/lib/scanner/rules/shared";

function hasHtmlControlLabel(
  $: ReturnType<typeof parseHtml>["$"],
  element: any,
  attributes: Record<string, string | undefined>
): boolean {
  const hasAriaLabel = Boolean(attributes["aria-label"] || attributes["aria-labelledby"]);
  if (hasAriaLabel) {
    return true;
  }

  const wrappedByLabel = $(element).closest("label").length > 0;
  if (wrappedByLabel) {
    return true;
  }

  const elementId = attributes.id;
  if (!elementId) {
    return false;
  }

  const labels = $("label").toArray();
  return labels.some((label) => $(label).attr("for") === elementId);
}

function isHiddenInput(attributes: Record<string, string | undefined>): boolean {
  return (attributes.type ?? "").toLowerCase() === "hidden";
}

export function runScreenReaderRules(
  filePath: string,
  content: string,
  mode: "html" | "jsx"
): AccessibilityIssueInput[] {
  const issues: AccessibilityIssueInput[] = [];

  if (mode === "html") {
    const { $, content: source } = parseHtml(content);

    $("img").each((_, element: any) => {
      const attributes = (element.attribs ?? {}) as Record<string, string | undefined>;
      const html = $.html(element);
      const altText = attributes.alt;

      if (altText == null) {
        issues.push({
          category: "screen-reader",
          ruleId: "screen-reader-missing-alt",
          severity: "high",
          message: "Image is missing alt text.",
          suggestion: "Add meaningful alt text or alt='' only for decorative images.",
          filePath,
          line: inferLineNumber(source, html),
          codeSnippet: html,
          docsUrl: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-content"
        });
      } else if (altText.trim() === "" && attributes.role !== "presentation" && attributes["aria-hidden"] !== "true") {
        issues.push({
          category: "screen-reader",
          ruleId: "screen-reader-empty-alt",
          severity: "medium",
          message: "Image has empty alt text but is not marked decorative.",
          suggestion: "Provide descriptive alt text or mark decorative imagery with role='presentation'.",
          filePath,
          line: inferLineNumber(source, html),
          codeSnippet: html,
          docsUrl: "https://www.w3.org/WAI/tutorials/images/decorative/"
        });
      }
    });

    $("input, select, textarea").each((_, element: any) => {
      const attributes = (element.attribs ?? {}) as Record<string, string | undefined>;
      if (isHiddenInput(attributes)) {
        return;
      }

      const html = $.html(element);
      if (!hasHtmlControlLabel($, element, attributes)) {
        issues.push({
          category: "screen-reader",
          ruleId: "screen-reader-missing-form-label",
          severity: "high",
          message: "Form control is missing an associated label.",
          suggestion: "Associate a <label> with this control or provide aria-label/aria-labelledby.",
          filePath,
          line: inferLineNumber(source, html),
          codeSnippet: html,
          docsUrl: "https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions"
        });
      }
    });

    const headings = $("h1, h2, h3, h4, h5, h6")
      .toArray()
      .map((heading: any) => {
        const level = Number.parseInt(heading.name.replace("h", ""), 10);
        return {
          level,
          html: $.html(heading),
          line: inferLineNumber(source, $.html(heading))
        };
      });

    for (let i = 1; i < headings.length; i += 1) {
      const previous = headings[i - 1];
      const current = headings[i];

      if (current.level - previous.level > 1) {
        issues.push({
          category: "screen-reader",
          ruleId: "screen-reader-heading-order",
          severity: "medium",
          message: `Heading order jumps from h${previous.level} to h${current.level}.`,
          suggestion: "Use sequential heading levels so screen reader users can navigate structure predictably.",
          filePath,
          line: current.line,
          codeSnippet: current.html,
          docsUrl: "https://www.w3.org/WAI/tutorials/page-structure/headings/"
        });
      }
    }

    return issues;
  }

  const parsed = parseJsx(content);
  if (!parsed) {
    return issues;
  }

  const labeledIds = new Set<string>();
  const headingLevels: { level: number; line?: number }[] = [];

  traverseJsx(parsed.ast, {
    JSXOpeningElement(path: any) {
      const tagName = getJsxTagName(path.node);
      if (!tagName) {
        return;
      }

      const lowerTag = tagName.toLowerCase();
      const attributes = path.node.attributes;

      if (lowerTag === "label") {
        const htmlFor = getJsxAttributeStringValue(attributes, "htmlFor");
        if (htmlFor) {
          labeledIds.add(htmlFor);
        }
      }

      if (lowerTag === "img" || tagName === "Image") {
        const alt = getJsxAttributeStringValue(attributes, "alt");
        if (alt == null) {
          issues.push({
            category: "screen-reader",
            ruleId: "screen-reader-missing-alt",
            severity: "high",
            message: "Image component is missing alt text.",
            suggestion: "Add a clear alt string for informative images.",
            filePath,
            line: path.node.loc?.start.line,
            codeSnippet: `<${tagName}>`,
            docsUrl: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-content"
          });
        }
      }

      if (["input", "select", "textarea"].includes(lowerTag)) {
        const type = getJsxAttributeStringValue(attributes, "type")?.toLowerCase();
        if (type === "hidden") {
          return;
        }

        const hasAriaLabel =
          Boolean(getJsxAttribute(attributes, "aria-label")) ||
          Boolean(getJsxAttribute(attributes, "aria-labelledby"));

        const controlId = getJsxAttributeStringValue(attributes, "id");
        const isWrappedByLabel = Boolean(
          path.findParent((parent: any) => {
            if (!parent.isJSXElement()) {
              return false;
            }

            const openingName = parent.node.openingElement.name;
            return openingName.type === "JSXIdentifier" && openingName.name.toLowerCase() === "label";
          })
        );

        if (!hasAriaLabel && !isWrappedByLabel && (!controlId || !labeledIds.has(controlId))) {
          issues.push({
            category: "screen-reader",
            ruleId: "screen-reader-missing-form-label",
            severity: "high",
            message: "Form control is missing an accessible label in JSX.",
            suggestion: "Add <label htmlFor>, wrap with <label>, or set aria-label.",
            filePath,
            line: path.node.loc?.start.line,
            codeSnippet: `<${tagName}>`,
            docsUrl: "https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions"
          });
        }
      }

      if (/^h[1-6]$/.test(lowerTag)) {
        headingLevels.push({
          level: Number.parseInt(lowerTag[1], 10),
          line: path.node.loc?.start.line
        });
      }
    }
  });

  for (let i = 1; i < headingLevels.length; i += 1) {
    const previous = headingLevels[i - 1];
    const current = headingLevels[i];
    if (current.level - previous.level > 1) {
      issues.push({
        category: "screen-reader",
        ruleId: "screen-reader-heading-order",
        severity: "medium",
        message: `Heading order jumps from h${previous.level} to h${current.level}.`,
        suggestion: "Use logical heading hierarchy to improve navigation for screen readers.",
        filePath,
        line: current.line,
        codeSnippet: `h${current.level}`,
        docsUrl: "https://www.w3.org/WAI/tutorials/page-structure/headings/"
      });
    }
  }

  return issues;
}
