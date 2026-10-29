"use client";

import { TextReveal } from "@/components/animations/TextReveal";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";

export function HomeCTA() {
  return (
    <section className="relative py-24 lg:py-32 bg-bg-dark overflow-x-clip">
      {/* Gradient orb — top right */}
      <div
        className="gradient-orb gradient-orb-warm"
        style={{ width: "500px", height: "500px", top: "-20%", right: "-5%" }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
        <div>
          <TextReveal
            as="h2"
            className="font-serif heading-lg heading-one-line font-normal text-white mb-6"
            stagger={0.04}
          >
            Ready to solve a business challenge with the right technology?
          </TextReveal>

          <FadeIn delay={0.3}>
            <p className="text-lg text-text-tertiary leading-relaxed mb-10 max-w-xl mx-auto">
              Let&apos;s discuss how we can turn your vision into software that
              makes a difference.
            </p>
          </FadeIn>

          <FadeIn delay={0.5}>
            <Button variant="secondary" href="/contact">
              Start a Conversation
            </Button>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
