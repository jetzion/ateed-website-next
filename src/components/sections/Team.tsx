"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP, gsap } from "@/hooks/useGSAP";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/animations/FadeIn";
import { ScrollCue } from "@/components/ui/ScrollCue";

interface TeamMember {
  fields: {
    firstName?: string;
    jobTitle?: string;
    picture?: {
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

interface TeamProps {
  data: TeamMember[];
}

export function Team({ data }: TeamProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll(".team-card");
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 85%",
        },
      }
    );
  }, [data]);

  const getImageUrl = (member: TeamMember) => {
    const url = member.fields?.picture?.fields?.file?.url;
    if (!url) return null;
    return url.startsWith("//") ? `https:${url}` : url;
  };

  // Sort team members: CEO and CTO first, then by firstName
  const sortedMembers = [...data].sort((a, b) => {
    const titleA = (a.fields?.jobTitle || "").toLowerCase();
    const titleB = (b.fields?.jobTitle || "").toLowerCase();

    if (titleA.includes("ceo")) return -1;
    if (titleB.includes("ceo")) return 1;
    if (titleA.includes("cto")) return -1;
    if (titleB.includes("cto")) return 1;

    return (a.fields?.firstName || "").localeCompare(b.fields?.firstName || "");
  });

  if (!data || data.length === 0) {
    return null;
  }

  // Adaptive grid: center for small teams
  const gridCols = sortedMembers.length <= 3
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-28 bg-bg-cream overflow-hidden">
      {/* Grain texture */}
      <div className="hero-grain" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <FadeIn>
          <SectionHeading eyebrow="Our Team" align="center">
            The people behind Ateed Tech
          </SectionHeading>
        </FadeIn>

        <div
          ref={cardsRef}
          className={`grid ${gridCols} gap-6`}
        >
          {sortedMembers.map((member) => {
            const imageUrl = getImageUrl(member);

            return (
              <div
                key={member.sys.id}
                className="team-card group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{
                  aspectRatio: "3 / 4",
                  boxShadow: "0 4px 24px rgba(30,80,160,0.08), 0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {/* Full-bleed photo */}
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={member.fields?.firstName || "Team member"}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-bg-primary" />
                )}

                {/* Warm gradient overlay at bottom — always visible, intensifies on hover */}
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(to top, rgba(28,25,23,0.65) 0%, rgba(28,25,23,0.25) 35%, transparent 60%)",
                  }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(to top, rgba(28,25,23,0.75) 0%, rgba(28,25,23,0.35) 40%, transparent 65%)",
                  }}
                />

                {/* Name + title overlaid at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <h3
                    className="font-serif text-xl font-normal text-white mb-2 transition-all duration-500"
                    style={{
                      textShadow: "0 0 20px rgba(59,141,214,0.35), 0 0 40px rgba(59,141,214,0.15)",
                    }}
                  >
                    {member.fields?.firstName}
                  </h3>
                  <p className="text-sm text-white/75 group-hover:text-white/90 transition-colors duration-300">
                    {member.fields?.jobTitle}
                  </p>
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
