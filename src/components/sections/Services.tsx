"use client";

import { useRef, useState } from "react";
import { useGSAP, gsap } from "@/hooks/useGSAP";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

// Distinct accent color per service — muted, sophisticated tones
const SERVICE_COLORS = [
  "#3B8DD6", // 01 Requirements — primary blue
  "#0891B2", // 02 Consulting — cyan
  "#7C3AED", // 03 UX/UI — violet
  "#059669", // 04 Web Dev — emerald
  "#D97706", // 05 Mobile — amber
  "#4F46E5", // 06 Enterprise — indigo
  "#0D9488", // 07 API Integration — teal
  "#DB2777", // 08 AI/ML — pink
  "#E8762D", // 09 Digital Marketing — orange
  "#6366F1", // 10 — slate indigo
];

interface Service {
  fields: {
    title?: string;
    cardText?: string;
    modalId?: string;
    modalContent?: string;
  };
  sys: {
    id: string;
  };
}

// modalContent is a plain long-text field with blank-line paragraph breaks.
// Split into paragraphs and drop empties so we can render real <p> tags.
function toParagraphs(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

interface ServicesProps {
  data: Service[];
}

export function Services({ data }: ServicesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Index of the service whose modal is open, or null when closed.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeService = activeIndex !== null ? data[activeIndex] : null;
  const activeColor =
    activeIndex !== null
      ? SERVICE_COLORS[activeIndex % SERVICE_COLORS.length]
      : undefined;

  useGSAP(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll(".service-card");
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      },
    );
  }, [data]);

  if (!data || data.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="services"
      className="py-24 lg:py-32 bg-bg-cream"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <FadeIn>
          <SectionHeading eyebrow="What We Do">Services</SectionHeading>
        </FadeIn>

        {/* 2-column grid of numbered service cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5"
        >
          {data.map((service, index) => {
            const color = SERVICE_COLORS[index % SERVICE_COLORS.length];
            const hasModal = Boolean(service.fields?.modalContent);
            const open = () => hasModal && setActiveIndex(index);
            return (
              <div
                key={service.sys.id}
                role={hasModal ? "button" : undefined}
                tabIndex={hasModal ? 0 : undefined}
                aria-haspopup={hasModal ? "dialog" : undefined}
                aria-label={
                  hasModal
                    ? `Read more about ${service.fields?.title}`
                    : undefined
                }
                onClick={open}
                onKeyDown={(e) => {
                  if (hasModal && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    open();
                  }
                }}
                className={`service-card bg-white border border-black/[0.08] border-t-[3px] border-t-[color:var(--card-accent)] p-6 lg:p-8 group transition-all duration-300 rounded-lg shadow-[0_2px_8px_rgba(28,25,23,0.06)] hover:shadow-[0_12px_28px_rgba(28,25,23,0.12)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--card-accent)] ${
                  hasModal ? "cursor-pointer" : ""
                }`}
                style={
                  {
                    // CSS custom property for this card's accent
                    "--card-accent": color,
                    "--card-accent-bg": `${color}08`,
                    "--card-accent-bg-hover": `${color}0D`,
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${color}0A`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                }}
              >
                {/* Large decorative number — tinted with card accent */}
                <span
                  className="block font-serif text-4xl lg:text-5xl font-normal select-none mb-3 transition-colors duration-500"
                  style={{ color: `${color}33` }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Heading + accent line wrapper — line expands to heading width on hover */}
                <div className="w-fit mb-3">
                  <h3 className="font-serif heading-sm font-normal text-text-primary transition-colors duration-300 group-hover:text-[var(--card-accent)]">
                    {service.fields?.title}
                  </h3>
                  <div
                    className="w-8 h-[2px] rounded-full group-hover:w-full transition-all duration-500 mt-2"
                    style={{ backgroundColor: color }}
                  />
                </div>

                <p className="text-text-secondary text-[0.925rem] leading-relaxed">
                  {service.fields?.cardText}
                </p>

                {/* Read more affordance — signals the card opens a details dialog */}
                {hasModal && (
                  <span
                    className="mt-4 inline-flex items-center gap-1.5 text-[0.8rem] font-medium transition-transform duration-300 group-hover:translate-x-0.5"
                    style={{ color }}
                    aria-hidden="true"
                  >
                    Read more
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA always below the grid — stable regardless of service count */}
        <FadeIn delay={0.3}>
          <div className="mt-14 text-center">
            <p className="text-text-secondary mb-5">Have a project in mind?</p>
            <Button variant="primary" href="/contact">
              Let&apos;s Discuss Your Project
            </Button>
          </div>
        </FadeIn>
      </div>

      {/* Service detail dialog — driven by the clicked card's modalContent */}
      <Modal
        isOpen={activeService !== null}
        onClose={() => setActiveIndex(null)}
        title={activeService?.fields?.title ?? ""}
        accentColor={activeColor}
      >
        <div className="space-y-4">
          {toParagraphs(activeService?.fields?.modalContent).map(
            (paragraph, i) => (
              <p
                key={i}
                className="text-text-secondary text-[0.95rem] leading-relaxed"
              >
                {paragraph}
              </p>
            ),
          )}
        </div>
      </Modal>
    </section>
  );
}
