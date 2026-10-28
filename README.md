# Ateed Tech Website

Marketing site for [ateedtech.com](https://www.ateedtech.com). Next.js 16 (App
Router), Tailwind CSS, GSAP, content from Contentful. Deployed to AWS
(CloudFront + Lambda) with SST.

## Run locally

Create `.env` (or `.env.local`) in the project root:

```bash
CONTENTFUL_SPACE_ID=750wikp5ao9z
CONTENTFUL_ACCESS_TOKEN=<Content Delivery API token>
```

Then:

```bash
npm install
npm run dev        # http://localhost:3000
```

Optional keys (chat, audit, email) are described in
[scripts/SETUP_KEYS.md](scripts/SETUP_KEYS.md). Leave `RESEND_API_KEY` unset
locally so test forms don't email the sales inbox. Rate limiting is off locally.

## Deploy

Deploy from `main` with AWS credentials that can deploy:

```bash
npx sst deploy --stage production
```

Secrets live in SST (`npx sst secret list --stage production`).

## Editing content

All page content is in Contentful (space `750wikp5ao9z`, environment `master`).
Published changes go live within an hour, or immediately if the revalidation
webhook (`/api/revalidate`) is configured.

- **Service order:** each "Our Services" entry has an **Order** number; lowest
  shows first.
