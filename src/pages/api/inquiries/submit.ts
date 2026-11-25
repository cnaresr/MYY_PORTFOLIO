import type { APIRoute } from 'astro';
import { getProfileData } from '../../../lib/contentStore';
import { sendContactEmail } from '../../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, topic, message } = data;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const profile = getProfileData();
    const ownerEmail = profile?.email || '';

    const id = `inq-${Date.now().toString(36)}`;
    const txId = `SSR-TX#${Date.now().toString(36).toUpperCase()}`;

    // Send a real email to the owner (address from profile.json) if SMTP is configured.
    let notify: { sent: boolean; reason?: string } = { sent: false, reason: 'SMTP not configured' };
    if (ownerEmail) {
      notify = await sendContactEmail({
        to: ownerEmail,
        fromName: name.trim(),
        fromEmail: email.trim(),
        topic: topic || 'General',
        message,
        name: name.trim(),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        inquiryId: id,
        txId,
        emailSent: notify.sent,
        emailNote: notify.sent ? 'Delivered' : (notify.reason || 'SMTP not configured'),
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Submission failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
