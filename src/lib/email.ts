import { Resend } from "resend";
import { OFFICE } from "@/lib/listings";

export type SendResult = { sent: boolean; id?: string };

type MailInput = {
  to: string;
  subject: string;
  html: string;
  idempotencyKey: string;
};

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || "Peace Home Rental <onboarding@resend.dev>";
}

async function sendMail(input: MailInput): Promise<SendResult> {
  const resend = getResend();
  if (!resend) {
    return { sent: false };
  }

  const { data, error } = await resend.emails.send(
    {
      from: fromAddress(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
    },
    { idempotencyKey: input.idempotencyKey.slice(0, 256) },
  );

  if (error) {
    throw new Error(`Email send failed: ${error.message}`);
  }

  return { sent: true, id: data?.id };
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function ownerNotifyEmail(): string {
  return process.env.OWNER_NOTIFY_EMAIL?.trim() || OFFICE.email;
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendVerificationEmail(input: {
  to: string;
  name: string;
  verifyUrl: string;
  idempotencyKey: string;
}): Promise<SendResult> {
  return sendMail({
    to: input.to,
    subject: "Verify your Peace Home Rental email",
    idempotencyKey: input.idempotencyKey,
    html: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>Confirm your email to continue with ${escapeHtml(OFFICE.name)}.</p>
      <p><a href="${input.verifyUrl}">Verify my email</a></p>
      <p>This link expires in 24 hours. If you did not create an account, you can ignore this message.</p>
    `,
  });
}

export async function sendSecurityCodeEmail(input: {
  to: string;
  name: string;
  code: string;
  purpose: "login" | "signup";
  idempotencyKey: string;
}): Promise<SendResult> {
  const label = input.purpose === "login" ? "sign-in" : "account verification";
  return sendMail({
    to: input.to,
    subject: `Your ${OFFICE.name} security code`,
    idempotencyKey: input.idempotencyKey,
    html: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>Your 6-digit security code for ${escapeHtml(label)} is:</p>
      <p style="font-size:28px;letter-spacing:0.2em;font-weight:700">${escapeHtml(input.code)}</p>
      <p>This code expires in 10 minutes. If you did not request it, you can ignore this message.</p>
      <p>— ${escapeHtml(OFFICE.name)}</p>
    `,
  });
}

export async function sendWelcomeEmail(input: {
  to: string;
  name: string;
  accountUrl: string;
  idempotencyKey: string;
}): Promise<SendResult> {
  return sendMail({
    to: input.to,
    subject: `Welcome to ${OFFICE.name}`,
    idempotencyKey: input.idempotencyKey,
    html: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>Welcome to ${escapeHtml(OFFICE.name)}. Your email is confirmed.</p>
      <p>Next, finish customer verification in your account so you can request tours, start applications, and message the office.</p>
      <p><a href="${input.accountUrl}">Open my account</a></p>
      <p>Questions? Call ${escapeHtml(OFFICE.phone)} or reply to this email.</p>
      <p>— ${escapeHtml(OFFICE.name)}</p>
    `,
  });
}

export async function sendVerifiedCustomerEmail(input: {
  to: string;
  name: string;
  homesUrl: string;
  idempotencyKey: string;
}): Promise<SendResult> {
  return sendMail({
    to: input.to,
    subject: "You're a verified Peace Home Rental customer",
    idempotencyKey: input.idempotencyKey,
    html: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>Your renter profile is verified. You can now request tours, start applications, and message the office about any home.</p>
      <p><a href="${input.homesUrl}">Browse homes</a></p>
      <p>— ${escapeHtml(OFFICE.name)}</p>
    `,
  });
}

export async function sendInquiryConfirmationEmail(input: {
  to: string;
  name: string;
  kind: string;
  listingTitle: string;
  message: string;
  idempotencyKey: string;
}): Promise<SendResult> {
  const label = input.kind === "tour" ? "tour request" : input.kind === "apply" ? "application interest" : "inquiry";
  return sendMail({
    to: input.to,
    subject: `We received your ${label}`,
    idempotencyKey: input.idempotencyKey,
    html: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>We received your ${escapeHtml(label)} for <strong>${escapeHtml(input.listingTitle)}</strong>.</p>
      <p>The office typically replies within one business day. You can also message us from your account.</p>
      <blockquote style="border-left:3px solid #2c4a3e;padding-left:12px;color:#555">${escapeHtml(input.message)}</blockquote>
      <p>— ${escapeHtml(OFFICE.name)}</p>
    `,
  });
}

export async function sendOwnerInquiryNoticeEmail(input: {
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  kind: string;
  listingTitle: string;
  message: string;
  ownerUrl: string;
  idempotencyKey: string;
}): Promise<SendResult> {
  const label = input.kind === "tour" ? "Tour request" : input.kind === "apply" ? "Application interest" : "Inquiry";
  return sendMail({
    to: ownerNotifyEmail(),
    subject: `${label}: ${input.listingTitle}`,
    idempotencyKey: input.idempotencyKey,
    html: `
      <p>${escapeHtml(label)} from ${escapeHtml(input.customerName)}.</p>
      <p>Home: <strong>${escapeHtml(input.listingTitle)}</strong></p>
      <p>Email: ${escapeHtml(input.customerEmail)}${input.customerPhone ? `<br/>Phone: ${escapeHtml(input.customerPhone)}` : ""}</p>
      <blockquote style="border-left:3px solid #2c4a3e;padding-left:12px;color:#555">${escapeHtml(input.message)}</blockquote>
      <p><a href="${input.ownerUrl}">Open owner inquiries</a></p>
    `,
  });
}

export async function sendNewMessageEmail(input: {
  to: string;
  recipientName: string;
  senderName: string;
  subject: string;
  body: string;
  threadUrl: string;
  idempotencyKey: string;
}): Promise<SendResult> {
  return sendMail({
    to: input.to,
    subject: `New message: ${input.subject}`,
    idempotencyKey: input.idempotencyKey,
    html: `
      <p>Hi ${escapeHtml(input.recipientName)},</p>
      <p>${escapeHtml(input.senderName)} sent a message about <strong>${escapeHtml(input.subject)}</strong>.</p>
      <blockquote style="border-left:3px solid #2c4a3e;padding-left:12px;color:#555">${escapeHtml(input.body)}</blockquote>
      <p><a href="${input.threadUrl}">Open conversation</a></p>
      <p>— ${escapeHtml(OFFICE.name)}</p>
    `,
  });
}
