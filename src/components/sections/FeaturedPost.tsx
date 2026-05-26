"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP, gsap } from "@/hooks/useGSAP";

interface FeaturedPostProps {
  title: string;
  excerpt: string;
  imageUrl?: string;
  slug: string;
  authorName: string;
  authorAvatar?: string;
  publishDate: string;
}

export function FeaturedPost({
  title,
  excerpt,
  imageUrl,
  slug,
  authorName,
  authorAvatar,
  publishDate,
}: FeaturedPostProps) {
  const cardRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 80%",
        },
      },
    );
  }, []);

  return (
    <article
      ref={cardRef}
      className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(59,141,214,0.08)",
        boxShadow:
          "0 4px 24px rgba(30,80,160,0.06), 0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      <div className="flex flex-col md:flex-row-reverse">
        {/* Image */}
        {imageUrl && (
          <Link
            href={`/blog/${slug}`}
            className="md:w-1/2 relative h-64 md:h-auto overflow-hidden"
          >
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </Link>
        )}

        {/* Content */}
        <div className="md:w-1/2 p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.15em] uppercase text-accent mb-5">
              <span className="h-px w-6 bg-accent/50" />
              Featured
            </span>

            <Link href={`/blog/${slug}`}>
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-text-primary mb-4 hover:text-accent transition-colors duration-300">
                {title}
              </h2>
            </Link>

            <p className="text-text-secondary leading-relaxed mb-6">
              {excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-border/50">
            <div className="flex items-center gap-3">
              {authorAvatar && (
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-accent/10">
                  <Image
                    src={authorAvatar}
                    alt={authorName}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              )}
              <span className="text-sm font-medium text-text-primary">
                {authorName}
              </span>
            </div>

            <time className="text-sm text-text-tertiary">{publishDate}</time>
          </div>
        </div>
      </div>
    </article>
  );
}
