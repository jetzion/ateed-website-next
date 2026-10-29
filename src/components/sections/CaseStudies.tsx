"use client";

import { useRef, useState, useCallback } from "react";
import { useGSAP, gsap } from "@/hooks/useGSAP";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/animations/FadeIn";
import { ScrollCue } from "@/components/ui/ScrollCue";

// Industry accent colors — matches the palette used across the site
const INDUSTRY_COLORS: Record<string, string> = {
  Wellness: "#059669",
  Retail: "#3B8DD6",
  Healthcare: "#0891B2",
  Manufacturing: "#7C3AED",
  Logistics: "#E8762D",
};

const DEFAULT_ACCENT = "#3B8DD6";

// Split "Industry - Project Title" into parts
function parseTitle(name?: string) {
  if (!name) return { industry: "", title: name || "" };
  const idx = name.indexOf(" - ");
  if (idx === -1) return { industry: "", title: name };
  return { industry: name.slice(0, idx).trim(), title: name.slice(idx + 3).trim() };
}

// Strip wrapping quotation marks from feedback text
function cleanQuote(text?: string) {
  if (!text) return "";
  return text.replace(/^["""\s]+|["""\s]+$/g, "").trim();
}

interface CaseStudy {
  fields: {
    name?: string;
    description?: string;
    duration?: string;
    team?: string;
    clientFeedback?: string;
  };
  sys: {
    id: string;
  };
}

interface CaseStudiesProps {
  data: CaseStudy[];
}

export function CaseStudies({ data }: CaseStudiesProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Scroll-triggered entrance
  useGSAP(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }, [data]);

  // Animated slide transition — crossfade with subtle vertical shift
  const animateToSlide = useCallback(
    (newIndex: number) => {
      if (isAnimating.current || !contentRef.current || newIndex === currentIndex) return;
      isAnimating.current = true;

      const inner = contentRef.current.querySelector(".case-study-inner");
      if (!inner) {
        setCurrentIndex(newIndex);
        isAnimating.current = false;
        return;
      }

      gsap.to(inner, {
        opacity: 0,
        y: -12,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          setCurrentIndex(newIndex);
          requestAnimationFrame(() => {
            gsap.fromTo(
              inner,
              { opacity: 0, y: 16 },
              {
                opacity: 1,
                y: 0,
                duration: 0.35,
                ease: "power2.out",
                onComplete: () => {
                  isAnimating.current = false;
                },
              }
            );
          });
        },
      });
    },
    [currentIndex]
  );

  const nextSlide = () => animateToSlide((currentIndex + 1) % data.length);
  const prevSlide = () => animateToSlide((currentIndex - 1 + data.length) % data.length);

  if (!data || data.length === 0) return null;

  const study = data[currentIndex];
  const { industry, title } = parseTitle(study.fields.name);
  const accent = INDUSTRY_COLORS[industry] || DEFAULT_ACCENT;
  const quote = cleanQuote(study.fields.clientFeedback);

  return (
    <section className="relative py-24 lg:py-32 bg-bg-blue">
      <div className="container mx-auto px-4 lg:px-8">
        <FadeIn>
          <SectionHeading eyebrow="Case Studies">Selected work</SectionHeading>
        </FadeIn>

        {/* Glassmorphic card */}
        <div
          ref={contentRef}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(59,141,214,0.08)",
            boxShadow:
              "0 4px 24px rgba(30,80,160,0.04), 0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div className="case-study-inner p-6 md:p-10 lg:p-12">
            {/* Industry tag */}
            {industry && (
              <span
                className="inline-block text-[0.7rem] font-semibold tracking-[0.12em] uppercase px-3 py-1 rounded-full mb-6"
                style={{
                  color: accent,
                  backgroundColor: `${accent}10`,
                  border: `1px solid ${accent}20`,
                }}
              >
                {industry}
              </span>
            )}

            {/* Clean title + accent line */}
            <h3 className="font-serif heading-md font-normal text-text-primary mb-2 max-w-3xl">
              {title}
            </h3>
            <div
              className="w-12 h-[2px] rounded-full mb-6"
              style={{ backgroundColor: accent }}
            />

            {/* Description */}
            <p className="text-text-secondary text-[0.95rem] md:text-lg leading-relaxed mb-8 max-w-2xl">
              {study.fields.description}
            </p>

            {/* Stats with accent top borders */}
            <div className="flex flex-wrap gap-8 mb-10">
              {study.fields.duration && (
                <div className="pt-3" style={{ borderTop: `2px solid ${accent}` }}>
                  <span className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-text-tertiary mb-1">
                    Duration
                  </span>
                  <span className="text-text-primary font-medium text-sm">
                    {study.fields.duration}
                  </span>
                </div>
              )}
              {study.fields.team && (
                <div className="pt-3" style={{ borderTop: `2px solid ${accent}` }}>
                  <span className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-text-tertiary mb-1">
                    Team
                  </span>
                  <span className="text-text-primary font-medium text-sm">
                    {study.fields.team}
                  </span>
                </div>
              )}
            </div>

            {/* Client testimonial */}
            {quote && (
              <div className="relative">
                {/* Large decorative quote mark */}
                <span
                  className="absolute -top-3 -left-1 font-serif text-[4rem] leading-none select-none pointer-events-none"
                  style={{ color: `${accent}10` }}
                >
                  &ldquo;
                </span>
                <blockquote className="relative pl-5">
                  <div
                    className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <p className="text-text-secondary italic text-[0.95rem] md:text-lg leading-relaxed">
                    {quote}
                  </p>
                </blockquote>
              </div>
            )}
          </div>

          {/* Navigation bar */}
          {data.length > 1 && (
            <div className="flex items-center justify-between px-6 md:px-10 lg:px-12 py-4 border-t border-black/[0.04]">
              <button
                onClick={prevSlide}
                className="flex items-center gap-1.5 text-sm font-medium text-text-tertiary hover:text-text-primary transition-colors"
                aria-label="Previous case study"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 12L6 8L10 4" />
                </svg>
                Prev
              </button>

              {/* Dot indicators */}
              <div className="flex items-center gap-2">
                {data.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => animateToSlide(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === currentIndex ? 20 : 7,
                      height: 7,
                      backgroundColor:
                        i === currentIndex ? accent : "rgba(0,0,0,0.10)",
                    }}
                    aria-label={`Go to case study ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="flex items-center gap-1.5 text-sm font-medium text-text-tertiary hover:text-text-primary transition-colors"
                aria-label="Next case study"
              >
                Next
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 4L10 8L6 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      <ScrollCue className="bottom-6" />
    </section>
  );
}
