import type { AccessibilityIssueInput } from "@/lib/scanner/types";
import { inferLineNumber, parseHtml } from "@/lib/scanner/parsers/html-parser";
import { parseJsx, traverseJsx } from "@/lib/scanner/parsers/jsx-parser";
import {
  getJsxAttribute,
  getJsxAttributeStringValue,
  getJsxTagName,
  isLikelyInteractiveTag
} from "@/lib/scanner/rules/shared";

function isNonSemanticTag(tagName: string): boolean {
  return ["div", "span", "p", "li", "section", "article"].includes(tagName.toLowerCase());
}

export function runKeyboardNavigationRules(
  filePath: string,
  content: string,
  mode: "html" | "jsx"
): AccessibilityIssueInput[] {
  const issues: AccessibilityIssueInput[] = [];

  if (mode === "html") {
    const { $, content: source } = parseHtml(content);

    $("[onclick]").each((_, element: any) => {
      const tagName = element.name.toLowerCase();
      const attributes = (element.attribs ?? {}) as Record<string, string | undefined>;
      const hasKeyboardHandler =
        Boolean(attributes.onkeydown) || Boolean(attributes.onkeyup) || Boolean(attributes.onkeypress);
      const hasTabIndex = Boolean(attributes.tabindex);
      const html = $.html(element);

      if (!isLikelyInteractiveTag(tagName) && !hasKeyboardHandler) {
        issues.push({
          category: "keyboard",
          ruleId: "keyboard-click-without-keyboard-handler",
          severity: "high",
          message: "Clickable non-interactive element does not provide keyboard handler support.",
          suggestion: "Use a native <button> or add onkeydown/onkeyup with Enter and Space key support.",
          filePath,
          line: inferLineNumber(source, html),
          codeSnippet: html,
          docsUrl: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard"
        });
      }

      if (isNonSemanticTag(tagName) && !hasTabIndex) {
        issues.push({
          category: "keyboard",
          ruleId: "keyboard-clickable-missing-tabindex",
          severity: "medium",
          message: "Clickable custom element is not keyboard-focusable.",
          suggestion: "Add tabindex='0' or switch to a semantic element like <button>.",
          filePath,
          line: inferLineNumber(source, html),
          codeSnippet: html,
          docsUrl: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order"
        });
      }

      if (tagName === "a" && !attributes.href) {
        issues.push({
          category: "keyboard",
          ruleId: "keyboard-anchor-without-href",
          severity: "medium",
          message: "Anchor element with click handler is missing href, reducing keyboard consistency.",
          suggestion: "Provide a valid href or use a <button> for actions.",
          filePath,
          line: inferLineNumber(source, html),
          codeSnippet: html,
          docsUrl: "https://www.w3.org/WAI/WCAG22/Understanding/on-input"
        });
      }
    });

    $("[tabindex]").each((_, element: any) => {
      const html = $.html(element);
      const value = Number.parseInt((element.attribs?.tabindex as string | undefined) ?? "", 10);

      if (!Number.isNaN(value) && value > 0) {
        issues.push({
          category: "keyboard",
          ruleId: "keyboard-positive-tabindex",
          severity: "medium",
          message: "Positive tabindex can create confusing keyboard navigation order.",
          suggestion: "Use tabindex='0' and rely on DOM order for focus sequence.",
          filePath,
          line: inferLineNumber(source, html),
          codeSnippet: html,
          docsUrl: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order"
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
      const onClick = getJsxAttribute(attributes, "onClick");
      const onKeyDown = getJsxAttribute(attributes, "onKeyDown");
      const onKeyUp = getJsxAttribute(attributes, "onKeyUp");
      const onKeyPress = getJsxAttribute(attributes, "onKeyPress");
      const tabIndex = getJsxAttributeStringValue(attributes, "tabIndex");
      const href = getJsxAttribute(attributes, "href");

      if (onClick) {
        const lowerTag = tagName.toLowerCase();
        const isInteractive = isLikelyInteractiveTag(lowerTag);
        const hasKeyboardHandler = Boolean(onKeyDown || onKeyUp || onKeyPress);

        if (!isInteractive && !hasKeyboardHandler) {
          issues.push({
            category: "keyboard",
            ruleId: "keyboard-click-without-keyboard-handler",
            severity: "high",
            message: "Clickable JSX element does not support keyboard events.",
            suggestion: "Handle Enter/Space in onKeyDown or use a semantic <button> element.",
            filePath,
            line: path.node.loc?.start.line,
            codeSnippet: `<${tagName}>`,
            docsUrl: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard"
          });
        }

        if (isNonSemanticTag(lowerTag) && tabIndex == null) {
          issues.push({
            category: "keyboard",
            ruleId: "keyboard-clickable-missing-tabindex",
            severity: "medium",
            message: "Custom clickable JSX element is not keyboard-focusable.",
            suggestion: "Add tabIndex={0} or switch to <button>.",
            filePath,
            line: path.node.loc?.start.line,
            codeSnippet: `<${tagName}>`,
            docsUrl: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order"
          });
        }

        if (lowerTag === "a" && !href) {
          issues.push({
            category: "keyboard",
            ruleId: "keyboard-anchor-without-href",
            severity: "medium",
            message: "Anchor with onClick but no href can be unreliable for keyboard and assistive tech.",
            suggestion: "Use href for navigation or use <button> for action behavior.",
            filePath,
            line: path.node.loc?.start.line,
            codeSnippet: `<${tagName}>`,
            docsUrl: "https://www.w3.org/WAI/WCAG22/Understanding/on-input"
          });
        }
      }

      if (tabIndex != null) {
        const value = Number.parseInt(tabIndex, 10);
        if (!Number.isNaN(value) && value > 0) {
          issues.push({
            category: "keyboard",
            ruleId: "keyboard-positive-tabindex",
            severity: "medium",
            message: "Positive tabIndex creates non-standard focus order.",
            suggestion: "Use tabIndex={0} or natural DOM order.",
            filePath,
            line: path.node.loc?.start.line,
            codeSnippet: `<${tagName}>`,
            docsUrl: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order"
          });
        }
      }
    }
  });

  return issues;
}
