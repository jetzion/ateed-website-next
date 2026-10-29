"use client";

import { useRef, useState } from "react";
import { useGSAP, gsap } from "@/hooks/useGSAP";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/animations/FadeIn";
import { ScrollCue } from "@/components/ui/ScrollCue";

// Per-category accent colors
const CATEGORY_COLORS: Record<string, string> = {
  Design: "#3B8DD6",
  Frontend: "#0891B2",
  Backend: "#7C3AED",
  Mobile: "#059669",
  Database: "#E8762D",
  "AI & Data Science": "#DB2777",
};

const FALLBACK_COLORS = [
  "#3B8DD6",
  "#0891B2",
  "#7C3AED",
  "#059669",
  "#E8762D",
  "#DB2777",
];

// Devicon CDN base
const CDN = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

// Map every tech item to its devicon path
const TECH_LOGOS: Record<string, string> = {
  // Design
  Figma: `${CDN}/figma/figma-original.svg`,
  "Adobe XD": `${CDN}/xd/xd-original.svg`,
  Illustrator: `${CDN}/illustrator/illustrator-plain.svg`,
  Photoshop: `${CDN}/photoshop/photoshop-plain.svg`,
  // Frontend
  "HTML5 & CSS3": `${CDN}/html5/html5-original.svg`,
  React: `${CDN}/react/react-original.svg`,
  "Vue.js": `${CDN}/vuejs/vuejs-original.svg`,
  "Bootstrap & Tailwind": `${CDN}/tailwindcss/tailwindcss-original.svg`,
  // Backend
  Java: `${CDN}/java/java-original.svg`,
  Python: `${CDN}/python/python-original.svg`,
  "Node.js": `${CDN}/nodejs/nodejs-original.svg`,
  ".net Azure": `${CDN}/azure/azure-original.svg`,
  // Mobile
  "React Native": `${CDN}/react/react-original.svg`,
  iOS: `${CDN}/apple/apple-original.svg`,
  Android: `${CDN}/android/android-original.svg`,
  Flutter: `${CDN}/flutter/flutter-original.svg`,
  // Database
  SQL: `${CDN}/azuresqldatabase/azuresqldatabase-original.svg`,
  MySQL: `${CDN}/mysql/mysql-original.svg`,
  PostgreSQL: `${CDN}/postgresql/postgresql-original.svg`,
  MongoDB: `${CDN}/mongodb/mongodb-original.svg`,
  // AI & Data Science
  TensorFlow: `${CDN}/tensorflow/tensorflow-original.svg`,
  PyTorch: `${CDN}/pytorch/pytorch-original.svg`,
  "scikit-learn": `${CDN}/scikitlearn/scikitlearn-original.svg`,
  OpenAI: "/logos/openai.svg",
};

/* Small logo with accent-dot fallback if image fails */
function TechLogo({ name, accent }: { name: string; accent: string }) {
  const [failed, setFailed] = useState(false);
  const url = TECH_LOGOS[name];

  if (!url || failed) {
    return (
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: accent }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={20}
      height={20}
      loading="lazy"
      className="w-5 h-5 flex-shrink-0 object-contain"
      onError={() => setFailed(true)}
    />
  );
}

interface TechStackItem {
  fields: {
    title?: string;
    stackList?: string[];
  };
  sys: {
    id: string;
  };
}

interface TechStackProps {
  data: TechStackItem[];
}

export function TechStack({ data }: TechStackProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!gridRef.current) return;

    const cards = gridRef.current.querySelectorAll(".tech-card");
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }, [data]);

  if (!data || data.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-bg-primary">
      <div className="container mx-auto px-4 lg:px-8">
        <FadeIn>
          <SectionHeading eyebrow="Technology">Our stack</SectionHeading>
        </FadeIn>

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {data.map((techStack, index) => {
            const title = techStack.fields?.title || "";
            const accent =
              CATEGORY_COLORS[title] ||
              FALLBACK_COLORS[index % FALLBACK_COLORS.length];

            return (
              <div
                key={techStack.sys.id}
                className="tech-card group relative rounded-2xl p-6 lg:p-8 transition-all duration-300 overflow-hidden"
                style={
                  {
                    "--card-accent": accent,
                    background: `linear-gradient(145deg, ${accent}08 0%, rgba(255,255,255,0.65) 40%, ${accent}05 100%)`,
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(59,141,214,0.08)",
                    boxShadow:
                      "0 4px 24px rgba(30,80,160,0.04), 0 1px 3px rgba(0,0,0,0.02)",
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-6px)";
                  el.style.boxShadow = `0 16px 48px ${accent}18, 0 4px 12px rgba(0,0,0,0.06)`;
                  el.style.borderColor = `${accent}25`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "";
                  el.style.boxShadow =
                    "0 4px 24px rgba(30,80,160,0.04), 0 1px 3px rgba(0,0,0,0.02)";
                  el.style.borderColor = "rgba(59,141,214,0.08)";
                }}
              >
                {/* Decorative radial glow in top-right corner */}
                <div
                  className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
                  }}
                />

                {/* Category heading + accent line */}
                <div className="w-fit mb-5 relative">
                  <h3 className="font-serif heading-sm font-normal text-text-primary transition-colors duration-300 group-hover:text-[var(--card-accent)]">
                    {title}
                  </h3>
                  <div
                    className="w-8 h-[2px] rounded-full group-hover:w-full transition-all duration-500 mt-2"
                    style={{ backgroundColor: accent }}
                  />
                </div>

                {/* Tech items with logos */}
                <ul className="space-y-3 relative">
                  {techStack.fields.stackList?.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-text-secondary text-sm"
                    >
                      <TechLogo name={item} accent={accent} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
      <ScrollCue className="bottom-6" />
    </section>
  );
}
