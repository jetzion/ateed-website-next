import { Metadata } from "next";
import { getHeroSection, getContactInfo } from "@/lib/contentful";
import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/components/sections/ContactForm";
import { ContactInfo } from "@/components/sections/ContactInfo";
import type { ContentfulEntry } from "@/types/contentful";

interface ContactHeroFields {
  heading?: string;
  description?: string;
  heroImage?: { fields?: { file?: { url?: string } } };
}

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Ateed Tech. We'd love to hear about your project and discuss how we can help bring your vision to life.",
  alternates: { canonical: "/contact" },
};

export const dynamic = "force-static";
export const revalidate = 3600;

function getImageUrl(url?: string) {
  if (!url) return undefined;
  return url.startsWith("//") ? `https:${url}` : url;
}

export default async function ContactPage() {
  const [heroData, contactInfo] = await Promise.all([
    getHeroSection("Contact"),
    getContactInfo(),
  ]);

  const hero = heroData[0] as unknown as
    | ContentfulEntry<ContactHeroFields>
    | undefined;
  const heroImageUrl = hero?.fields?.heroImage?.fields?.file?.url;
  const backgroundImage = heroImageUrl ? getImageUrl(heroImageUrl) : undefined;

  return (
    <>
      <PageHero
        heading={hero?.fields?.heading || "Contact Us"}
        description={hero?.fields?.description || "We'd love to hear from you"}
        backgroundImage={backgroundImage}
        nextSectionId="contact-form"
      />

      {/* Contact Info + Form */}
      <section
        id="contact-form"
        className="scroll-mt-24 relative pt-10 lg:pt-14 pb-20 lg:pb-28 overflow-x-clip"
        style={{
          background:
            "linear-gradient(to bottom, var(--bg-cream), var(--bg-blue))",
        }}
      >
        {/* Blue orb — top right, bleeds into hero above */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: "clamp(250px, 30vw, 420px)",
            height: "clamp(250px, 30vw, 420px)",
            top: "-5%",
            right: "-5%",
            background:
              "radial-gradient(circle at 40% 40%, rgba(59,141,214,0.45) 0%, rgba(100,170,230,0.18) 45%, transparent 75%)",
            filter: "blur(50px)",
          }}
        />
        {/* Grain texture */}
        <div className="hero-grain" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Contact info cards */}
          {contactInfo && contactInfo.length > 0 && (
            <ContactInfo
              data={
                contactInfo as unknown as React.ComponentProps<
                  typeof ContactInfo
                >["data"]
              }
            />
          )}

          {/* Form */}
          <div className="max-w-2xl mx-auto">
            <ContactForm />
          </div>

          {/* Social Links */}
          <div className="pt-14 text-center">
            <p className="text-sm text-text-tertiary tracking-wider uppercase mb-6">
              Connect with us
            </p>
            <div className="flex justify-center gap-4">
              {[
                {
                  href: "https://www.facebook.com/AteedTech/",
                  label: "Facebook",
                  path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                },
                {
                  href: "https://www.linkedin.com/company/ateedtech",
                  label: "LinkedIn",
                  path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
                },
                {
                  href: "https://www.youtube.com/@AteedTech",
                  label: "YouTube",
                  path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
                },
                {
                  href: "https://www.instagram.com/ateedtech/",
                  label: "Instagram",
                  path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-text-tertiary hover:text-accent hover:bg-accent/5 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
