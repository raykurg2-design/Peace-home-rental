type SendResult = { sent: boolean; previewUrl?: string };

/**
 * Sends transactional email when RESEND_API_KEY is set.
 * Without it (local / sample), returns a preview verification URL for the UI.
 */
export async function sendVerificationEmail(input: {
  to: string;
  name: string;
  verifyUrl: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const from = process.env.RESEND_FROM_EMAIL?.trim() || "Peace Home Rental <onboarding@resend.dev>";

  if (!apiKey) {
    return { sent: false, previewUrl: input.verifyUrl };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: "Verify your Peace Home Rental email",
      html: `
        <p>Hi ${escapeHtml(input.name)},</p>
        <p>Confirm your email to continue with Peace Home Rental.</p>
        <p><a href="${input.verifyUrl}">Verify my email</a></p>
        <p>This link expires in 24 hours. If you did not create an account, you can ignore this message.</p>
      `,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Email send failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return { sent: true };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
