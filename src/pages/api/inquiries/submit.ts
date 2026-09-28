import type { APIRoute } from 'astro';
import { getInquiriesData, saveInquiriesData, getProfileData } from '../../../lib/contentStore';
import { sendContactEmail } from '../../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, topic, message } = data;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const profile = getProfileData();
    const ownerEmail = profile?.email || '';

    const inquiries = getInquiriesData();
    const txNum = (inquiries.length + 100).toString();
    const id = `inq-${Date.now().toString(36)}`;

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

    const newInquiry = {
      id,
      txId: `SSR-TX#0${txNum}`,
      sessionId: `7B-${Math.floor(1000 + Math.random() * 9000)}-TX`,
      senderName: name.trim(),
      senderRole: 'Public Visitor',
      senderEmail: email.trim(),
      verifiedDomain: false,
      topic: topic || 'General Inquiry',
      requestedStart: 'Immediate',
      estimatedScope: 'Pending Discussion',
      pgpFingerprint: '3C44 71F2 90D1 A348',
      cipherSuite: 'TLS 1.3 / AES-256-GCM',
      originIp: '127.0.0.1 (Local Client)',
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      status: notify.sent ? 'email_dispatched' : 'pending_dispatch',
      emailDelivered: notify.sent,
      emailNote: notify.sent ? `Delivered to ${ownerEmail}` : (notify.reason || 'SMTP not configured'),
      priority: 'INBOUND TRANSMISSION',
      unread: true,
      snippet: message.length > 90 ? `${message.slice(0, 87)}...` : message,
      body: message,
      taxonomy: ['#PublicDispatch', '#AstroSSR', `#${(topic || 'General').replace(/\s+/g, '')}`],
    };

    inquiries.unshift(newInquiry);
    saveInquiriesData(inquiries);

    return new Response(
      JSON.stringify({ success: true, inquiry: newInquiry, emailSent: notify.sent, emailNote: notify.reason }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Submission failed' }), { status: 500 });
  }
};
