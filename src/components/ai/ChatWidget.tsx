"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatContactForm } from "./ChatContactForm";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "contact-form";
}

const SESSION_LIMIT = 20;
const GREETING = "Hi! I'm Ateed Tech's AI assistant. How can I help you today?";
const STORAGE_KEY = "ateed-chat";
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface StoredSession {
  messages: Message[];
  formShown: boolean;
  formSubmitted: boolean;
  timestamp: number;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formShownRef = useRef(false);
  const formSubmittedRef = useRef(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isStreaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isStreaming]);

  // Load chat session from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const session: StoredSession = JSON.parse(raw);
        if (Date.now() - session.timestamp < SESSION_TTL) {
          setMessages(session.messages);
          formShownRef.current = session.formShown;
          formSubmittedRef.current = session.formSubmitted;
          if (session.formSubmitted) setFormSubmitted(true);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // Ignore corrupt data
    }
    setIsHydrated(true);
  }, []);

  // Persist chat session to localStorage on changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const session: StoredSession = {
        messages,
        formShown: formShownRef.current,
        formSubmitted,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Storage full or unavailable
    }
  }, [messages, formSubmitted, isHydrated]);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const isAtLimit = userMessageCount >= SESSION_LIMIT;

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || isAtLimit) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    // Add placeholder assistant message
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...updatedMessages.filter(
              (m) => m.content !== GREETING && m.type !== "contact-form",
            ),
            ...(formSubmittedRef.current
              ? [
                  {
                    role: "system" as const,
                    content:
                      "NOTE: The visitor has already submitted their contact details via the form. Do NOT ask them to fill in details again or mention the form. Just answer their question helpfully.",
                  },
                ]
              : []),
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content:
              error.error || "Sorry, something went wrong. Please try again.",
          };
          return copy;
        });
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  copy[copy.length - 1] = {
                    ...last,
                    content: last.content + parsed.text,
                  };
                  return copy;
                });
              }
            } catch {
              // Skip unparseable
            }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Sorry, I couldn't connect. Please try again later.",
        };
        return copy;
      });
    } finally {
      setIsStreaming(false);

      // After streaming completes, check if bot is offering to connect with the sales team
      if (!formShownRef.current) {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (
            lastMsg?.role === "assistant" &&
            shouldShowContactForm(lastMsg.content)
          ) {
            formShownRef.current = true;
            return [
              ...prev,
              { role: "assistant", content: "", type: "contact-form" as const },
            ];
          }
          return prev;
        });
      }
    }
  }

  function buildProjectSummary(): string {
    // Use only the last user message — it's the project-relevant one.
    // Full conversation context is sent separately in the email.
    const userMessages = messages.filter((m) => m.role === "user" && m.content);
    return userMessages.length > 0
      ? userMessages[userMessages.length - 1].content
      : "";
  }

  function shouldShowContactForm(text: string): boolean {
    const lower = text.toLowerCase();
    const mentionsTeam =
      lower.includes("sales team") ||
      lower.includes("our team") ||
      lower.includes("the team");
    const mentionsHandoff =
      lower.includes("call you") ||
      lower.includes("connect") ||
      lower.includes("reach out") ||
      lower.includes("follow up") ||
      lower.includes("get in touch") ||
      lower.includes("fill in") ||
      lower.includes("drop your") ||
      lower.includes("details below") ||
      lower.includes("info below") ||
      lower.includes("your details");
    return mentionsTeam && mentionsHandoff;
  }

  async function handleContactSubmit(data: {
    name: string;
    email: string;
    phone: string;
    note: string;
  }) {
    // Build conversation context from all text messages
    const conversation = messages
      .filter((m) => m.type !== "contact-form" && m.content)
      .map((m) => `${m.role === "user" ? "Visitor" : "Bot"}: ${m.content}`);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        conversation,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to submit");
    }

    formSubmittedRef.current = true;
    setFormSubmitted(true);
  }

  function clearConversation() {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([{ role: "assistant", content: GREETING }]);
    setInput("");
    formShownRef.current = false;
    formSubmittedRef.current = false;
    setFormSubmitted(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 z-50 flex w-[calc(100%-2rem)] max-w-96 flex-col overflow-hidden rounded-2xl bg-bg-primary shadow-2xl md:bottom-24 md:right-6 md:w-96"
          style={{ height: "min(500px, calc(100vh - 8rem))" }}
          role="dialog"
          aria-label="Chat with Ateed Tech AI assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-bg-dark px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5-1.34C8.47 21.51 10.18 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Ateed Tech Assistant
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearConversation}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-bg-dark-secondary hover:text-white"
                aria-label="New conversation"
                title="New conversation"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-bg-dark-secondary hover:text-white"
                aria-label="Close chat"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) =>
              msg.type === "contact-form" ? (
                <ChatContactForm
                  key={i}
                  initialNote={buildProjectSummary()}
                  onSubmit={handleContactSubmit}
                />
              ) : (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ),
            )}
            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-md bg-bg-cream px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-text-tertiary [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-text-tertiary [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-text-tertiary [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            {isAtLimit ? (
              <p className="text-center text-xs text-text-secondary">
                Session limit reached. Please call{" "}
                <a
                  href="tel:+15614628333"
                  className="text-accent hover:underline"
                >
                  +1-561-462-8333
                </a>{" "}
                or use our contact form.
              </p>
            ) : formShownRef.current && !formSubmitted ? (
              <p className="text-center text-xs italic text-text-secondary">
                Fill out the form above to continue chatting
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  maxLength={2000}
                  disabled={isStreaming}
                  className="flex-1 rounded-full border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none disabled:opacity-50"
                  aria-label="Chat message input"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:hover:bg-accent"
                  aria-label="Send message"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 md:bottom-6 md:right-6 ${
          isOpen
            ? "bg-bg-dark text-white hover:bg-bg-dark-secondary"
            : "bg-accent text-white hover:bg-accent-hover"
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}
