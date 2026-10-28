import { Resend } from "resend";
import type { AuditResult, AuditRequest } from "./audit";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const NOTIFICATION_EMAIL =
  process.env.AUDIT_NOTIFICATION_EMAIL || "sales@ateedtech.com";

/** Escape user-supplied text for safe interpolation into email HTML. */
function esc(value: string = ""): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getRatingEmoji(score: number): string {
  if (score >= 90) return "🟢";
  if (score >= 70) return "🔵";
  if (score >= 50) return "🟡";
  return "🔴";
}

export async function sendAuditNotification(
  contact: AuditRequest,
  results: AuditResult
): Promise<void> {
  if (!resend) {
    console.warn("RESEND_API_KEY not configured — skipping audit email notification");
    return;
  }

  const { performance, seo, accessibility, security } = results.categories;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: linear-gradient(135deg, #1e3a5f, #3b8dd6); padding: 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Website Audit Lead</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Overall Score: <strong style="color: white; font-size: 20px;">${results.overallScore}/100</strong></p>
      </div>

      <div style="background: #f8f9fa; padding: 24px; border: 1px solid #e2e8f0;">
        <h2 style="margin: 0 0 16px; font-size: 18px; color: #1e3a5f;">Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #64748b; width: 100px;">Name</td><td style="padding: 6px 0; font-weight: 600;">${esc(contact.name)}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0;"><a href="mailto:${esc(contact.email)}" style="color: #3b8dd6;">${esc(contact.email)}</a></td></tr>
          ${contact.phone ? `<tr><td style="padding: 6px 0; color: #64748b;">Phone</td><td style="padding: 6px 0;"><a href="tel:${esc(contact.phone)}" style="color: #3b8dd6;">${esc(contact.phone)}</a></td></tr>` : ""}
          ${contact.company ? `<tr><td style="padding: 6px 0; color: #64748b;">Company</td><td style="padding: 6px 0;">${esc(contact.company)}</td></tr>` : ""}
          <tr><td style="padding: 6px 0; color: #64748b;">Website</td><td style="padding: 6px 0;"><a href="${esc(results.url)}" style="color: #3b8dd6;">${esc(results.url)}</a></td></tr>
        </table>
      </div>

      <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
        <h2 style="margin: 0 0 16px; font-size: 18px; color: #1e3a5f;">Audit Scores</h2>
        <div style="display: grid; gap: 12px;">
          ${[performance, seo, accessibility, security].map(cat => `
            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">${getRatingEmoji(cat.score)} ${cat.name}</span>
                <span style="font-size: 20px; font-weight: 700; color: ${cat.color};">${cat.score}</span>
              </div>
              <ul style="margin: 8px 0 0; padding-left: 20px; color: #64748b; font-size: 14px;">
                ${cat.suggestions.slice(0, 3).map(s => `<li style="margin: 4px 0;">${s}</li>`).join("")}
              </ul>
            </div>
          `).join("")}
        </div>
      </div>

      <div style="padding: 16px 24px; background: #f8f9fa; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; color: #64748b; font-size: 13px;">
        Audit completed at ${new Date(results.timestamp).toLocaleString("en-US", { timeZone: "America/New_York" })} ET
      </div>
    </div>
  `;

  await resend.emails.send({
    from: "Ateed Tech Audit <audit@ateedtech.com>",
    to: NOTIFICATION_EMAIL,
    subject: `New Website Audit: ${results.url} — ${contact.name}`,
    html,
  });
}

export interface ChatContactData {
  name: string;
  email: string;
  phone?: string;
  note?: string;
  conversationContext: string[];
}

export async function sendChatContactNotification(
  data: ChatContactData
): Promise<void> {
  if (!resend) {
    console.warn("RESEND_API_KEY not configured — skipping chat contact email");
    return;
  }

  const conversationHtml = data.conversationContext
    .map((line) => `<div style="padding: 4px 0; border-bottom: 1px solid #f1f5f9;">${esc(line)}</div>`)
    .join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: linear-gradient(135deg, #1e3a5f, #3b8dd6); padding: 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Chat Lead</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Someone wants to connect via the chatbot</p>
      </div>

      <div style="background: #f8f9fa; padding: 24px; border: 1px solid #e2e8f0;">
        <h2 style="margin: 0 0 16px; font-size: 18px; color: #1e3a5f;">Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #64748b; width: 100px;">Name</td><td style="padding: 6px 0; font-weight: 600;">${esc(data.name)}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0;"><a href="mailto:${esc(data.email)}" style="color: #3b8dd6;">${esc(data.email)}</a></td></tr>
          ${data.phone ? `<tr><td style="padding: 6px 0; color: #64748b;">Phone</td><td style="padding: 6px 0;"><a href="tel:${esc(data.phone)}" style="color: #3b8dd6;">${esc(data.phone)}</a></td></tr>` : ""}
          ${data.note ? `<tr><td style="padding: 6px 0; color: #64748b;">Note</td><td style="padding: 6px 0;">${esc(data.note)}</td></tr>` : ""}
        </table>
      </div>

      <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
        <h2 style="margin: 0 0 16px; font-size: 18px; color: #1e3a5f;">Conversation Context</h2>
        <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 14px; color: #475569;">
          ${conversationHtml}
        </div>
      </div>

      <div style="padding: 16px 24px; background: #f8f9fa; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; color: #64748b; font-size: 13px;">
        Submitted at ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET via chatbot
      </div>
    </div>
  `;

  await resend.emails.send({
    from: "Ateed Tech Chat <chat@ateedtech.com>",
    to: NOTIFICATION_EMAIL,
    subject: `New Chat Lead: ${data.name}`,
    html,
  });
}
