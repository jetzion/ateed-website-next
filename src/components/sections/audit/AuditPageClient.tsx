"use client";

import { useState, useRef, useCallback } from "react";
import { AuditForm } from "./AuditForm";
import { AuditLoading } from "./AuditLoading";
import { AuditResults } from "./AuditResults";
import type { AuditRequest, AuditResult } from "@/lib/audit";

type AuditState = "form" | "loading" | "results" | "error";
type Strategy = "mobile" | "desktop";

export function AuditPageClient() {
  const [state, setState] = useState<AuditState>("form");
  const [activeStrategy, setActiveStrategy] = useState<Strategy>("mobile");
  const [resultsByStrategy, setResultsByStrategy] = useState<
    Partial<Record<Strategy, AuditResult>>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<AuditRequest | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const runAudit = useCallback(
    async (data: AuditRequest, strategy: Strategy) => {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, strategy }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      return result as AuditResult;
    },
    []
  );

  const handleSubmit = async (data: AuditRequest) => {
    setState("loading");
    setError(null);
    setLastRequest(data);
    setResultsByStrategy({});
    setActiveStrategy("mobile");

    setTimeout(scrollToSection, 100);

    try {
      const result = await runAudit(data, "mobile");
      setResultsByStrategy({ mobile: result });
      setState("results");
      setTimeout(scrollToSection, 100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
      setState("error");
    }
  };

  const handleStrategyChange = async (strategy: Strategy) => {
    setActiveStrategy(strategy);

    // If we already have cached results for this strategy, just switch
    if (resultsByStrategy[strategy]) return;

    // Otherwise, fetch results for the new strategy
    if (!lastRequest) return;

    try {
      const result = await runAudit(lastRequest, strategy);
      setResultsByStrategy((prev) => ({ ...prev, [strategy]: result }));
    } catch (err) {
      console.error("Failed to fetch audit for strategy:", strategy, err);
      // Fall back to the other strategy's results if available
      const fallback = strategy === "mobile" ? "desktop" : "mobile";
      if (resultsByStrategy[fallback]) {
        setActiveStrategy(fallback);
      }
    }
  };

  const handleReset = () => {
    setState("form");
    setResultsByStrategy({});
    setLastRequest(null);
    setError(null);
    setActiveStrategy("mobile");
    setTimeout(scrollToSection, 100);
  };

  const activeResults = resultsByStrategy[activeStrategy];

  return (
    <section
      ref={sectionRef}
      id="audit-tool"
      className="scroll-mt-24 relative pt-10 lg:pt-14 pb-20 lg:pb-28 overflow-x-clip"
      style={{
        background:
          "linear-gradient(to bottom, var(--bg-cream), var(--bg-blue))",
      }}
    >
      {/* Blue orb — top right, bleeds into hero above */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "clamp(250px, 30vw, 420px)",
          height: "clamp(250px, 30vw, 420px)",
          top: "-5%",
          right: "-5%",
          background:
            "radial-gradient(circle at 40% 40%, rgba(59,141,214,0.45) 0%, rgba(100,170,230,0.18) 45%, transparent 75%)",
          filter: "blur(50px)",
        }}
      />
      {/* Grain texture */}
      <div className="hero-grain" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div
          className={
            state === "results" ? "max-w-4xl mx-auto" : "max-w-2xl mx-auto"
          }
        >
          {state === "form" && <AuditForm onSubmit={handleSubmit} />}
          {state === "loading" && <AuditLoading />}
          {state === "results" && activeResults && (
            <AuditResults
              results={activeResults}
              onReset={handleReset}
              activeStrategy={activeStrategy}
              onStrategyChange={handleStrategyChange}
              isLoadingStrategy={!resultsByStrategy[activeStrategy]}
            />
          )}
          {state === "error" && (
            <div
              className="rounded-2xl p-8 lg:p-10 text-center"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(59,141,214,0.1)",
                boxShadow:
                  "0 8px 32px rgba(30,80,160,0.08), 0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-normal text-text-primary mb-4">
                Something went wrong
              </h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
                {error}
              </p>
              <button
                onClick={handleReset}
                className="inline-block bg-accent text-white px-8 py-3 rounded-full font-medium hover:bg-accent-hover transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
