"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AccessGate() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function verifyAccess(): Promise<void> {
    setMessage(null);
    setError(null);
    setIsVerifying(true);

    try {
      const response = await fetch("/api/access/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to verify access.");
      }

      setMessage("Access unlocked. Redirecting to scanner...");
      router.push("/scan");
      router.refresh();
    } catch (caughtError) {
      const detail = caughtError instanceof Error ? caughtError.message : "Verification failed.";
      setError(detail);
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unlock Scanner Access</CardTitle>
        <CardDescription>
          Complete checkout, then verify the purchase email to set your access cookie.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#c9d1d9]" htmlFor="purchase-email">
            Purchase Email
          </label>
          <Input
            id="purchase-email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <a href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK} rel="noreferrer" target="_blank">
              Buy Access - $15/mo
            </a>
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={isVerifying || email.trim().length === 0}
            onClick={() => {
              void verifyAccess();
            }}
            type="button"
            variant="outline"
          >
            {isVerifying ? "Verifying..." : "Verify Purchase"}
          </Button>
          <Button asChild className="w-full sm:w-auto" variant="ghost">
            <Link href="/">Back to Landing</Link>
          </Button>
        </div>

        {message ? <p className="rounded-md border border-[#238636] bg-[#0f2d18] p-3 text-sm text-[#7ee787]">{message}</p> : null}
        {error ? <p className="rounded-md border border-[#da3633] bg-[#2d1215] p-3 text-sm text-[#ffb3b8]">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
