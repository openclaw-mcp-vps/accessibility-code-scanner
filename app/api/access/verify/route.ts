import { NextResponse } from "next/server";
import { z } from "zod";

import { grantAccessCookies } from "@/lib/auth";
import { hasPurchase } from "@/lib/database";

const bodySchema = z.object({
  email: z.string().email("Enter the same email used during checkout.")
});

export async function POST(request: Request): Promise<NextResponse> {
  let parsedBody: z.infer<typeof bodySchema>;

  try {
    const body = await request.json();
    parsedBody = bodySchema.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  const purchased = await hasPurchase(parsedBody.email);
  if (!purchased) {
    return NextResponse.json(
      {
        error:
          "No completed payment found for that email yet. Finish checkout, then retry after a few seconds."
      },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ ok: true });
  grantAccessCookies(response, parsedBody.email);
  return response;
}
