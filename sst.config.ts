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

    new sst.aws.Nextjs("AteedWeb", {
      domain,
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
      },
    });
  },
});
