"use client";

import { useRef } from "react";
import { useGSAP, gsap } from "@/hooks/useGSAP";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/animations/FadeIn";
import { ScrollCue } from "@/components/ui/ScrollCue";

// Accent colors matching Services section editorial style
const VALUE_COLORS = [
  "#3B8DD6", // blue
  "#0891B2", // cyan
  "#7C3AED", // violet
  "#059669", // emerald
  "#D97706", // amber
  "#4F46E5", // indigo
];

interface CoreValue {
  fields: {
    title?: string;
    description?: string;
    iconClass?: string;
    iconBackgroundColor?: string;
  };
  sys: {
    id: string;
  };
}

interface CoreValuesProps {
  data: CoreValue[];
}

export function CoreValues({ data }: CoreValuesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll(".value-card");
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 40, scale: 0.96, rotate: -0.5 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 85%",
        },
      }
    );
  }, [data]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="relative pt-20 pb-28 lg:py-28 bg-bg-primary">
      <div className="container mx-auto px-4 lg:px-8">
        <FadeIn>
          <SectionHeading eyebrow="Our Values">
            What drives us
          </SectionHeading>
        </FadeIn>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border"
        >
          {data.map((value, index) => {
            const color = VALUE_COLORS[index % VALUE_COLORS.length];
            return (
              <div
                key={value.sys.id}
                className="value-card bg-bg-primary p-6 lg:p-8 group transition-all duration-300"
                style={{
                  "--card-accent": color,
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${color}0A`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                }}
              >
                {/* Large serif number */}
                <span
                  className="block font-serif text-4xl lg:text-5xl font-normal select-none mb-3 transition-colors duration-500"
                  style={{ color: `${color}18` }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Title + expanding accent line */}
                <div className="w-fit mb-3">
                  <h3
                    className="font-serif heading-sm font-normal text-text-primary transition-colors duration-300 group-hover:text-[var(--card-accent)]"
                  >
                    {value.fields?.title}
                  </h3>
                  <div
                    className="w-8 h-[2px] rounded-full group-hover:w-full transition-all duration-500 mt-2"
                    style={{ backgroundColor: color }}
                  />
                </div>

                <p className="text-text-secondary text-[0.925rem] leading-relaxed">
                  {value.fields?.description}
                </p>
              </div>
            );
          })}
          {/* Fill empty grid cell when odd number of values */}
          {data.length % 2 !== 0 && (
            <div className="hidden md:block bg-bg-primary" />
          )}
        </div>
      </div>
      <ScrollCue className="bottom-6" />
    </section>
  );
}
