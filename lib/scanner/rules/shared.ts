import type { JSXAttribute, JSXOpeningElement, JSXSpreadAttribute } from "@babel/types";

const INTERACTIVE_TAGS = new Set(["button", "a", "input", "select", "textarea", "summary"]);

export function isLikelyInteractiveTag(tagName: string): boolean {
  return INTERACTIVE_TAGS.has(tagName);
}

export function getJsxAttribute(
  attributes: (JSXAttribute | JSXSpreadAttribute)[],
  name: string
): JSXAttribute | undefined {
  return attributes.find(
    (attribute): attribute is JSXAttribute =>
      attribute.type === "JSXAttribute" && attribute.name.type === "JSXIdentifier" && attribute.name.name === name
  );
}

export function getJsxAttributeStringValue(
  attributes: (JSXAttribute | JSXSpreadAttribute)[],
  name: string
): string | undefined {
  const attribute = getJsxAttribute(attributes, name);
  if (!attribute || attribute.value == null) {
    return undefined;
  }

  if (attribute.value.type === "StringLiteral") {
    return attribute.value.value;
  }

  if (attribute.value.type === "JSXExpressionContainer") {
    const expression = attribute.value.expression;

    if (expression.type === "StringLiteral") {
      return expression.value;
    }

    if (expression.type === "NumericLiteral") {
      return `${expression.value}`;
    }

    if (expression.type === "BooleanLiteral") {
      return `${expression.value}`;
    }
  }

  return undefined;
}

export function getJsxTagName(node: JSXOpeningElement): string | undefined {
  if (node.name.type === "JSXIdentifier") {
    return node.name.name;
  }

  return undefined;
}
