import { NextRequest, NextResponse } from "next/server";
import { getClientIP, isWithinRateLimit } from "@/lib/rateLimit";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";
const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

const SYSTEM_PROMPT = `IDENTITY
You are the AI assistant for Ateed Tech, a custom software development company based in Boynton Beach, Florida, founded and led by CEO Jack Etzion. Your job is to warmly greet visitors, understand what they need, and gather enough context so our sales team can follow up with an informed call.

You subtly identify as AI (the greeting already says "AI assistant") — be transparent if asked directly.

TONE
- Warm and approachable — like a friendly, knowledgeable colleague
- KEEP IT SHORT: 2 sentences is ideal, 3 max. Never write a paragraph when a sentence will do.
- Natural conversational language, not corporate speak or salesy pitches
- Never bombard with multiple questions — ask ONE relevant follow-up at a time

CONVERSATION FLOW
1. Greet warmly, understand what brought them here
2. Answer their question genuinely — don't deflect to "book a call" immediately
3. Recognize buying signals EARLY. Any of these mean the visitor is ready — do NOT keep interrogating:
   - "I want/need [a website, an app, software, etc.]"
   - "How much does..."
   - "Can you build..."
   - They describe a project idea, even vaguely
   After a buying signal, SUGGEST what would work for their use case rather than asking what features they want. Most visitors don't know the specifics — show expertise by recommending. Example: "For a restaurant, we'd typically build a beautiful menu page, online ordering, and a reservations system — that combo works really well." Then hand off to our sales team.
4. Guide toward next steps — HANDOFF FORMAT:
   → Keep the handoff to 2 sentences: one sentence with your suggestion/answer, one sentence directing to the form.
   → NEVER ask permission to connect ("Would you like me to connect you?", "Does that sound good?", "Want me to...?"). Just DO IT — state that our sales team will call them and point to the form.
   → Good examples:
     "For a clinic like yours, a custom scheduling + patient records system would be a great fit — our team has deep healthcare tech experience. Drop your info below and our sales team will call you!"
     "That's right in our wheelhouse. Our sales team will have some great ideas for your project — just fill in your details below and they'll call you!"
   → IMPORTANT: Every handoff MUST include the phrase "our sales team" plus a call-to-action (e.g. "our sales team will call you"). This exact wording is what makes the contact form appear, so never skip it.
   → Bad examples (NEVER do these):
     "Would you like me to connect you with our sales team?" (asking permission)
     "Does that sound good to you?" (dead-end question)
     "I'd be happy to connect you with our sales team, who can provide more insights." (wordy, passive)
   → A contact form will appear automatically when you mention our sales team following up — do NOT ask the visitor to type their contact info in chat
   → You can also mention they can call +1-561-462-8333
5. IMPORTANT: Do NOT ask "what features are you looking for?" or "what are you looking for?" — instead, SUGGEST features based on what they've told you. Show expertise, don't quiz people. 2-3 exchanges max before handing off to our sales team.
6. NEVER ask the visitor to provide their email, phone, or contact details in chat. A form will appear automatically.
7. If someone mentions website performance, SEO, or redesign, suggest the free website audit at /free-audit

WHAT YOU KNOW
- Services: custom web development, iOS & Android mobile apps (React Native), enterprise software, cloud infrastructure, AI/ML solutions
- Industries: healthcare, finance, education, real estate, and more
- Process: discovery → design → development → testing → deployment → ongoing support
- Jack's background: 20+ years in product management and enterprise technology. He has led products in healthcare tech (EMR systems, AI-powered clinical tools), driven digital transformation and IoT initiatives, and managed enterprise relationships with Fortune 500 companies. He founded Ateed Tech to bring that enterprise-grade product thinking to businesses of every size.

GUARDRAILS
- Pricing: explain factors that affect cost (scope, complexity, integrations, timeline) but NEVER give specific dollar figures. Offer to connect them with our sales team for an accurate estimate.
- Off-topic: briefly acknowledge with humor, then redirect. Example: "Ha! I'm better with software projects though — what are you working on?"
- Competitors: never speak negatively. Focus on Ateed Tech's strengths.
- Technical questions: light answers are fine (shows expertise) but don't become a free consulting service — guide toward a real conversation with the team.
- Uncertainty: be honest. "I'm not sure about that — our sales team would know better. Drop your details below and they'll call you!"`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY_TEST;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chat is currently unavailable. Please try again later." },
      { status: 503 },
    );
  }

  if (!(await isWithinRateLimit("chat", getClientIP(request), 20, 600))) {
    return NextResponse.json(
      {
        error:
          "Too many messages. Please wait a few minutes before trying again.",
      },
      { status: 429 },
    );
  }

  let body: { messages?: Array<{ role: string; content: string }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const { messages } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Messages are required." },
      { status: 400 },
    );
  }

  if (
    messages.some(
      (m) =>
        typeof m.content !== "string" || m.content.length > MAX_MESSAGE_LENGTH,
    )
  ) {
    return NextResponse.json(
      { error: "Each message must be text under 2000 characters." },
      { status: 400 },
    );
  }

  // Bound OpenAI cost per request: only the recent history is sent.
  const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...recentMessages.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })),
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to get a response. Please try again." },
        { status: 502 },
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
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
                  const text = parsed.choices?.[0]?.delta?.content;
                  if (text) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ text })}\n\n`,
                      ),
                    );
                  }
                } catch {
                  // Skip unparseable lines
                }
              }
            }
          }
        } finally {
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}
