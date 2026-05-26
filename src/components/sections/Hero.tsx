"use client";

import { useRef, useEffect, useCallback } from "react";
import { useGSAP, gsap, ScrollTrigger } from "@/hooks/useGSAP";
import { TextReveal } from "@/components/animations/TextReveal";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";

interface HeroProps {
  data?: {
    fields?: {
      heroImage?: {
        fields?: {
          file?: {
            url?: string;
          };
          description?: string;
        };
      };
    };
  };
}

export function Hero({ data }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Mouse parallax for floating cards
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!cardsContainerRef.current) return;
    const rect = cardsContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const moveX = (e.clientX - centerX) / rect.width;
    const moveY = (e.clientY - centerY) / rect.height;

    const cards =
      cardsContainerRef.current.querySelectorAll<HTMLElement>(".hero-card");
    cards.forEach((card) => {
      const depth = parseFloat(card.dataset.depth || "1");
      gsap.to(card, {
        x: moveX * 14 * depth,
        y: moveY * 10 * depth,
        duration: 1,
        ease: "power2.out",
      });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardsContainerRef.current) return;
    const cards =
      cardsContainerRef.current.querySelectorAll<HTMLElement>(".hero-card");
    cards.forEach((card) => {
      gsap.to(card, {
        x: 0,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
      });
    });
  }, []);

  useEffect(() => {
    const el = cardsContainerRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  useGSAP(() => {
    // Breathing orbs
    if (artRef.current) {
      const orbs = artRef.current.querySelectorAll(".hero-orb");
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

    // Staggered card entrance
    if (cardsContainerRef.current) {
      const cards = cardsContainerRef.current.querySelectorAll(".hero-card");
      gsap.fromTo(
        cards,
        { y: 60, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.8,
        },
      );
    }

    // Scroll parallax — cards race upward faster than the page
    if (cardsContainerRef.current && containerRef.current) {
      const cards =
        cardsContainerRef.current.querySelectorAll<HTMLElement>(".hero-card");
      cards.forEach((card) => {
        const depth = parseFloat(card.dataset.depth || "1");
        gsap.to(card, {
          y: -220 * depth,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      });
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="hero-section relative min-h-[100svh] flex items-center overflow-x-clip bg-bg-primary"
    >
      {/* Grain texture overlay */}
      <div className="hero-grain" />

      {/* Gradient orbs — breathing background */}
      <div
        ref={artRef}
        className="absolute inset-0 z-[2] pointer-events-none"
        aria-hidden="true"
      >
        {/* Large primary orb — top right corner */}
        <div
          className="hero-orb absolute rounded-full"
          style={{
            width: "clamp(280px, 35vw, 480px)",
            height: "clamp(280px, 35vw, 480px)",
            top: "-10%",
            right: "-8%",
            background:
              "radial-gradient(circle at 40% 40%, rgba(59,141,214,0.7) 0%, rgba(100,170,230,0.35) 40%, rgba(100,170,230,0.1) 65%, transparent 80%)",
            filter: "blur(50px)",
          }}
        />

        {/* Deep navy orb — top right area */}
        <div
          className="hero-orb absolute rounded-full"
          style={{
            width: "clamp(200px, 26vw, 340px)",
            height: "clamp(200px, 26vw, 340px)",
            top: "5%",
            right: "5%",
            background:
              "radial-gradient(circle at 60% 50%, rgba(30,80,160,0.6) 0%, rgba(59,141,214,0.25) 40%, transparent 70%)",
            filter: "blur(45px)",
          }}
        />

        {/* Sky blue glow — supporting top right */}
        <div
          className="hero-orb absolute rounded-full"
          style={{
            width: "clamp(160px, 20vw, 260px)",
            height: "clamp(160px, 20vw, 260px)",
            top: "15%",
            right: "12%",
            background:
              "radial-gradient(circle, rgba(100,180,240,0.55) 0%, rgba(140,200,250,0.2) 50%, transparent 70%)",
            filter: "blur(35px)",
          }}
        />

        {/* Small blue accent — bridging right side */}
        <div
          className="hero-orb absolute rounded-full"
          style={{
            width: "clamp(100px, 14vw, 160px)",
            height: "clamp(100px, 14vw, 160px)",
            top: "45%",
            right: "18%",
            background:
              "radial-gradient(circle, rgba(59,141,214,0.5) 0%, transparent 65%)",
            filter: "blur(25px)",
          }}
        />

        {/* Large orange orb — bottom left corner */}
        <div
          className="hero-orb absolute rounded-full"
          style={{
            width: "clamp(200px, 26vw, 360px)",
            height: "clamp(200px, 26vw, 360px)",
            bottom: "-8%",
            left: "-6%",
            background:
              "radial-gradient(circle at 50% 50%, rgba(232,118,45,0.55) 0%, rgba(232,118,45,0.22) 40%, rgba(232,118,45,0.05) 65%, transparent 80%)",
            filter: "blur(50px)",
          }}
        />

        {/* Small warm orange — supporting bottom left */}
        <div
          className="hero-orb absolute rounded-full"
          style={{
            width: "clamp(100px, 14vw, 180px)",
            height: "clamp(100px, 14vw, 180px)",
            bottom: "10%",
            left: "5%",
            background:
              "radial-gradient(circle, rgba(232,118,45,0.4) 0%, rgba(232,118,45,0.12) 50%, transparent 70%)",
            filter: "blur(35px)",
          }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10 -mt-14">
        <div className="flex items-center justify-between gap-8 lg:gap-16">
          {/* Left: text */}
          <div className="max-w-xl flex-1">
            <FadeIn delay={0.1}>
              <div className="flex items-center gap-3 mb-5">
                <span className="h-px w-8 bg-accent/50" />
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent">
                  Custom Software Development
                </span>
              </div>
            </FadeIn>

            <TextReveal
              as="h1"
              className="font-serif hero-heading font-normal text-text-primary mb-5"
              stagger={0.05}
              delay={0.2}
            >
              Software crafted to empower your future
            </TextReveal>

            <FadeIn delay={0.6}>
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-xl mb-8">
                From concept to code — we build custom web apps, mobile
                platforms, and AI solutions that scale with your ambitions.
              </p>
            </FadeIn>

            <FadeIn delay={0.8}>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" href="/contact">
                  Start a Conversation
                </Button>
                <Button variant="ghost" href="#services">
                  Explore Services <span aria-hidden="true">→</span>
                </Button>
              </div>
            </FadeIn>
          </div>

          {/* Right: Floating UI component cards */}
          <div
            ref={cardsContainerRef}
            className="hidden md:block flex-shrink-0 relative"
            style={{
              perspective: "1200px",
              width: "clamp(340px, 34vw, 500px)",
              height: "clamp(380px, 38vw, 520px)",
            }}
          >
            {/* Card 1: Analytics dashboard — largest, centered */}
            <div
              className="hero-card absolute opacity-0"
              data-depth="1"
              style={{
                top: "8%",
                left: "10%",
                width: "230px",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.88)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  borderRadius: "14px",
                  border: "1px solid rgba(59,141,214,0.12)",
                  boxShadow:
                    "0 8px 32px rgba(30,80,160,0.08), 0 1px 3px rgba(0,0,0,0.04)",
                  padding: "18px",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#78716C",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Revenue
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      color: "#A8A29E",
                      fontWeight: 500,
                    }}
                  >
                    This month
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#1C1917",
                    letterSpacing: "-0.02em",
                  }}
                >
                  $48,290
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#22C55E",
                      fontWeight: 600,
                    }}
                  >
                    +12.5%
                  </span>
                  <span style={{ fontSize: "10px", color: "#A8A29E" }}>
                    vs last month
                  </span>
                </div>
                {/* Mini bar chart */}
                <div
                  className="flex items-end gap-[3px] mt-4"
                  style={{ height: "36px" }}
                >
                  {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: "100%",
                        height: `${h}%`,
                        borderRadius: "2px",
                        background: i >= 7 ? "#3B8DD6" : "rgba(59,141,214,0.2)",
                        transition: "height 0.3s ease",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2: Deploy notification — top right */}
            <div
              className="hero-card absolute opacity-0"
              data-depth="1.5"
              style={{
                top: "2%",
                right: "0%",
                width: "190px",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  borderRadius: "12px",
                  border: "1px solid rgba(59,141,214,0.1)",
                  boxShadow: "0 6px 24px rgba(30,80,160,0.07)",
                  padding: "14px 16px",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#22C55E",
                      boxShadow: "0 0 6px rgba(34,197,94,0.4)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#1C1917",
                    }}
                  >
                    Deployed
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#78716C",
                    lineHeight: 1.5,
                  }}
                >
                  Production build v2.4.1 shipped successfully
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    color: "#A8A29E",
                    marginTop: "6px",
                  }}
                >
                  2 min ago
                </div>
              </div>
            </div>

            {/* Card 3: Team / Sprint progress — mid left */}
            <div
              className="hero-card absolute opacity-0"
              data-depth="0.8"
              style={{
                top: "52%",
                left: "0%",
                width: "200px",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.88)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  borderRadius: "12px",
                  border: "1px solid rgba(59,141,214,0.1)",
                  boxShadow: "0 6px 24px rgba(30,80,160,0.07)",
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#78716C",
                    marginBottom: "8px",
                  }}
                >
                  Sprint Progress
                </div>
                {/* Progress bar */}
                <div
                  style={{
                    height: "6px",
                    background: "rgba(59,141,214,0.12)",
                    borderRadius: "3px",
                    overflow: "hidden",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "72%",
                      height: "100%",
                      background: "linear-gradient(90deg, #3B8DD6, #60A5FA)",
                      borderRadius: "3px",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#1C1917",
                      fontWeight: 600,
                    }}
                  >
                    18/25 tasks
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#3B8DD6",
                      fontWeight: 600,
                    }}
                  >
                    72%
                  </span>
                </div>
                {/* Team avatars */}
                <div className="flex -space-x-2 mt-3">
                  {["#3B8DD6", "#E8762D", "#22C55E", "#8B5CF6"].map(
                    (color, i) => (
                      <div
                        key={i}
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: color,
                          border: "2px solid white",
                          fontSize: "9px",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        {["A", "J", "S", "M"][i]}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Card 4: Live status pill — floating small */}
            <div
              className="hero-card absolute opacity-0"
              data-depth="2"
              style={{
                top: "40%",
                right: "5%",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderRadius: "20px",
                  border: "1px solid rgba(34,197,94,0.15)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  padding: "8px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#22C55E",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#1C1917",
                  }}
                >
                  Live
                </span>
                <span style={{ fontSize: "10px", color: "#A8A29E" }}>
                  99.9% uptime
                </span>
              </div>
            </div>

            {/* Card 5: Code snippet — bottom right */}
            <div
              className="hero-card absolute opacity-0"
              data-depth="1.2"
              style={{
                bottom: "4%",
                right: "2%",
                width: "180px",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                style={{
                  background: "rgba(28,25,23,0.92)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
                  padding: "12px 14px",
                  fontFamily: "monospace",
                }}
              >
                <div className="flex items-center gap-1 mb-2">
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#FF5F57",
                    }}
                  />
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#FFBD2E",
                    }}
                  />
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#28CA41",
                    }}
                  />
                </div>
                <div style={{ fontSize: "10px", lineHeight: 1.7 }}>
                  <span style={{ color: "#60A5FA" }}>const</span>{" "}
                  <span style={{ color: "#A5B4FC" }}>app</span>{" "}
                  <span style={{ color: "#78716C" }}>=</span>{" "}
                  <span style={{ color: "#34D399" }}>deploy</span>
                  <span style={{ color: "#78716C" }}>();</span>
                  <br />
                  <span style={{ color: "#78716C" }}>{"// "}</span>
                  <span style={{ color: "#4ADE80" }}>Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue — clickable: smooth-scrolls to the next section. Plain
          anchor so it works without JS (html has scroll-behavior: smooth). */}
      <a
        href="#mission"
        aria-label="Scroll to next section"
        className="scroll-cue group absolute bottom-8 left-1/2 z-10 flex cursor-pointer flex-col items-center gap-2.5 rounded-lg p-2 text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <span className="scroll-cue-label text-xs font-medium uppercase tracking-[0.25em] text-text-secondary transition-colors group-hover:text-text-primary">
          Scroll
        </span>
        <div className="scroll-chev-group flex flex-col items-center gap-[3px]">
          {[0, 1].map((i) => (
            <svg
              key={i}
              className={`scroll-chev ${i === 0 ? "scroll-chev-1" : "scroll-chev-2"}`}
              width="20"
              height="10"
              viewBox="0 0 20 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 2l8 6 8-6" />
            </svg>
          ))}
        </div>
      </a>
    </section>
  );
}
