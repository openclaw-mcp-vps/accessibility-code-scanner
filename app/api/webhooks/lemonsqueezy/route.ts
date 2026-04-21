import { NextResponse } from "next/server";

import { addPurchase } from "@/lib/database";
import {
  extractPurchaseEmail,
  isSuccessfulPurchaseEvent,
  parseStripeEvent,
  verifyStripeWebhookSignature
} from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const payload = await request.text();
  const signatureHeader = request.headers.get("stripe-signature");

  const isValidSignature = verifyStripeWebhookSignature({
    payload,
    signatureHeader,
    secret: webhookSecret
  });

  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const event = parseStripeEvent(payload);

  if (isSuccessfulPurchaseEvent(event)) {
    const email = extractPurchaseEmail(event);
    if (email) {
      await addPurchase({
        email,
        source: "stripe",
        createdAt: new Date().toISOString(),
        eventId: event.id
      });
    }
  }

  return NextResponse.json({ received: true });
}
