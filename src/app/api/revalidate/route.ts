import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

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

  // Small marketing site, and any content type can surface on multiple pages,
  // so refresh everything under the root layout in one shot.
  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
