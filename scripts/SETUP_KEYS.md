# API Key Setup Guide

This project uses several external APIs. Below are step-by-step instructions for obtaining each key.

---

## Environment Variables

For local development, create `.env` or `.env.local` in the project root (both
are gitignored). Only the Contentful keys are required:

```env
CONTENTFUL_SPACE_ID=750wikp5ao9z
CONTENTFUL_ACCESS_TOKEN=...
OPENAI_API_KEY_TEST=sk-proj-...
GOOGLE_PSI_API_KEY=AIza...
RESEND_API_KEY=re_...
AUDIT_NOTIFICATION_EMAIL=sales@ateedtech.com
```

In production these come from SST secrets, not env files:
`npx sst secret set <Name> <value> --stage production` (names are in
`sst.config.ts`).

---

## 0. `CONTENTFUL_SPACE_ID` / `CONTENTFUL_ACCESS_TOKEN` — Content (required)

1. Go to [app.contentful.com](https://app.contentful.com/) and open the space
   whose URL contains `/spaces/750wikp5ao9z`
2. **Settings → API keys** → open a key (or **Add API key**)
3. Copy the **Content Delivery API – access token** (not the Preview token)

---

## 1. `OPENAI_API_KEY_TEST` — AI Chatbot

Used by the AI chat widget (`/api/chat`).

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** in the left sidebar
4. Click **Create new secret key**, give it a name (e.g., "ateed-website")
5. Copy the key — it starts with `sk-proj-`

**Pricing:** Pay-per-token. See [openai.com/pricing](https://openai.com/pricing).

---

## 2. `GOOGLE_PSI_API_KEY` — Website Audit (PageSpeed Insights)

Used by the Free Website Audit feature (`/api/audit`). Optional but strongly recommended — without it, you're limited to 25 requests/day instead of 25,000/day.

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services → Library**
4. Search for **PageSpeed Insights API** and click **Enable**
5. Go to **APIs & Services → Credentials**
6. Click **Create Credentials → API Key**
7. Copy the key — it starts with `AIza`
8. (Recommended) Click **Restrict Key** and limit it to the PageSpeed Insights API

**Pricing:** Free tier covers 25,000 requests/day.

---

## 3. `RESEND_API_KEY` — Email Notifications

Used to send lead notifications (audits and chat contacts) to the sales inbox.
Visitors are never emailed. Leave this unset locally: without it, emails are
skipped with a console warning instead of reaching the real inbox.

1. Go to [resend.com](https://resend.com/) and create an account
2. Navigate to **API Keys** in the sidebar
3. Click **Create API Key**, select **Sending access** permission
4. Copy the key — it starts with `re_`
5. **Important:** You must also verify your sending domain:
   - Go to **Domains** → **Add Domain**
   - Add `ateedtech.com` and follow the DNS record instructions
   - Until verified, you can only send from `onboarding@resend.dev`

**Pricing:** Free tier includes 100 emails/day, 3,000/month.

---

## 4. `AUDIT_NOTIFICATION_EMAIL` — Team Notification Recipient

This is not an API key — it's the email address where audit lead notifications are sent.

- Default: `sales@ateedtech.com`
- Change this to whatever inbox your sales/lead team monitors

---

## Verification

After setting all keys, run:

```bash
npm run dev
```

Test the audit feature:

```bash
curl -X POST http://localhost:3000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","name":"Test","email":"test@test.com"}'
```

You should receive a JSON response with audit scores within 15-30 seconds. If
`RESEND_API_KEY` is set, this also emails the sales inbox.
