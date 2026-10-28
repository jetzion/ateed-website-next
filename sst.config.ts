// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "ateed-website",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage ?? ""),
      home: "aws",
      providers: {
        aws: {
          region: "us-east-2",
        },
      },
    };
  },

  async run() {
    const contentfulSpaceId = new sst.Secret("ContentfulSpaceId");
    const contentfulAccessToken = new sst.Secret("ContentfulAccessToken");
    const openaiApiKey = new sst.Secret("OpenAiApiKey");
    const resendApiKey = new sst.Secret("ResendApiKey");
    const googlePsiApiKey = new sst.Secret("GooglePsiApiKey");
    const googleSheetWebhookUrl = new sst.Secret("GoogleSheetWebhookUrl");
    const imageGenSecret = new sst.Secret("ImageGenSecret");
    const googleAiApiKey = new sst.Secret("GoogleAiApiKey");
    const auditNotificationEmail = new sst.Secret(
      "AuditNotificationEmail",
      "sales@ateedtech.com",
    );
    // Shared secret for the Contentful on-demand revalidation webhook. Empty
    // default keeps deploys working until it's set:
    //   sst secret set ContentfulRevalidateSecret <value> --stage production
    const contentfulRevalidateSecret = new sst.Secret(
      "ContentfulRevalidateSecret",
      "",
    );

    const isProd = $app.stage === "production";
    const isStaging = $app.stage === "staging";

    // Production attaches www.ateedtech.com via manual DNS at GoDaddy
    // (apex redirect handled via GoDaddy Forwarding, not at AWS).
    // Staging stays on its default CloudFront URL.
    const domain = isProd
      ? {
          name: "www.ateedtech.com",
          dns: false as const,
          cert: "arn:aws:acm:us-east-1:367826605341:certificate/8b524bae-d1cc-4dad-9c07-7aa630d2cbec",
        }
      : undefined;

    const siteUrl = isProd
      ? "https://www.ateedtech.com"
      : isStaging
        ? "https://staging.ateedtech.com"
        : "http://localhost:3000";

    // Production CloudFront distribution (alias www.ateedtech.com). The
    // /api/revalidate webhook invalidates this so Contentful edits clear the
    // CDN edge cache immediately instead of waiting out the 1h s-maxage TTL.
    const prodDistributionId = "E3KDAMVKB2YACU";

    const webAcl = isProd || isStaging ? createApiRateLimitAcl() : undefined;

    new sst.aws.Nextjs("AteedWeb", {
      domain,
      transform: {
        // Attach the rate-limit WAF to the site's CloudFront distribution.
        cdn: (args) => {
          if (!webAcl) return;
          args.transform = {
            ...args.transform,
            distribution: (dist) => {
              dist.webAclId = webAcl.arn;
            },
          };
        },
        // Let the server function invalidate the production distribution.
        server: (args) => {
          if (!isProd) return;
          // SST grants the server's own access via resource links, so this
          // field is unset by default — assigning here adds our policy.
          args.permissions = [
            {
              actions: ["cloudfront:CreateInvalidation"],
              resources: [
                `arn:aws:cloudfront::367826605341:distribution/${prodDistributionId}`,
              ],
            },
          ];
        },
      },
      environment: {
        CONTENTFUL_SPACE_ID: contentfulSpaceId.value,
        CONTENTFUL_ACCESS_TOKEN: contentfulAccessToken.value,
        OPENAI_API_KEY_TEST: openaiApiKey.value,
        RESEND_API_KEY: resendApiKey.value,
        GOOGLE_PSI_API_KEY: googlePsiApiKey.value,
        GOOGLE_SHEET_WEBHOOK_URL: googleSheetWebhookUrl.value,
        IMAGE_GEN_SECRET: imageGenSecret.value,
        GOOGLE_AI_API_KEY: googleAiApiKey.value,
        AUDIT_NOTIFICATION_EMAIL: auditNotificationEmail.value,
        CONTENTFUL_REVALIDATE_SECRET: contentfulRevalidateSecret.value,
        NEXT_PUBLIC_SITE_URL: siteUrl,
        ...(isProd ? { CLOUDFRONT_DISTRIBUTION_ID: prodDistributionId } : {}),
      },
    });
  },
});

/** Per-IP limits on the public API routes, keyed on CloudFront's viewer IP. */
const API_RATE_LIMITS = [
  { name: "chat", path: "/api/chat", limit: 20 },
  { name: "contact", path: "/api/contact", limit: 10 },
  { name: "audit", path: "/api/audit", limit: 10 },
];

/**
 * WAF web ACL that returns 429 when one IP exceeds a route's limit within
 * 10 minutes. CloudFront-scoped ACLs must live in us-east-1.
 */
function createApiRateLimitAcl() {
  const usEast1 = new aws.Provider("UsEast1", { region: "us-east-1" });
  const visibility = (metricName: string) => ({
    cloudwatchMetricsEnabled: true,
    metricName,
    sampledRequestsEnabled: true,
  });

  return new aws.wafv2.WebAcl(
    "ApiRateLimit",
    {
      scope: "CLOUDFRONT",
      defaultAction: { allow: {} },
      visibilityConfig: visibility(`${$app.stage}-api-rate-limit`),
      customResponseBodies: [
        {
          key: "tooManyRequests",
          contentType: "APPLICATION_JSON",
          content: JSON.stringify({
            error: "Too many requests. Please wait a few minutes and try again.",
          }),
        },
      ],
      rules: API_RATE_LIMITS.map(({ name, path, limit }, priority) => ({
        name: `rate-limit-${name}`,
        priority,
        action: {
          block: {
            customResponse: {
              responseCode: 429,
              customResponseBodyKey: "tooManyRequests",
            },
          },
        },
        statement: {
          rateBasedStatement: {
            limit,
            evaluationWindowSec: 600,
            aggregateKeyType: "IP",
            scopeDownStatement: {
              byteMatchStatement: {
                searchString: path,
                positionalConstraint: "STARTS_WITH",
                fieldToMatch: { uriPath: {} },
                textTransformations: [{ priority: 0, type: "LOWERCASE" }],
              },
            },
          },
        },
        visibilityConfig: visibility(`${$app.stage}-rate-limit-${name}`),
      })),
    },
    { provider: usEast1 },
  );
}
