"use client";

import { useState } from "react";

interface ChatContactFormProps {
  initialNote?: string;
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    note: string;
  }) => Promise<void>;
}

export function ChatContactForm({
  initialNote = "",
  onSubmit,
}: ChatContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState(initialNote);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (status === "success") {
    return (
      <div className="flex justify-start animate-[fadeIn_0.2s_ease-out]">
        <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-bg-cream px-4 py-3 text-sm leading-relaxed text-text-primary">
          <p className="font-semibold text-accent">Got it!</p>
          <p className="mt-1">
            Our sales team will call you shortly. Looking forward to connecting!
          </p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        note: note.trim(),
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <div className="flex justify-start animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-[85%] rounded-2xl rounded-bl-md bg-bg-cream px-4 py-3 text-sm">
        <p className="mb-3 font-medium text-text-primary">
          Share your details and our sales team will call you:
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
          />
          <input
            type="tel"
            placeholder="Phone *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
          />
          <textarea
            placeholder="Brief project note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
          />
          {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
          <button
            type="submit"
            disabled={
              status === "submitting" ||
              !name.trim() ||
              !email.trim() ||
              !phone.trim()
            }
            className="w-full rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {status === "submitting" ? "Sending..." : "Send to sales team"}
          </button>
        </form>
      </div>
    </div>
  );
}
