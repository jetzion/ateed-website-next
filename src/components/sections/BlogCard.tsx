"use client";

import Image from "next/image";
import Link from "next/link";

interface BlogCardProps {
  title: string;
  excerpt: string;
  imageUrl?: string;
  slug: string;
  authorName: string;
  authorAvatar?: string;
  publishDate: string;
  featured?: boolean;
}

export function BlogCard({
  title,
  excerpt,
  imageUrl,
  slug,
  authorName,
  authorAvatar,
  publishDate,
  featured,
}: BlogCardProps) {
  return (
    <article
      className="group rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(59,141,214,0.08)",
        boxShadow:
          "0 4px 24px rgba(30,80,160,0.06), 0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      {imageUrl && (
        <Link
          href={`/blog/${slug}`}
          className="relative h-52 block overflow-hidden"
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            // Already resized by Contentful's CDN — skip the Next optimizer
            // Lambda (avoids concurrency throttling on image-heavy pages).
            unoptimized
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {featured && (
            <span
              className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                color: "#3B8DD6",
              }}
            >
              Featured
            </span>
          )}
        </Link>
      )}

      <div className="p-6 flex flex-col flex-grow">
        <Link href={`/blog/${slug}`}>
          <h3 className="font-serif text-xl font-normal text-text-primary mb-3 hover:text-accent transition-colors duration-300 line-clamp-2">
            {title}
          </h3>
        </Link>

        <p className="text-text-secondary text-[0.925rem] leading-relaxed mb-4 line-clamp-3 flex-grow">
          {excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            {authorAvatar && (
              <div className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-accent/10">
                <Image
                  src={authorAvatar}
                  alt={authorName}
                  fill
                  sizes="28px"
                  unoptimized
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
    </article>
  );
}
