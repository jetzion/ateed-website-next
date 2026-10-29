"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP, gsap, ScrollTrigger } from "@/hooks/useGSAP";
import { TextReveal } from "@/components/animations/TextReveal";
import { FadeIn } from "@/components/animations/FadeIn";
import { ScrollCue } from "@/components/ui/ScrollCue";

interface PageHeroProps {
  heading: string;
  description?: string;
  backgroundImage?: string;
  imageAlt?: string;
  /** Id of the section below; shows the scroll cue when set. */
  nextSectionId?: string;
}

export function PageHero({
  heading,
  description,
  backgroundImage,
  imageAlt,
  nextSectionId,
}: PageHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Breathing orbs
    if (orbsRef.current) {
      const orbs = orbsRef.current.querySelectorAll(".page-hero-orb");
      orbs.forEach((orb, i) => {
        gsap.set(orb, { scale: 0.5, opacity: 0.4 });
        gsap.to(orb, {
          scale: 1.3,
          opacity: 1,
          duration: 5 + i * 0.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.6,
        });
        gsap.to(orb, {
          y: i % 2 === 0 ? -18 : 18,
          x: i % 3 === 0 ? 10 : -6,
          duration: 6 + i * 1.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }

    // Parallax on background image
    if (imageRef.current && heroRef.current) {
      gsap.to(imageRef.current, {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }
  }, []);

  return (
    <section
      ref={heroRef}
      className={`relative pt-36 md:pt-40 ${
        nextSectionId ? "pb-36 md:pb-40" : "pb-20 md:pb-28"
      } bg-bg-cream overflow-x-clip`}
    >
      {/* Grain texture overlay */}
      <div className="hero-grain" />

      {/* Breathing orbs */}
      <div
        ref={orbsRef}
        className="absolute inset-0 z-[2] pointer-events-none"
        aria-hidden="true"
      >
        {/* Blue orb — top right */}
        <div
          className="page-hero-orb absolute rounded-full"
          style={{
            width: "clamp(200px, 28vw, 380px)",
            height: "clamp(200px, 28vw, 380px)",
            top: "-12%",
            right: "-6%",
            background:
              "radial-gradient(circle at 40% 40%, rgba(59,141,214,0.5) 0%, rgba(100,170,230,0.2) 45%, transparent 75%)",
            filter: "blur(50px)",
          }}
        />
        {/* Smaller blue accent — mid right */}
        <div
          className="page-hero-orb absolute rounded-full"
          style={{
            width: "clamp(120px, 16vw, 200px)",
            height: "clamp(120px, 16vw, 200px)",
            top: "20%",
            right: "10%",
            background:
              "radial-gradient(circle, rgba(100,180,240,0.4) 0%, rgba(140,200,250,0.15) 50%, transparent 70%)",
            filter: "blur(35px)",
          }}
        />
        {/* Warm orange orb — bottom left */}
        <div
          className="page-hero-orb absolute rounded-full"
          style={{
            width: "clamp(160px, 22vw, 300px)",
            height: "clamp(160px, 22vw, 300px)",
            bottom: "-8%",
            left: "-5%",
            background:
              "radial-gradient(circle at 50% 50%, rgba(232,118,45,0.4) 0%, rgba(232,118,45,0.15) 45%, transparent 75%)",
            filter: "blur(45px)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className={`${backgroundImage ? "lg:w-1/2" : "max-w-3xl mx-auto text-center"}`}>
            <TextReveal
              as="h1"
              className="font-serif heading-xl font-normal text-text-primary mb-6"
              stagger={0.05}
              delay={0.2}
            >
              {heading}
            </TextReveal>
            {description && (
              <FadeIn delay={0.6}>
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
                  {description}
                </p>
              </FadeIn>
            )}
          </div>

          {backgroundImage && (
            <div className="lg:w-1/2">
              <FadeIn delay={0.4}>
                <div
                  ref={imageRef}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border"
                >
                  <Image
                    src={backgroundImage}
                    alt={imageAlt || heading}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </FadeIn>
            </div>
          )}
        </div>
      </div>

      {nextSectionId && <ScrollCue targetId={nextSectionId} />}
    </section>
  );
}
