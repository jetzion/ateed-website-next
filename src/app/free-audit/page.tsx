import { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { AuditPageClient } from "@/components/sections/audit/AuditPageClient";

export const metadata: Metadata = {
  title: "Free Website Audit | Ateed Tech",
  description:
    "Get a free, instant website audit covering performance, SEO, accessibility, and security. See your scores and get actionable recommendations in seconds.",
  openGraph: {
    title: "Free Website Audit | Ateed Tech",
    description:
      "Instant performance, SEO, accessibility, and security analysis for your website. Get actionable recommendations in seconds — completely free.",
    type: "website",
    url: "https://www.ateedtech.com/free-audit",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Free Website Audit",
  description:
    "Instant website audit tool that analyzes performance, SEO, accessibility, and security, providing actionable improvement recommendations.",
  url: "https://www.ateedtech.com/free-audit",
  applicationCategory: "WebApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  provider: {
    "@type": "Organization",
    name: "Ateed Tech",
    url: "https://www.ateedtech.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Boynton Beach",
      addressRegion: "FL",
      addressCountry: "US",
    },
  },
};

export default function FreeAuditPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero
        heading="Free Website Audit"
        description="Enter your URL and get an instant analysis of your website's performance, SEO, accessibility, and security — with actionable recommendations."
        nextSectionId="audit-tool"
      />
      <AuditPageClient />
    </>
  );
}
