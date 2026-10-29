# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Principle: SEO & Discoverability First

**IMPORTANT: Every feature, component, and change must consider SEO and discoverability.**

Without visibility, even the best website is useless. Before implementing anything, ask:
- Does this improve or maintain our search ranking?
- Is this content accessible to Google, Bing, and AI crawlers (GPTBot, Claude)?
- Does this add meaningful structured data?
- Will this slow down page load (hurting Core Web Vitals)?

### SEO Checklist for Every Change
- [ ] Semantic HTML (proper heading hierarchy, landmarks)
- [ ] Meta tags updated if content changes
- [ ] Structured data (JSON-LD) for new content types
- [ ] Images have alt text and use next/image for optimization
- [ ] Internal linking where relevant
- [ ] Page loads fast (check Lighthouse score)
- [ ] Content is crawlable (no client-only rendering for important content)

### LLM Discoverability
- Keep `public/llms.txt` updated with current services and offerings
- Use clear, descriptive text that AI assistants can understand
- Structure content logically with proper headings

---

## Build Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Lint (ESLint)
npm run lint

# Type checking
npx tsc --noEmit

# Deploy (needs deploy-capable AWS credentials)
npx sst deploy --stage production
```

Local dev needs `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` in `.env`
or `.env.local`; other keys are in `scripts/SETUP_KEYS.md`.

## Architecture Overview

This is a Next.js 16 website for Ateed Tech with:
- **Next.js App Router** for routing and layouts
- **GSAP** for premium animations (ScrollTrigger, SplitText)
- **Tailwind CSS** for styling
- **Contentful CMS** for dynamic content
- **TypeScript** for type safety

### Directory Structure

```
src/
├── app/                 # Pages and routes (App Router)
│   ├── layout.tsx       # Root layout with Navbar/Footer
│   ├── page.tsx         # Homepage
│   ├── api/             # chat, contact, audit, revalidate, generate-image
│   └── sitemap.ts       # Dynamic sitemap for SEO
├── components/
│   ├── animations/      # GSAP animation wrappers
│   ├── layout/          # Navbar, Footer
│   ├── sections/        # Page sections (Hero, Services, etc.)
│   └── ui/              # Reusable UI components
├── hooks/
│   └── useGSAP.ts       # Custom GSAP hooks for React
└── lib/
    ├── contentful.ts    # Contentful client and fetchers
    ├── email.ts         # Resend lead notifications (sales inbox only)
    ├── rateLimit.ts     # DynamoDB-backed per-IP rate limiting
    ├── audit.ts         # PageSpeed result formatting
    └── gsap.ts          # GSAP plugin registration
```

### Contentful Integration

Content is fetched in Server Components via `src/lib/contentful.ts`. Pages are
statically generated with ISR (`revalidate = 3600`); `/api/revalidate` is the
Contentful webhook for on-demand refresh (it also invalidates CloudFront).
- Space ID: `750wikp5ao9z`, environment `master`
- Content types: `heroSection`, `ourMission`, `ourServices`, `caseStudies`, `industriesWeServe`, `comprehensiveTechnologyStack`, `blog` (with linked `author`), `team`, `coreValues`, `contact`, `privacyPolicy`, `footer`
- `ourServices` and `industriesWeServe` are sorted by their Integer `order`
  field. `heroSection` (page `Home`) has `introText` for the hero paragraph.
  Add a field in Contentful
  before deploying code that sorts or filters by it; Contentful rejects queries
  on unknown fields.

### Deployment

SST (`sst.config.ts`) deploys to AWS via OpenNext: CloudFront in front of
Lambda, region `us-east-2`. Production is `www.ateedtech.com` (DNS at GoDaddy).
Secrets are `sst.Secret`s passed to the server as environment variables.
Run `npx sst diff --stage production` before deploying infra changes; avoid
`link`-ing resources that don't exist yet, which makes previews show the
whole server stack as deleted (use fixed names + explicit `permissions`).

### API Route Conventions

- Escape every user-supplied value with `esc()` before putting it in email HTML
  (`src/lib/email.ts`). Never email addresses typed in by visitors.
- Rate-limit public POST routes with `isWithinRateLimit(route, ip, limit,
  windowSeconds)` from `src/lib/rateLimit.ts`. It is a no-op without
  `RATE_LIMIT_TABLE`, so local dev is never limited.
- Cap the size of request bodies (field lengths, chat history) before calling
  paid APIs.

### GSAP Usage

Always use the custom `useGSAP` hook for animations:
```tsx
import { useGSAP, gsap, ScrollTrigger } from "@/hooks/useGSAP";

// Animations are automatically cleaned up on unmount
useGSAP(() => {
  gsap.to(".element", { opacity: 1 });
}, []);
```

### Performance Requirements

Target Lighthouse scores:
- Performance: 95+
- Accessibility: 95+
- Best Practices: 100
- SEO: 100

### SEO Files

- `public/robots.txt` - Crawler permissions (allows AI bots)
- `public/llms.txt` - AI assistant discoverability
- `src/app/sitemap.ts` - Dynamic sitemap generation
- Structured data in page components (JSON-LD)
