import { NextRequest, NextResponse } from "next/server";
import { formatPSIResults, checkSecurityHeaders } from "@/lib/audit";
import type { AuditRequest } from "@/lib/audit";
import { sendAuditNotification } from "@/lib/email";
import { getClientIP, isWithinRateLimit } from "@/lib/rateLimit";

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  if (!(await isWithinRateLimit("audit", getClientIP(request), 5, 3600))) {
    return NextResponse.json(
      { error: "Too many audit requests. Please try again in an hour." },
      { status: 429 },
    );
  }

  // Parse body
  let body: AuditRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  // Validate
  const { url, name, email, phone, company } = body;
  const strategy =
    (body as { strategy?: string }).strategy === "desktop"
      ? "desktop"
      : "mobile";

  if (!url || !name || !email) {
    return NextResponse.json(
      { error: "URL, name, and email are required." },
      { status: 400 },
    );
  }

  if (
    url.length > 500 ||
    name.length > 80 ||
    email.length > 254 ||
    (phone?.length ?? 0) > 30 ||
    (company?.length ?? 0) > 100
  ) {
    return NextResponse.json(
      { error: "One or more fields are too long." },
      { status: 400 },
    );
  }

  // Normalize URL — add https:// if no protocol
  const normalizedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;

  if (!isValidUrl(normalizedUrl)) {
    return NextResponse.json(
      { error: "Please enter a valid website URL." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    // Fetch PSI and security headers in parallel
    const psiApiKey = process.env.GOOGLE_PSI_API_KEY;
    const psiUrl = new URL(
      "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
    );
    psiUrl.searchParams.set("url", normalizedUrl);
    psiUrl.searchParams.set("strategy", strategy);
    ["PERFORMANCE", "ACCESSIBILITY", "BEST_PRACTICES", "SEO"].forEach((cat) =>
      psiUrl.searchParams.append("category", cat),
    );
    if (psiApiKey) {
      psiUrl.searchParams.set("key", psiApiKey);
    }

    const [psiResponse, securityResponse] = await Promise.allSettled([
      fetch(psiUrl.toString(), { next: { revalidate: 0 } }),
      fetch(normalizedUrl, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      }),
    ]);

    // Handle PSI response
    if (psiResponse.status === "rejected") {
      console.error("PSI fetch failed:", psiResponse.reason);
      return NextResponse.json(
        {
          error:
            "Unable to analyze the website. Please check the URL and try again.",
        },
        { status: 502 },
      );
    }

    const psiRes = psiResponse.value;
    if (!psiRes.ok) {
      const errText = await psiRes.text();
      console.error("PSI API error:", psiRes.status, errText);
      return NextResponse.json(
        {
          error:
            "Unable to analyze the website. The URL may be unreachable or blocked.",
        },
        { status: 502 },
      );
    }

    const psiData = await psiRes.json();

    // Handle security headers (graceful — don't fail if HEAD request fails)
    let securityHeaders: Record<string, boolean> = {
      https: normalizedUrl.startsWith("https://"),
      hsts: false,
      csp: false,
      xFrameOptions: false,
      xContentTypeOptions: false,
      referrerPolicy: false,
    };

    if (securityResponse.status === "fulfilled" && securityResponse.value.ok) {
      securityHeaders = checkSecurityHeaders(
        securityResponse.value.headers,
        normalizedUrl,
      );
    }

    // Format results
    const results = formatPSIResults(psiData, securityHeaders);

    // Fire-and-forget: notify the sales team
    const contact = { url: normalizedUrl, name, email, phone, company };
    sendAuditNotification(contact, results).catch((err) =>
      console.error("Failed to send team audit email:", err),
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Audit API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
