"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Visible title — also wired to aria-labelledby for screen readers. */
  title: string;
  /** Accent color for the title underline (defaults to brand accent). */
  accentColor?: string;
  children: React.ReactNode;
}

/**
 * Accessible, portal-based modal dialog.
 *
 * - Renders into document.body so it escapes any transformed/overflow-hidden ancestor.
 * - Closes on Escape and backdrop click.
 * - Locks body scroll while open and restores focus to the trigger on close.
 * - Traps Tab focus within the dialog.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  accentColor = "var(--accent)",
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Focus trap: keep Tab cycling inside the dialog.
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    document.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog once it mounts.
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  // Only render the portal client-side and while open. isOpen is false during
  // SSR/hydration, so server and first client render agree (both null).
  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="modal-backdrop absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="modal-dialog relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl focus:outline-none sm:max-h-[85vh] sm:max-w-5xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-6 py-5 sm:px-8 sm:py-6">
          <div className="w-fit">
            <h2
              id="modal-title"
              className="font-serif heading-sm font-normal text-text-primary"
            >
              {title}
            </h2>
            <div
              className="mt-2 h-[2px] w-full rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1.5 -mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-black/[0.05] hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body — bottom padding is safe-area-aware so the last line
            clears the home indicator if the site ever adopts viewport-fit=cover. */}
        <div className="overflow-y-auto px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-7 sm:pb-[max(1.75rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
