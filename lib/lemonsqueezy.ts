import { createHmac, timingSafeEqual } from "node:crypto";

interface StripeEvent {
  id?: string;
  type?: string;
  data?: {
    object?: Record<string, unknown>;
  };
}

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

function parseStripeSignature(signatureHeader: string): {
  timestamp?: string;
  signatures: string[];
} {
  const entries = signatureHeader.split(",").map((entry) => entry.trim());
  const signatures: string[] = [];
  let timestamp: string | undefined;

  for (const entry of entries) {
    const [key, value] = entry.split("=");
    if (!key || !value) {
      continue;
    }

    if (key === "t") {
      timestamp = value;
    }

    if (key === "v1") {
      signatures.push(value);
    }
  }

  return { timestamp, signatures };
}

export function verifyStripeWebhookSignature(params: {
  payload: string;
  signatureHeader: string | null;
  secret: string;
  toleranceInSeconds?: number;
}): boolean {
  const { payload, signatureHeader, secret, toleranceInSeconds = 300 } = params;

  if (!signatureHeader) {
    return false;
  }

  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const parsedTimestamp = Number.parseInt(timestamp, 10);

  if (Number.isNaN(parsedTimestamp)) {
    return false;
  }

  if (Math.abs(currentTimestamp - parsedTimestamp) > toleranceInSeconds) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  return signatures.some((signature) => safeCompare(signature, expectedSignature));
}

export function parseStripeEvent(payload: string): StripeEvent {
  return JSON.parse(payload) as StripeEvent;
}

export function isSuccessfulPurchaseEvent(event: StripeEvent): boolean {
  return event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded";
}

export function extractPurchaseEmail(event: StripeEvent): string | undefined {
  const object = event.data?.object ?? {};

  const customerEmail = object.customer_email;
  if (typeof customerEmail === "string" && customerEmail.length > 0) {
    return customerEmail;
  }

  const customerDetails = object.customer_details;
  if (typeof customerDetails === "object" && customerDetails !== null) {
    const nestedEmail = (customerDetails as Record<string, unknown>).email;
    if (typeof nestedEmail === "string" && nestedEmail.length > 0) {
      return nestedEmail;
    }
  }

  return undefined;
}
