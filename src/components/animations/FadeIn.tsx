"use client";

import React, { useRef, ReactNode, ElementType } from "react";
import { useFadeIn } from "@/hooks/useGSAP";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  as?: ElementType;
}

/**
 * Wrapper component for fade-in animations on scroll
 */
export function FadeIn({
  children,
  className = "",
  delay = 0,
  y,
  x,
  duration = 0.8,
  direction = "up",
  as: Component = "div",
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useFadeIn(ref, { y, x, duration, delay, direction });

  const Tag = Component as React.ElementType;

  // `js-fade` lets CSS hide this only when JS is active (see globals.css),
  // killing the hydration flash while keeping content visible without JS.
  return (
    <Tag ref={ref} className={`js-fade ${className}`.trim()}>
      {children}
    </Tag>
  );
}

/**
 * Staggered fade-in for lists of items
 */
export function FadeInStagger({
  children,
  className = "",
  stagger = 0.1,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={className} data-stagger={stagger}>
      {children}
    </div>
  );
}
