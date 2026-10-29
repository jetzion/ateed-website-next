"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP, gsap } from "@/hooks/useGSAP";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/animations/FadeIn";
import { ScrollCue } from "@/components/ui/ScrollCue";

const INDUSTRY_ACCENTS = [
  "#3B8DD6", // Retail — blue
  "#E8762D", // Logistics — orange
  "#059669", // Healthcare — emerald
  "#7C3AED", // Manufacturing — violet
  "#0891B2", // Services — cyan
];

interface Industry {
  fields: {
    industryName?: string;
    description?: string;
    image?: {
      fields?: {
        file?: {
          url?: string;
        };
      };
    };
  };
  sys: {
    id: string;
  };
}

interface IndustriesProps {
  data: Industry[];
}

export function Industries({ data }: IndustriesProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Staggered entrance animation
  useGSAP(() => {
    if (!listRef.current || !data?.length) return;
    const cards = listRef.current.querySelectorAll(".industry-card");
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: listRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  }, [data]);

  const getImageUrl = (industry: Industry) => {
    const url = industry.fields?.image?.fields?.file?.url;
    if (!url) return null;
    return url.startsWith("//") ? `https:${url}` : url;
  };

  if (!data || data.length === 0) return null;

  return (
    <section className="relative py-24 lg:py-32 bg-bg-blue">
      <div className="container mx-auto px-4 lg:px-8">
        <FadeIn>
          <SectionHeading eyebrow="Industries">
            Sectors we serve
          </SectionHeading>
        </FadeIn>

        <div ref={listRef} className="flex flex-col gap-5">
          {data.map((industry, index) => {
            const imageUrl = getImageUrl(industry);
            const accent = INDUSTRY_ACCENTS[index % INDUSTRY_ACCENTS.length];
            const imageRight = index % 2 === 0;

            return (
              <div
                key={industry.sys.id}
                className="industry-card group rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  "--card-accent": accent,
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(59,141,214,0.08)",
                  boxShadow:
                    "0 4px 24px rgba(30,80,160,0.04), 0 1px 3px rgba(0,0,0,0.02)",
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 40px ${accent}15, 0 2px 8px rgba(0,0,0,0.04)`;
                  e.currentTarget.style.borderColor = `${accent}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 24px rgba(30,80,160,0.04), 0 1px 3px rgba(0,0,0,0.02)";
                  e.currentTarget.style.borderColor = "rgba(59,141,214,0.08)";
                }}
              >
                <div
                  className={`flex flex-col ${
                    imageRight ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Text content */}
                  <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-center relative overflow-hidden">
                    {/* Heading + accent line wrapper */}
                    <div className="w-fit mb-4">
                      <h3 className="font-serif text-xl md:text-2xl font-normal text-text-primary transition-colors duration-300 group-hover:text-[var(--card-accent)]">
                        {industry.fields?.industryName}
                      </h3>
                      <div
                        className="w-8 h-[2px] rounded-full group-hover:w-full transition-all duration-500 mt-2"
                        style={{ backgroundColor: accent }}
                      />
                    </div>

                    <p className="text-text-secondary text-[0.925rem] leading-relaxed">
                      {industry.fields?.description}
                    </p>
                  </div>

                  {/* Image */}
                  <div className="relative w-full md:w-[45%] h-56 md:h-auto md:min-h-[280px] flex-shrink-0 overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={industry.fields?.industryName || "Industry"}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 45vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-bg-dark-secondary" />
                    )}
                    {/* Soft gradient blend where image meets text */}
                    <div
                      className={`absolute inset-y-0 w-16 hidden md:block ${
                        imageRight
                          ? "left-0 bg-gradient-to-r from-white/40 to-transparent"
                          : "right-0 bg-gradient-to-l from-white/40 to-transparent"
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ScrollCue className="bottom-6" />
    </section>
  );
}
