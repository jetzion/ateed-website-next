interface ScrollCueProps {
  /** Id of the section to scroll to, without the "#". */
  targetId: string;
}

/**
 * Animated "Scroll" label with two chevrons, pinned to the bottom center of
 * the nearest positioned ancestor. A plain anchor, so it works without JS
 * (html has scroll-behavior: smooth). Animation lives in globals.css.
 */
export function ScrollCue({ targetId }: ScrollCueProps) {
  return (
    <a
      href={`#${targetId}`}
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
  );
}
