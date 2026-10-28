import { NextRequest, NextResponse } from "next/server";
import { sendChatContactNotification } from "@/lib/email";

export async function POST(request: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    phone?: string;
    note?: string;
    conversation?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, phone, note, conversation } = body;

  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Name, email, and phone are required." },
      { status: 400 }
    );
  }

  if (
    name.length > 80 ||
    email.length > 254 ||
    phone.length > 30 ||
    (note?.length ?? 0) > 1000
  ) {
    return NextResponse.json(
      { error: "One or more fields are too long." },
      { status: 400 }
    );
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const conversationContext = (conversation ?? []).slice(-100);

  // Send email notification (includes full chat + contact info)
  try {
    await sendChatContactNotification({
      name,
      email,
      phone,
      note,
      conversationContext,
    });
  } catch (err) {
    console.error("Failed to send chat contact email:", err);
    return NextResponse.json(
      { error: "Failed to submit. Please try again." },
      { status: 500 }
    );
  }

  // Fire-and-forget: append to Google Sheet
  const sheetWebhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (sheetWebhookUrl) {
    fetch(sheetWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: phone ?? "",
        note: note ?? "",
        source: "chatbot",
        timestamp: new Date().toISOString(),
        conversation: conversationContext.join("\n"),
      }),
    }).catch((err) => {
      console.error("Failed to append to Google Sheet:", err);
    });
  }

  return NextResponse.json({ success: true });
}
