import nodemailer from 'nodemailer';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Load .env automatically so SMTP works regardless of how the server is started
// (plain `node dist/server/entry.mjs` does not read .env on its own).
try {
  const envPath = resolve(process.cwd(), '.env');
  if (!process.env.SMTP_HOST && existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envPath);
  }
} catch {
  // ignore load failures; sendContactEmail falls back to a graceful reason.
}

const esc = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Lightweight HTML email styled to match the portfolio theme
 *  (Space Grotesk headings, Hanken Grotesk body, mono labels, #f8f9ff bg, slate-950 accents).
 *  Inline styles only — required for most email clients. */
function buildHtmlEmail(opts: {
  name: string;
  fromEmail: string;
  topic: string;
  message: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background:#f8f9ff;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;padding:24px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e8f0;border-top:4px solid #0f172a;border-radius:16px;overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="padding:28px 32px 14px 32px;">
                <div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:8px;">
                  Channels // Direct Dispatch — New Contact
                </div>
                <div style="font-family:'Space Grotesk',Arial,sans-serif;font-size:22px;line-height:1.2;color:#0f172a;font-weight:700;">
                  You have a new inquiry
                </div>
                <div style="height:1px;background:#f1f5f9;margin-top:16px;"></div>
              </td>
            </tr>
            <!-- Meta grid -->
            <tr>
              <td style="padding:8px 32px 4px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" style="vertical-align:top;padding:8px 12px 8px 0;">
                      <div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;font-weight:700;margin-bottom:4px;">From</div>
                      <div style="font-family:'Hanken Grotesk',Arial,sans-serif;font-size:14px;color:#0f172a;font-weight:600;">${esc(opts.name)}</div>
                    </td>
                    <td width="50%" style="vertical-align:top;padding:8px 0 8px 12px;">
                      <div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;font-weight:700;margin-bottom:4px;">Reply To</div>
                      <div style="font-family:'Hanken Grotesk',Arial,sans-serif;font-size:14px;color:#0f172a;font-weight:600;">${esc(opts.fromEmail)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="vertical-align:top;padding:8px 12px 8px 0;">
                      <div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;font-weight:700;margin-bottom:4px;">Topic</div>
                      <div style="font-family:'Hanken Grotesk',Arial,sans-serif;font-size:14px;color:#0f172a;font-weight:600;">${esc(opts.topic)}</div>
                    </td>
                    <td style="vertical-align:top;padding:8px 0 8px 12px;">
                      <div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;font-weight:700;margin-bottom:4px;">Priority</div>
                      <div style="display:inline-block;font-family:'Hanken Grotesk',Arial,sans-serif;font-size:11px;color:#ffffff;background:#0f172a;border-radius:999px;padding:3px 12px;font-weight:700;">INBOUND TRANSMISSION</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Divider -->
            <tr>
              <td style="padding:8px 32px 16px 32px;">
                <div style="height:1px;background:#f1f5f9;"></div>
              </td>
            </tr>
            <!-- Message panel -->
            <tr>
              <td style="padding:0 32px 24px 32px;">
                <div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;font-weight:700;margin-bottom:8px;">Message</div>
                <div style="background:#f8f9ff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;font-family:'Hanken Grotesk',Arial,sans-serif;font-size:14px;line-height:1.6;color:#1e293b;white-space:pre-wrap;">${esc(opts.message)}</div>
              </td>
            </tr>
            <!-- Footer / CTA -->
            <tr>
              <td style="padding:0 32px 30px 32px;">
                <a href="mailto:${encodeURIComponent(opts.fromEmail)}" style="display:inline-block;background:#0f172a;color:#ffffff;font-family:'Space Grotesk',Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;border-radius:10px;padding:12px 22px;">
                  Reply to ${esc(opts.name)}
                </a>
                <div style="font-family:'Hanken Grotesk',Arial,sans-serif;font-size:12px;color:#94a3b8;margin-top:14px;line-height:1.5;">
                  Sent from the portfolio contact form. Reply directly from this email to reach ${esc(opts.name)}.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Sends an email notification to the site owner (address from profile.json)
 * when a visitor submits the contact form.
 *
 * SMTP is configured through environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE (default "false").
 *
 * If SMTP is not configured yet, this returns { sent: false, reason } and the
 * inquiry is still saved to content/inquiries.json — so the contact form keeps
 * working even before you plug in real mail credentials.
 */
export async function sendContactEmail(opts: {
  to: string;
  fromName: string;
  fromEmail: string;
  topic: string;
  message: string;
  name: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user) {
    return {
      sent: false,
      reason: 'SMTP not configured (env SMTP_HOST / SMTP_USER missing). Inquiry saved locally only.',
    };
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const subject = `[NEW CONTACT] ${opts.topic || 'General'} — ${opts.name}`;
    const text = [
      `You received a new contact submission on your portfolio.`,
      ``,
      `From:      ${opts.name}`,
      `Email:     ${opts.fromEmail}`,
      `Topic:     ${opts.topic || 'General'}`,
      ``,
      `Message:`,
      `----------------------------------------`,
      `${opts.message}`,
      `----------------------------------------`,
      ``,
      `Reply directly to ${opts.fromEmail} to respond (via Gmail / your mailbox).`,
    ].join('\n');

    await transporter.sendMail({
      from: `"${opts.fromName}" <${user}>`,
      to: opts.to,
      replyTo: opts.fromEmail,
      subject,
      text,
      html: buildHtmlEmail({
        name: opts.name,
        fromEmail: opts.fromEmail,
        topic: opts.topic || 'General',
        message: opts.message,
      }),
    });

    return { sent: true };
  } catch (err: any) {
    return { sent: false, reason: err?.message || 'SMTP send failed' };
  }
}