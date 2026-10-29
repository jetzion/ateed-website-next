"use client";

interface ScrollCueProps {
  /**
   * Id of the section to scroll to, without the "#". When omitted, the cue
   * scrolls to the next <section> on the page and is hidden in the page's last
   * section (see .scroll-cue-auto in globals.css).
   */
  targetId?: string;
  /** Distance from the bottom of the section. */
  className?: string;
}

const CUE_CLASSES =
  "scroll-cue group absolute left-1/2 z-10 flex cursor-pointer flex-col items-center gap-2.5 rounded-lg p-2 text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

/** Scroll smoothly to the first <section> after the one containing `el`. */
function scrollToNextSection(el: HTMLElement) {
  let next = el.closest("section")?.nextElementSibling;
  while (next && next.tagName !== "SECTION") next = next.nextElementSibling;
  next?.scrollIntoView({ behavior: "smooth" });
}

/**
 * Animated "Scroll" label with two chevrons, pinned to the bottom center of
 * its section. With `targetId` it is a plain anchor, so it works without JS.
 * Animation lives in globals.css.
 */
export function ScrollCue({ targetId, className = "bottom-8" }: ScrollCueProps) {
  const content = (
    <>
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
    </>
  );

  if (targetId) {
    return (
      <a
        href={`#${targetId}`}
        aria-label="Scroll to next section"
        className={`${CUE_CLASSES} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-label="Scroll to next section"
      onClick={(e) => scrollToNextSection(e.currentTarget)}
      className={`scroll-cue-auto ${CUE_CLASSES} ${className}`}
    >
      {content}
    </button>
  );
}
