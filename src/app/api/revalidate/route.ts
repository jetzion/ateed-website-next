import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";

// The endpoint itself must never be cached.
export const dynamic = "force-dynamic";

/**
 * On-demand revalidation for Contentful edits.
 *
 * Wire a Contentful webhook (Publish/Unpublish events) to POST here with the
 * shared secret in an `x-revalidate-secret` header. Published content then goes
 * live within seconds instead of waiting for the hourly ISR `revalidate`.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CONTENTFUL_REVALIDATE_SECRET;

  // Fail safe: if no secret is configured, the endpoint is disabled so it can
  // never be used to trigger rebuilds anonymously.
  if (!secret) {
    return NextResponse.json(
      { revalidated: false, message: "Revalidation is not configured." },
      { status: 503 },
    );
  }

  // Contentful sends the secret as a custom header; a ?secret= query param is
  // also accepted for manual testing.
  const provided =
    request.headers.get("x-revalidate-secret") ??
    request.nextUrl.searchParams.get("secret");

  if (provided !== secret) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid token." },
      { status: 401 },
    );
  }

  // 1) Refresh the Next.js/origin cache so the page regenerates with new content.
  revalidatePath("/", "layout");

  // 2) Drop CloudFront's edge cache. Without this, the CDN keeps serving the old
  //    HTML until its s-maxage TTL (1h) expires — revalidatePath only updates the
  //    origin. Best-effort: a CloudFront failure must not fail the webhook, since
  //    the origin is already revalidated (the edge would still catch up via TTL).
  const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
  let edgeInvalidated = false;
  if (distributionId) {
    try {
      const cloudfront = new CloudFrontClient({ region: "us-east-1" });
      await cloudfront.send(
        new CreateInvalidationCommand({
          DistributionId: distributionId,
          InvalidationBatch: {
            CallerReference: `contentful-${Date.now()}`,
            Paths: { Quantity: 1, Items: ["/*"] },
          },
        }),
      );
      edgeInvalidated = true;
    } catch (error) {
      // Log server-side only; don't leak details to the caller.
      console.error("CloudFront invalidation failed:", error);
    }
  }

  return NextResponse.json({
    revalidated: true,
    edgeInvalidated,
    now: Date.now(),
  });
}
