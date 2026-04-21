import type { AccessibilityIssueInput } from "@/lib/scanner/types";
import { inferLineNumber, parseHtml } from "@/lib/scanner/parsers/html-parser";
import { parseJsx, traverseJsx } from "@/lib/scanner/parsers/jsx-parser";
import {
  getJsxAttribute,
  getJsxAttributeStringValue,
  getJsxTagName,
  isLikelyInteractiveTag
} from "@/lib/scanner/rules/shared";

const ALLOWED_ARIA_ATTRIBUTES = new Set([
  "aria-activedescendant",
  "aria-atomic",
  "aria-autocomplete",
  "aria-braillelabel",
  "aria-brailleroledescription",
  "aria-busy",
  "aria-checked",
  "aria-colcount",
  "aria-colindex",
  "aria-colindextext",
  "aria-colspan",
  "aria-controls",
  "aria-current",
  "aria-describedby",
  "aria-description",
  "aria-details",
  "aria-disabled",
  "aria-dropeffect",
  "aria-errormessage",
  "aria-expanded",
  "aria-flowto",
  "aria-grabbed",
  "aria-haspopup",
  "aria-hidden",
  "aria-invalid",
  "aria-keyshortcuts",
  "aria-label",
  "aria-labelledby",
  "aria-level",
  "aria-live",
  "aria-modal",
  "aria-multiline",
  "aria-multiselectable",
  "aria-orientation",
  "aria-owns",
  "aria-placeholder",
  "aria-posinset",
  "aria-pressed",
  "aria-readonly",
  "aria-relevant",
  "aria-required",
  "aria-roledescription",
  "aria-rowcount",
  "aria-rowindex",
  "aria-rowindextext",
  "aria-rowspan",
  "aria-selected",
  "aria-setsize",
  "aria-sort",
  "aria-valuemax",
  "aria-valuemin",
  "aria-valuenow",
  "aria-valuetext"
]);

const ROLE_LABEL_REQUIRED = new Set(["button", "link", "menuitem", "switch", "tab"]);

function isFocusableHtmlElement(tagName: string, attributes: Record<string, string | undefined>): boolean {
  const lowerTag = tagName.toLowerCase();
  const tabIndex = attributes.tabindex ?? attributes.tabIndex;
  const parsedTabIndex = tabIndex ? Number.parseInt(tabIndex, 10) : Number.NaN;

  if (!Number.isNaN(parsedTabIndex) && parsedTabIndex >= 0) {
    return true;
  }

  if (["button", "input", "select", "textarea", "summary"].includes(lowerTag)) {
    return true;
  }

  if (lowerTag === "a" && Boolean(attributes.href)) {
    return true;
  }

  return false;
}

function isFocusableJsx(tagName: string, attributes: any[]): boolean {
  if (isLikelyInteractiveTag(tagName)) {
    if (tagName === "a") {
      return Boolean(getJsxAttribute(attributes, "href"));
    }

    return true;
  }

  const tabIndex = getJsxAttributeStringValue(attributes, "tabIndex");
  if (!tabIndex) {
    return false;
  }

  const parsed = Number.parseInt(tabIndex, 10);
  return !Number.isNaN(parsed) && parsed >= 0;
}

export function runAriaRules(filePath: string, content: string, mode: "html" | "jsx"): AccessibilityIssueInput[] {
  const issues: AccessibilityIssueInput[] = [];

  if (mode === "html") {
    const { $, content: source } = parseHtml(content);

    $("*").each((_, element: any) => {
      const attributes = (element.attribs ?? {}) as Record<string, string | undefined>;
      const elementHtml = $.html(element);

      for (const attributeName of Object.keys(attributes)) {
        if (attributeName.startsWith("aria-") && !ALLOWED_ARIA_ATTRIBUTES.has(attributeName)) {
          issues.push({
            category: "aria",
            ruleId: "aria-invalid-attribute",
            severity: "medium",
            message: `Invalid ARIA attribute '${attributeName}' detected.`,
            suggestion: "Use only valid ARIA attributes from the WAI-ARIA specification.",
            filePath,
            line: inferLineNumber(source, elementHtml),
            codeSnippet: elementHtml,
            docsUrl: "https://www.w3.org/TR/wai-aria-1.2/#states_and_properties"
          });
        }
      }

      const role = attributes.role?.trim();
      if (role && ROLE_LABEL_REQUIRED.has(role)) {
        const hasAccessibleName =
          Boolean(attributes["aria-label"]) ||
          Boolean(attributes["aria-labelledby"]) ||
          $(element).text().trim().length > 0;

        if (!hasAccessibleName) {
          issues.push({
            category: "aria",
            ruleId: "aria-role-missing-name",
            severity: "high",
            message: `Element with role='${role}' is missing an accessible name.`,
            suggestion: "Add aria-label, aria-labelledby, or visible text content.",
            filePath,
            line: inferLineNumber(source, elementHtml),
            codeSnippet: elementHtml,
            docsUrl: "https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA14"
          });
        }
      }

      if (attributes["aria-hidden"] === "true" && isFocusableHtmlElement(element.name, attributes)) {
        issues.push({
          category: "aria",
          ruleId: "aria-hidden-focusable",
          severity: "high",
          message: "Focusable element is hidden from screen readers using aria-hidden='true'.",
          suggestion: "Remove aria-hidden or make the element unfocusable.",
          filePath,
          line: inferLineNumber(source, elementHtml),
          codeSnippet: elementHtml,
          docsUrl: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value"
        });
      }
    });

    return issues;
  }

  const parsed = parseJsx(content);
  if (!parsed) {
    return issues;
  }

  traverseJsx(parsed.ast, {
    JSXOpeningElement(path: any) {
      const tagName = getJsxTagName(path.node);
      if (!tagName) {
        return;
      }

      const attributes = path.node.attributes;

      for (const attribute of attributes) {
        if (attribute.type !== "JSXAttribute" || attribute.name.type !== "JSXIdentifier") {
          continue;
        }

        const attributeName = attribute.name.name;
        if (attributeName.startsWith("aria-") && !ALLOWED_ARIA_ATTRIBUTES.has(attributeName)) {
          issues.push({
            category: "aria",
            ruleId: "aria-invalid-attribute",
            severity: "medium",
            message: `Invalid ARIA attribute '${attributeName}' detected.`,
            suggestion: "Replace it with a valid ARIA attribute.",
            filePath,
            line: path.node.loc?.start.line,
            codeSnippet: tagName,
            docsUrl: "https://www.w3.org/TR/wai-aria-1.2/#states_and_properties"
          });
        }
      }

      const role = getJsxAttributeStringValue(attributes, "role");
      if (role && ROLE_LABEL_REQUIRED.has(role)) {
        const hasAccessibleName =
          Boolean(getJsxAttribute(attributes, "aria-label")) ||
          Boolean(getJsxAttribute(attributes, "aria-labelledby"));

        if (!hasAccessibleName && !isLikelyInteractiveTag(tagName.toLowerCase())) {
          issues.push({
            category: "aria",
            ruleId: "aria-role-missing-name",
            severity: "high",
            message: `JSX element with role='${role}' is missing an accessible name.`,
            suggestion: "Add aria-label or aria-labelledby on this element.",
            filePath,
            line: path.node.loc?.start.line,
            codeSnippet: `<${tagName}>`,
            docsUrl: "https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA14"
          });
        }
      }

      const ariaHidden = getJsxAttributeStringValue(attributes, "aria-hidden");
      if (ariaHidden === "true" && isFocusableJsx(tagName.toLowerCase(), attributes)) {
        issues.push({
          category: "aria",
          ruleId: "aria-hidden-focusable",
          severity: "high",
          message: "Focusable JSX element is hidden from screen readers with aria-hidden='true'.",
          suggestion: "Remove aria-hidden or remove keyboard focus from this element.",
          filePath,
          line: path.node.loc?.start.line,
          codeSnippet: `<${tagName}>`,
          docsUrl: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value"
        });
      }
    }
  });

  return issues;
}
