"use client";

import { useRef } from "react";
import { useGSAP, gsap } from "@/hooks/useGSAP";
import { FadeIn } from "@/components/animations/FadeIn";
import { ScrollCue } from "@/components/ui/ScrollCue";

interface MissionProps {
  data?: {
    fields: {
      heading?: string;
      description?: string;
    };
  };
}

export function Mission({ data }: MissionProps) {
  const heading = data?.fields?.heading || "Who We Are";
  const description =
    data?.fields?.description ||
    "At Ateed Tech, we're more than just a custom software development company – we are your dedicated technology partner, committed to bringing your unique vision to life.";

  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Blue background grows outward from center — time-based, triggered by scroll
    if (bgRef.current && sectionRef.current) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 55%",
          toggleActions: "play reverse play reverse",
        },
      });

      tl.fromTo(
        bgRef.current,
        { scale: 0, opacity: 0, borderRadius: "50%" },
        {
          scale: 1,
          opacity: 1,
          borderRadius: "0%",
          duration: 1.8,
          ease: "power2.inOut",
        },
      );
    }

    // Decorative quote mark drift — time-based with slight delay
    if (quoteRef.current) {
      gsap.fromTo(
        quoteRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play reverse play reverse",
          },
        },
      );
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      id="mission"
      className="relative py-28 lg:py-36 bg-bg-primary overflow-x-clip scroll-mt-24"
    >
      {/* Blue background that grows outward */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-bg-blue origin-center"
        style={{ borderRadius: "50%", transform: "scale(0)" }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Oversized decorative quotation mark */}
        <div
          ref={quoteRef}
          className="pointer-events-none select-none absolute left-1/2 -translate-x-1/2"
          style={{ top: "-16px" }}
          aria-hidden="true"
        >
          <span
            className="font-serif block"
            style={{
              fontSize: "clamp(160px, 22vw, 320px)",
              lineHeight: 0.65,
              color: "rgba(59,141,214,0.06)",
            }}
          >
            &ldquo;
          </span>
        </div>

        {/* Centered editorial quote */}
        <div className="max-w-3xl mx-auto text-center relative">
          <FadeIn>
            <span className="inline-block text-xs font-medium tracking-[0.2em] uppercase text-accent mb-8">
              {heading}
            </span>
          </FadeIn>

          <FadeIn delay={0.15}>
            <blockquote className="font-serif text-[1.3rem] sm:text-2xl md:text-[1.65rem] lg:text-[1.9rem] font-normal text-text-primary leading-[1.6] md:leading-[1.55] italic">
              {description}
            </blockquote>
          </FadeIn>
        </div>
      </div>
      <ScrollCue className="bottom-6" />
    </section>
  );
}
